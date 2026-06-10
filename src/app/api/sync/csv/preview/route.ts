import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { requireActiveStaff } from '@/lib/auth/profile';
import { parseCsv } from '@/lib/csv/exhibitors';

export async function POST(request: Request) {
  try {
    await requireActiveStaff();
    const form = await request.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ message: 'File CSV mancante' }, { status: 400 });
    const rows = parseCsv(await file.text());
    const supabase = createSupabaseAdmin();
    const { data: exhibitors, error } = await supabase.from('exhibitors').select('id, brand_name, email, updated_at');
    if (error) return NextResponse.json({ message: error.message }, { status: 400 });
    const byId = new Map((exhibitors ?? []).map((item) => [String(item.id), item]));
    const byEmail = new Map((exhibitors ?? []).filter((item) => item.email).map((item) => [String(item.email).toLowerCase(), item]));
    const byBrand = new Map((exhibitors ?? []).map((item) => [String(item.brand_name).toLowerCase(), item]));
    const items = rows.map((row, index) => {
      const email = String(row.Email || row.email || '').toLowerCase();
      const brand = String(row.Cantina || row.brand_name || '').toLowerCase();
      const existing = row.ID ? byId.get(row.ID) : email ? byEmail.get(email) : byBrand.get(brand);
      return { row: index + 2, action: existing ? 'update' : 'create', existingId: existing?.id ?? null, record: row };
    });
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Errore anteprima CSV' }, { status: 500 });
  }
}
