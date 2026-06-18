import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { requireActiveStaff } from '@/lib/auth/profile';
import { getActiveEdition } from '@/lib/editions/active';

function csv(value: unknown) {
  const text = String(value ?? '').replaceAll('"', '""');
  return `"${text}"`;
}

export async function GET() {
  await requireActiveStaff();
  const edition = await getActiveEdition();
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('exhibitors')
    .select(
      'brand_name, company_name, contact_name, email, phone, city, province, region, status, products, internal_notes, created_at'
    )
    .eq('edition_id', edition.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ message: error.message }, { status: 400 });

  const header = ['Cantina', 'Ragione sociale', 'Referente', 'Email', 'Telefono', 'Comune', 'Provincia', 'Regione', 'Stato', 'Prodotti', 'Note interne', 'Creato il'];
  const rows = (data ?? []).map((item) => [item.brand_name, item.company_name, item.contact_name, item.email, item.phone, item.city, item.province, item.region, item.status, item.products, item.internal_notes, item.created_at]);
  const body = [header, ...rows].map((row) => row.map(csv).join(';')).join('\n');

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="espositori-rosso-di-sera.csv"',
    },
  });
}
