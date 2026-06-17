import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { requireActiveStaff } from '@/lib/auth/profile';
import { getActiveEdition } from '@/lib/editions/active';
import { parseImportFile } from '@/lib/csv/exhibitors';

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
    const { data: exhibitors, error } = await supabase.from('exhibitors').select('id, brand_name, email, updated_at').eq('edition_id', edition.id);
    if (error) return NextResponse.json({ message: error.message }, { status: 400 });
    const byId = new Map((exhibitors ?? []).map((item) => [String(item.id), item]));
    const byEmail = new Map((exhibitors ?? []).filter((item) => item.email).map((item) => [String(item.email).toLowerCase(), item]));
    const byBrand = new Map((exhibitors ?? []).filter((item) => item.brand_name).map((item) => [String(item.brand_name).trim().toLowerCase(), item]));
    const seen = new Map<string, number>();
    const items = rows.map((row, index) => {
      const key = fileKey(row);
      const firstSeenRow = key ? seen.get(key) : undefined;
      if (key && firstSeenRow === undefined) seen.set(key, index + 2);
      const email = norm(row.Email || row.email);
      const email2 = norm(row['EMAIL 2']);
      const brand = norm(row.Cantina || row.brand_name);
      const existing = row.ID ? byId.get(row.ID) : email ? byEmail.get(email) : email2 ? byEmail.get(email2) : brand ? byBrand.get(brand) : null;
      return {
        row: index + 2,
        action: firstSeenRow !== undefined ? 'duplicate' : existing ? 'update' : 'create',
        duplicateOfRow: firstSeenRow ?? null,
        existingId: existing?.id ?? null,
        record: row,
      };
    });
    return NextResponse.json({ items, duplicateCount: items.filter((item) => item.action === 'duplicate').length, edition });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Errore anteprima import' }, { status: 500 });
  }
}
