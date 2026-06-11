import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { requireActiveStaff } from '@/lib/auth/profile';
import { getSheetsClient } from '@/lib/google/sheets';
import { writeAuditLog } from '@/lib/audit/log';
import { getActiveEditionSheetConfig } from '@/lib/google/edition-sheet';

function value(v: unknown) { return v == null ? '' : String(v); }

async function ensureSheet(sheets: ReturnType<typeof getSheetsClient>, spreadsheetId: string, title: string) {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = spreadsheet.data.sheets?.some((sheet) => sheet.properties?.title === title);
  if (!exists) await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: [{ addSheet: { properties: { title } } }] } });
}

export async function POST() {
  try {
    await requireActiveStaff();
    const supabase = createSupabaseAdmin();
    const sheets = getSheetsClient();
    const { edition, spreadsheetId, exhibitorsSheet, paymentsSheet } = await getActiveEditionSheetConfig();
    await ensureSheet(sheets, spreadsheetId, exhibitorsSheet);
    await ensureSheet(sheets, spreadsheetId, paymentsSheet);
    const { data: exhibitors, error: exhibitorsError } = await supabase.from('exhibitors').select('id, brand_name, company_name, contact_name, email, phone, city, province, region, status, products, internal_notes, created_at, updated_at').eq('edition_id', edition.id).order('created_at', { ascending: false });
    if (exhibitorsError) return NextResponse.json({ message: exhibitorsError.message }, { status: 400 });
    const { data: payments, error: paymentsError } = await supabase.from('payments').select('id, paid_amount, expected_amount, payment_method, payment_date, receipt_received, notes, created_at, exhibitors!inner(brand_name, email, edition_id)').eq('exhibitors.edition_id', edition.id).order('created_at', { ascending: false });
    if (paymentsError) return NextResponse.json({ message: paymentsError.message }, { status: 400 });
    const exhibitorValues = [['ID', 'Cantina', 'Ragione sociale', 'Referente', 'Email', 'Telefono', 'Comune', 'Provincia', 'Regione', 'Stato', 'Prodotti', 'Note interne', 'Creato il', 'Aggiornato il'], ...(exhibitors ?? []).map((item) => [item.id, item.brand_name, item.company_name, item.contact_name, item.email, item.phone, item.city, item.province, item.region, item.status, item.products, item.internal_notes, item.created_at, item.updated_at].map(value))];
    const paymentValues = [['ID', 'Cantina', 'Email', 'Importo pagato', 'Quota prevista', 'Metodo', 'Data pagamento', 'Ricevuta', 'Note', 'Creato il'], ...(payments ?? []).map((item: any) => [item.id, item.exhibitors?.brand_name, item.exhibitors?.email, item.paid_amount, item.expected_amount, item.payment_method, item.payment_date, item.receipt_received ? 'Si' : 'No', item.notes, item.created_at].map(value))];
    await sheets.spreadsheets.values.clear({ spreadsheetId, range: `${exhibitorsSheet}!A:Z` });
    await sheets.spreadsheets.values.clear({ spreadsheetId, range: `${paymentsSheet}!A:Z` });
    await sheets.spreadsheets.values.update({ spreadsheetId, range: `${exhibitorsSheet}!A1`, valueInputOption: 'RAW', requestBody: { values: exhibitorValues } });
    await sheets.spreadsheets.values.update({ spreadsheetId, range: `${paymentsSheet}!A1`, valueInputOption: 'RAW', requestBody: { values: paymentValues } });
    await writeAuditLog({ action: 'google_sheet.export', entityType: 'google_sheet', entityId: spreadsheetId, message: 'Esportati dati su Google Sheet', metadata: { editionId: edition.id, editionName: edition.name, exhibitors: exhibitors?.length ?? 0, payments: payments?.length ?? 0 } });
    return NextResponse.json({ message: `Google Sheet aggiornato per ${edition.name}`, exhibitors: exhibitors?.length ?? 0, payments: payments?.length ?? 0 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Errore esportazione Google Sheet' }, { status: 500 });
  }
}
