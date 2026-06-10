import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { requireActiveStaff } from '@/lib/auth/profile';
import { getSheetsClient } from '@/lib/google/sheets';

const headers = ['Cantina', 'Ragione sociale', 'Referente', 'Email', 'Telefono', 'Comune', 'Provincia', 'Regione', 'Stato', 'Prodotti', 'Note interne', 'Creato il'];

function rowToRecord(row: string[]) {
  const record: Record<string, string> = {};
  headers.forEach((header, index) => { record[header] = row[index] ?? ''; });
  return record;
}

export async function GET() {
  await requireActiveStaff();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) return NextResponse.json({ message: 'GOOGLE_SHEETS_SPREADSHEET_ID mancante' }, { status: 500 });

  const sheets = getSheetsClient();
  const supabase = createSupabaseAdmin();

  const sheet = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Espositori!A2:L' });
  const rows = sheet.data.values ?? [];

  const { data: exhibitors, error } = await supabase.from('exhibitors').select('id, brand_name, email, updated_at');
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });

  const byEmail = new Map((exhibitors ?? []).filter((item) => item.email).map((item) => [String(item.email).toLowerCase(), item]));
  const byBrand = new Map((exhibitors ?? []).map((item) => [String(item.brand_name).toLowerCase(), item]));

  const preview = rows.map((row, index) => {
    const record = rowToRecord(row as string[]);
    const email = record.Email.toLowerCase();
    const brand = record.Cantina.toLowerCase();
    const existing = email ? byEmail.get(email) : byBrand.get(brand);
    const action = existing ? 'update' : 'create';
    const conflict = existing && record['Creato il'] && existing.updated_at && new Date(existing.updated_at) > new Date(record['Creato il']);
    return { row: index + 2, action, conflict: Boolean(conflict), existingId: existing?.id ?? null, record };
  });

  return NextResponse.json({ items: preview });
}
