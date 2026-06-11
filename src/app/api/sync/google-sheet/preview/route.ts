import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { requireActiveStaff } from '@/lib/auth/profile';
import { getSheetsClient } from '@/lib/google/sheets';
import { getActiveEditionSheetConfig } from '@/lib/google/edition-sheet';

const headers = ['ID', 'Cantina', 'Ragione sociale', 'Referente', 'Email', 'Telefono', 'Comune', 'Provincia', 'Regione', 'Stato', 'Prodotti', 'Note interne', 'Creato il', 'Aggiornato il'];

function rowToRecord(row: string[]) {
  const record: Record<string, string> = {};
  headers.forEach((header, index) => { record[header] = row[index] ?? ''; });
  return record;
}

export async function GET() {
  try {
    await requireActiveStaff();
    const sheets = getSheetsClient();
    const supabase = createSupabaseAdmin();
    const { edition, spreadsheetId, exhibitorsSheet } = await getActiveEditionSheetConfig();
    const sheet = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${exhibitorsSheet}!A2:N` });
    const rows = sheet.data.values ?? [];
    const { data: exhibitors, error } = await supabase.from('exhibitors').select('id, brand_name, email, updated_at').eq('edition_id', edition.id);
    if (error) return NextResponse.json({ message: error.message }, { status: 400 });
    const byId = new Map((exhibitors ?? []).map((item) => [String(item.id), item]));
    const byEmail = new Map((exhibitors ?? []).filter((item) => item.email).map((item) => [String(item.email).toLowerCase(), item]));
    const byBrand = new Map((exhibitors ?? []).map((item) => [String(item.brand_name).toLowerCase(), item]));
    const preview = rows.map((row, index) => {
      const record = rowToRecord(row as string[]);
      const existing = record.ID ? byId.get(record.ID) : record.Email ? byEmail.get(record.Email.toLowerCase()) : byBrand.get(record.Cantina.toLowerCase());
      const action = existing ? 'update' : 'create';
      const sheetUpdated = record['Aggiornato il'] || record['Creato il'];
      const conflict = existing && sheetUpdated && existing.updated_at && new Date(existing.updated_at) > new Date(sheetUpdated);
      return { row: index + 2, action, conflict: Boolean(conflict), existingId: existing?.id ?? null, record };
    });
    return NextResponse.json({ items: preview, edition: { id: edition.id, name: edition.name, year: edition.year } });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Errore durante la lettura del Google Sheet' }, { status: 500 });
  }
}
