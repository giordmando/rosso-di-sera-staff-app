import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { requireActiveStaff } from '@/lib/auth/profile';
import { writeAuditLog } from '@/lib/audit/log';
import { csvPayload, parseCsv } from '@/lib/csv/exhibitors';

export async function POST(request: Request) {
  try {
    await requireActiveStaff();
    const form = await request.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ message: 'File CSV mancante' }, { status: 400 });
    const rows = parseCsv(await file.text());
    const supabase = createSupabaseAdmin();
    const { data: edition } = await supabase.from('editions').select('id').eq('year', 2026).single();
    if (!edition) return NextResponse.json({ message: 'Edizione 2026 non configurata' }, { status: 400 });
    const { data: exhibitors } = await supabase.from('exhibitors').select('id, brand_name, email');
    const byId = new Map((exhibitors ?? []).map((item) => [String(item.id), item]));
    const byEmail = new Map((exhibitors ?? []).filter((item) => item.email).map((item) => [String(item.email).toLowerCase(), item]));
    const byBrand = new Map((exhibitors ?? []).map((item) => [String(item.brand_name).toLowerCase(), item]));
    let created = 0;
    let updated = 0;
    for (const row of rows) {
      const email = String(row.Email || row.email || '').toLowerCase();
      const brand = String(row.Cantina || row.brand_name || '').toLowerCase();
      const existing = row.ID ? byId.get(row.ID) : email ? byEmail.get(email) : byBrand.get(brand);
      const payload = csvPayload(row);
      if (existing) { await supabase.from('exhibitors').update(payload).eq('id', existing.id); updated++; }
      else { await supabase.from('exhibitors').insert({ ...payload, edition_id: edition.id }); created++; }
    }
    await writeAuditLog({ action: 'csv.import.apply', entityType: 'csv', message: 'Import espositori da CSV', metadata: { created, updated } });
    return NextResponse.json({ message: 'Import CSV completato', created, updated });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Errore import CSV' }, { status: 500 });
  }
}
