import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { requireActiveStaff } from '@/lib/auth/profile';
import { getSheetsClient } from '@/lib/google/sheets';
import { writeAuditLog } from '@/lib/audit/log';
import { normalizeProvince, normalizeRegion } from '@/lib/geo/normalize';
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

function toPayload(record: Record<string, string>) {
  return {
    brand_name: record.Cantina || 'Senza nome',
    company_name: record['Ragione sociale'] || null,
    contact_name: record.Referente || null,
    email: record.Email || null,
    phone: record.Telefono || null,
    city: record.Comune || null,
    province: normalizeProvince(record.Provincia),
    region: normalizeRegion(record.Regione),
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
  const sheets = getSheetsClient();
  const supabase = createSupabaseAdmin();
  const { edition, spreadsheetId, exhibitorsSheet } = await getActiveEditionSheetConfig();
  const sheet = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${exhibitorsSheet}!A2:N` });
  const rows = sheet.data.values ?? [];
  const { data: exhibitors } = await supabase.from('exhibitors').select('id, brand_name, company_name, email, updated_at').eq('edition_id', edition.id);
  const byId = new Map((exhibitors ?? []).map((item) => [String(item.id), item]));
  const byEmail = new Map((exhibitors ?? []).filter((item) => item.email).map((item) => [norm(item.email), item]));
  const byCompany = new Map((exhibitors ?? []).filter((item) => item.company_name).map((item) => [norm(item.company_name), item]));
  const byBrand = new Map((exhibitors ?? []).filter((item) => item.brand_name).map((item) => [norm(item.brand_name), item]));
  const seen = new Set<string>();
  let created = 0;
  let updated = 0;
  let skippedConflicts = 0;
  let skippedDuplicates = 0;
  for (const row of rows) {
    const record = rowToRecord(row as string[]);
    if (!record.Cantina && !record.Email && !record['Ragione sociale']) continue;
    const key = sheetKey(record);
    if (key && seen.has(key)) { skippedDuplicates++; continue; }
    if (key) seen.add(key);
    const existing = record.ID ? byId.get(record.ID) : record.Email ? byEmail.get(norm(record.Email)) : record['Ragione sociale'] ? byCompany.get(norm(record['Ragione sociale'])) : byBrand.get(norm(record.Cantina));
    const sheetDate = record['Aggiornato il'] || record['Creato il'];
    const isConflict = existing && sheetDate && existing.updated_at && new Date(existing.updated_at) > new Date(sheetDate);
    if (isConflict && !overwriteConflicts) { skippedConflicts++; continue; }
    const payload = toPayload(record);
    if (existing) {
      await supabase.from('exhibitors').update(payload).eq('id', existing.id);
      updated++;
    } else {
      const { data: inserted } = await supabase.from('exhibitors').insert({ ...payload, edition_id: edition.id }).select('id, brand_name, company_name, email, updated_at').single();
      if (inserted) {
        byId.set(String(inserted.id), inserted);
        if (inserted.email) byEmail.set(norm(inserted.email), inserted);
        if (inserted.company_name) byCompany.set(norm(inserted.company_name), inserted);
        if (inserted.brand_name) byBrand.set(norm(inserted.brand_name), inserted);
      }
      created++;
    }
  }
  await writeAuditLog({ action: 'google_sheet.import.apply', entityType: 'google_sheet', entityId: spreadsheetId, message: 'Applicato import Google Sheet', metadata: { created, updated, skippedConflicts, skippedDuplicates, overwriteConflicts, editionId: edition.id } });
  return NextResponse.json({ message: 'Import completato', created, updated, skippedConflicts, skippedDuplicates });
}
