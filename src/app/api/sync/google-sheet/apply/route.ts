import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { requireActiveStaff } from '@/lib/auth/profile';
import { getSheetsClient } from '@/lib/google/sheets';

const headers = ['ID', 'Cantina', 'Ragione sociale', 'Referente', 'Email', 'Telefono', 'Comune', 'Provincia', 'Regione', 'Stato', 'Prodotti', 'Note interne', 'Creato il', 'Aggiornato il'];

function rowToRecord(row: string[]) {
  const record: Record<string, string> = {};
  headers.forEach((header, index) => { record[header] = row[index] ?? ''; });
  return record;
}

function toPayload(record: Record<string, string>) {
  return {
    brand_name: record.Cantina || 'Senza nome',
    company_name: record['Ragione sociale'] || null,
    contact_name: record.Referente || null,
    email: record.Email || null,
    phone: record.Telefono || null,
    city: record.Comune || null,
    province: record.Provincia || null,
    region: record.Regione || null,
    status: record.Stato || 'candidatura_ricevuta',
    products: record.Prodotti || null,
    internal_notes: record['Note interne'] || null,
    updated_at: new Date().toISOString(),
  };
}

export async function POST(request: Request) {
  await requireActiveStaff();
  const body = await request.json().catch(() => ({}));
  const overwriteConflicts = Boolean(body.overwriteConflicts);
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) return NextResponse.json({ message: 'GOOGLE_SHEETS_SPREADSHEET_ID mancante' }, { status: 500 });

  const sheets = getSheetsClient();
  const supabase = createSupabaseAdmin();
  const sheet = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Espositori!A2:N' });
  const rows = sheet.data.values ?? [];

  const { data: edition } = await supabase.from('editions').select('id').eq('year', 2026).single();
  if (!edition) return NextResponse.json({ message: 'Edizione 2026 non configurata' }, { status: 400 });

  const { data: exhibitors } = await supabase.from('exhibitors').select('id, brand_name, email, updated_at');
  const byId = new Map((exhibitors ?? []).map((item) => [String(item.id), item]));
  const byEmail = new Map((exhibitors ?? []).filter((item) => item.email).map((item) => [String(item.email).toLowerCase(), item]));
  const byBrand = new Map((exhibitors ?? []).map((item) => [String(item.brand_name).toLowerCase(), item]));

  let created = 0;
  let updated = 0;
  let skippedConflicts = 0;

  for (const row of rows) {
    const record = rowToRecord(row as string[]);
    if (!record.Cantina && !record.Email) continue;
    const existing = record.ID ? byId.get(record.ID) : record.Email ? byEmail.get(record.Email.toLowerCase()) : byBrand.get(record.Cantina.toLowerCase());
    const sheetDate = record['Aggiornato il'] || record['Creato il'];
    const isConflict = existing && sheetDate && existing.updated_at && new Date(existing.updated_at) > new Date(sheetDate);
    if (isConflict && !overwriteConflicts) { skippedConflicts++; continue; }

    const payload = toPayload(record);
    if (existing) {
      await supabase.from('exhibitors').update(payload).eq('id', existing.id);
      updated++;
    } else {
      await supabase.from('exhibitors').insert({ ...payload, edition_id: edition.id });
      created++;
    }
  }

  return NextResponse.json({ message: 'Import completato', created, updated, skippedConflicts });
}
