import { AppHeader } from '@/components/AppHeader';
import { GoogleSheetExportButton } from '@/components/GoogleSheetExportButton';
import { createClient } from '@/lib/supabase/server';

type PaymentRow = {
  id: string;
  expected_amount: number;
  paid_amount: number;
  payment_date: string | null;
  payment_method: string | null;
  exhibitors: { brand_name: string }[] | { brand_name: string } | null;
};

function getExhibitorName(exhibitors: PaymentRow['exhibitors']) {
  if (!exhibitors) return '-';
  if (Array.isArray(exhibitors)) return exhibitors[0]?.brand_name ?? '-';
  return exhibitors.brand_name ?? '-';
}

export default async function PaymentsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('payments')
    .select('id, expected_amount, paid_amount, payment_date, payment_method, exhibitors(brand_name)')
    .order('created_at', { ascending: false });

  const payments = (data ?? []) as unknown as PaymentRow[];
  const expected = payments.reduce((sum, item) => sum + Number(item.expected_amount ?? 0), 0);
  const paid = payments.reduce((sum, item) => sum + Number(item.paid_amount ?? 0), 0);

  return (
    <main>
      <AppHeader />
      <div className="container" style={{ paddingTop: 36, paddingBottom: 36 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 24 }}>
          <div><p style={{ color: 'var(--wine)', fontWeight: 800 }}>GESTIONE</p><h1 style={{ margin: 0 }}>Pagamenti</h1></div>
          <nav style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}><GoogleSheetExportButton /><a href="/api/export/payments" className="btn btn-secondary">Esporta CSV</a></nav>
        </header>
        {error ? <div className="card" style={{ color: 'var(--wine)', marginBottom: 24 }}>Errore caricamento: {error.message}</div> : null}
        <section className="grid grid-2" style={{ marginBottom: 24 }}><div className="card"><p>Incasso previsto registrato</p><strong style={{ fontSize: 36 }}>€ {expected.toFixed(2)}</strong></div><div className="card"><p>Incassato</p><strong style={{ fontSize: 36, color: 'var(--wine)' }}>€ {paid.toFixed(2)}</strong></div></section>
        <section className="card" style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ textAlign: 'left', color: 'var(--muted)' }}><th style={{ padding: 12 }}>Espositore</th><th style={{ padding: 12 }}>Previsto</th><th style={{ padding: 12 }}>Pagato</th><th style={{ padding: 12 }}>Metodo</th><th style={{ padding: 12 }}>Data</th></tr></thead><tbody>{payments.map((item) => <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}><td style={{ padding: 12 }}>{getExhibitorName(item.exhibitors)}</td><td style={{ padding: 12 }}>€ {Number(item.expected_amount).toFixed(2)}</td><td style={{ padding: 12 }}>€ {Number(item.paid_amount).toFixed(2)}</td><td style={{ padding: 12 }}>{item.payment_method ?? '-'}</td><td style={{ padding: 12 }}>{item.payment_date ?? '-'}</td></tr>)}{payments.length === 0 ? <tr><td colSpan={5} style={{ padding: 24, color: 'var(--muted)' }}>Nessun pagamento registrato.</td></tr> : null}</tbody></table></section>
      </div>
    </main>
  );
}
