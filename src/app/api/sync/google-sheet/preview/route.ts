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

function norm(value: unknown) {
  return String(value ?? '').trim().toLowerCase();
}

function sheetKey(record: Record<string, string>) {
  const id = norm(record.ID);
  const email = norm(record.Email);
  const company = norm(record['Ragione sociale']);
  const brand = norm(record.Cantina);
  if (id) return `id:${id}`;
  if (email) return `email:${email}`;
  if (company) return `company:${company}`;
  if (brand) return `brand:${brand}`;
  return '';
}

export async function GET() {
  try {
    await requireActiveStaff();
    const sheets = getSheetsClient();
    const supabase = createSupabaseAdmin();
    const { edition, spreadsheetId, exhibitorsSheet } = await getActiveEditionSheetConfig();
    const sheet = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${exhibitorsSheet}!A2:N` });
    const rows = sheet.data.values ?? [];
    const { data: exhibitors, error } = await supabase.from('exhibitors').select('id, brand_name, company_name, email, updated_at').eq('edition_id', edition.id);
    if (error) return NextResponse.json({ message: error.message }, { status: 400 });
    const byId = new Map((exhibitors ?? []).map((item) => [String(item.id), item]));
    const byEmail = new Map((exhibitors ?? []).filter((item) => item.email).map((item) => [norm(item.email), item]));
    const byCompany = new Map((exhibitors ?? []).filter((item) => item.company_name).map((item) => [norm(item.company_name), item]));
    const byBrand = new Map((exhibitors ?? []).filter((item) => item.brand_name).map((item) => [norm(item.brand_name), item]));
    const seen = new Map<string, number>();
    const preview = rows.map((row, index) => {
      const record = rowToRecord(row as string[]);
      const key = sheetKey(record);
      const firstSeenRow = key ? seen.get(key) : undefined;
      if (key && firstSeenRow === undefined) seen.set(key, index + 2);
      const existing = record.ID ? byId.get(record.ID) : record.Email ? byEmail.get(norm(record.Email)) : record['Ragione sociale'] ? byCompany.get(norm(record['Ragione sociale'])) : byBrand.get(norm(record.Cantina));
      const sheetUpdated = record['Aggiornato il'] || record['Creato il'];
      const conflict = existing && sheetUpdated && existing.updated_at && new Date(existing.updated_at) > new Date(sheetUpdated);
      return { row: index + 2, action: firstSeenRow !== undefined ? 'duplicate' : existing ? 'update' : 'create', conflict: Boolean(conflict), duplicateOfRow: firstSeenRow ?? null, existingId: existing?.id ?? null, record };
    });
    return NextResponse.json({ items: preview, duplicateCount: preview.filter((item) => item.action === 'duplicate').length, edition: { id: edition.id, name: edition.name, year: edition.year } });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? 'Errore durante la lettura del Google Sheet' : 'Errore durante la lettura del Google Sheet' }, { status: 500 });
  }
}
