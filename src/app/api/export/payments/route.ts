import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { requireActiveStaff } from '@/lib/auth/profile';

function csv(value: unknown) {
  const text = String(value ?? '').replaceAll('"', '""');
  return `"${text}"`;
}

export async function GET() {
  await requireActiveStaff();
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('payments')
    .select('paid_amount, expected_amount, payment_method, payment_date, receipt_received, notes, created_at, exhibitors(brand_name, email)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ message: error.message }, { status: 400 });

  const header = ['Cantina', 'Email', 'Importo pagato', 'Quota prevista', 'Metodo', 'Data pagamento', 'Ricevuta', 'Note', 'Creato il'];
  const rows = (data ?? []).map((item: any) => [item.exhibitors?.brand_name, item.exhibitors?.email, item.paid_amount, item.expected_amount, item.payment_method, item.payment_date, item.receipt_received ? 'Si' : 'No', item.notes, item.created_at]);
  const body = [header, ...rows].map((row) => row.map(csv).join(';')).join('\n');

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="pagamenti-rosso-di-sera.csv"',
    },
  });
}
