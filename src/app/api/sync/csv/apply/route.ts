import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { requireActiveStaff } from '@/lib/auth/profile';
import { writeAuditLog } from '@/lib/audit/log';
import { getActiveEdition } from '@/lib/editions/active';
import { csvPayload, parseImportFile } from '@/lib/csv/exhibitors';

export const runtime = 'nodejs';

function norm(value: unknown) {
  return String(value ?? '').trim().toLowerCase();
}

function fileKey(row: Record<string, string>) {
  const id = norm(row.ID);
  const email = norm(row.Email || row.email);
  const email2 = norm(row['EMAIL 2']);
  const brand = norm(row.Cantina || row.brand_name);
  if (id) return `id:${id}`;
  if (email) return `email:${email}`;
  if (email2) return `email:${email2}`;
  if (brand) return `brand:${brand}`;
  return '';
}

export async function POST(request: Request) {
  try {
    await requireActiveStaff();
    const form = await request.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ message: 'File CSV o Excel mancante' }, { status: 400 });
    const rows = await parseImportFile(file);
    const supabase = createSupabaseAdmin();
    const edition = await getActiveEdition();
    const { data: exhibitors } = await supabase.from('exhibitors').select('id, brand_name, email').eq('edition_id', edition.id);
    const byId = new Map((exhibitors ?? []).map((item) => [String(item.id), item]));
    const byEmail = new Map((exhibitors ?? []).filter((item) => item.email).map((item) => [String(item.email).toLowerCase(), item]));
    const byBrand = new Map((exhibitors ?? []).filter((item) => item.brand_name).map((item) => [String(item.brand_name).trim().toLowerCase(), item]));
    const seen = new Set<string>();
    let created = 0;
    let updated = 0;
    let skippedDuplicates = 0;
    for (const row of rows) {
      const key = fileKey(row);
      if (key && seen.has(key)) { skippedDuplicates++; continue; }
      if (key) seen.add(key);
      const email = norm(row.Email || row.email);
      const email2 = norm(row['EMAIL 2']);
      const brand = norm(row.Cantina || row.brand_name);
      const existing = row.ID ? byId.get(row.ID) : email ? byEmail.get(email) : email2 ? byEmail.get(email2) : brand ? byBrand.get(brand) : null;
      const payload = csvPayload(row);
      if (existing) {
        await supabase.from('exhibitors').update(payload).eq('id', existing.id);
        updated++;
      } else {
        const { data: inserted } = await supabase.from('exhibitors').insert({ ...payload, edition_id: edition.id }).select('id, brand_name, email').single();
        if (inserted) {
          byId.set(String(inserted.id), inserted);
          if (inserted.email) byEmail.set(String(inserted.email).toLowerCase(), inserted);
          if (inserted.brand_name) byBrand.set(String(inserted.brand_name).trim().toLowerCase(), inserted);
        }
        created++;
      }
    }
    await writeAuditLog({ action: 'import.apply', entityType: 'file', message: 'Import espositori da CSV/Excel', metadata: { created, updated, skippedDuplicates, fileName: file.name, editionId: edition.id } });
    return NextResponse.json({ message: 'Import completato', created, updated, skippedDuplicates });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Errore import' }, { status: 500 });
  }
}
