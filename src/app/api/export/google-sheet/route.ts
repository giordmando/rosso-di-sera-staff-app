import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { requireActiveStaff } from '@/lib/auth/profile';
import { getSheetsClient } from '@/lib/google/sheets';

function value(v: unknown) {
  return v == null ? '' : String(v);
}

export async function POST() {
  await requireActiveStaff();

  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) return NextResponse.json({ message: 'GOOGLE_SHEETS_SPREADSHEET_ID mancante' }, { status: 500 });

  const supabase = createSupabaseAdmin();
  const sheets = getSheetsClient();

  const { data: exhibitors, error: exhibitorsError } = await supabase
    .from('exhibitors')
    .select('brand_name, company_name, contact_name, email, phone, city, province, region, status, products, internal_notes, created_at')
    .order('created_at', { ascending: false });

  if (exhibitorsError) return NextResponse.json({ message: exhibitorsError.message }, { status: 400 });

  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('paid_amount, expected_amount, payment_method, payment_date, receipt_received, notes, created_at, exhibitors(brand_name, email)')
    .order('created_at', { ascending: false });

  if (paymentsError) return NextResponse.json({ message: paymentsError.message }, { status: 400 });

  const exhibitorValues = [
    ['Cantina', 'Ragione sociale', 'Referente', 'Email', 'Telefono', 'Comune', 'Provincia', 'Regione', 'Stato', 'Prodotti', 'Note interne', 'Creato il'],
    ...(exhibitors ?? []).map((item) => [item.brand_name, item.company_name, item.contact_name, item.email, item.phone, item.city, item.province, item.region, item.status, item.products, item.internal_notes, item.created_at].map(value)),
  ];

  const paymentValues = [
    ['Cantina', 'Email', 'Importo pagato', 'Quota prevista', 'Metodo', 'Data pagamento', 'Ricevuta', 'Note', 'Creato il'],
    ...(payments ?? []).map((item: any) => [item.exhibitors?.brand_name, item.exhibitors?.email, item.paid_amount, item.expected_amount, item.payment_method, item.payment_date, item.receipt_received ? 'Si' : 'No', item.notes, item.created_at].map(value)),
  ];

  await sheets.spreadsheets.values.clear({ spreadsheetId, range: 'Espositori!A:Z' });
  await sheets.spreadsheets.values.clear({ spreadsheetId, range: 'Pagamenti!A:Z' });

  await sheets.spreadsheets.values.update({ spreadsheetId, range: 'Espositori!A1', valueInputOption: 'RAW', requestBody: { values: exhibitorValues } });
  await sheets.spreadsheets.values.update({ spreadsheetId, range: 'Pagamenti!A1', valueInputOption: 'RAW', requestBody: { values: paymentValues } });

  return NextResponse.json({ message: 'Google Sheet aggiornato correttamente' });
}
