import { AppHeader } from '@/components/AppHeader';
import { GoogleSheetExportButton } from '@/components/GoogleSheetExportButton';
import { createClient } from '@/lib/supabase/server';

type PaymentRow = { id: string; expected_amount: number; paid_amount: number; payment_date: string | null; payment_method: string | null; exhibitors: { brand_name: string }[] | { brand_name: string } | null };
function getExhibitorName(exhibitors: PaymentRow['exhibitors']) { if (!exhibitors) return '-'; if (Array.isArray(exhibitors)) return exhibitors[0]?.brand_name ?? '-'; return exhibitors.brand_name ?? '-'; }

export default async function PaymentsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('payments').select('id, expected_amount, paid_amount, payment_date, payment_method, exhibitors(brand_name)').order('created_at', { ascending: false });
  const payments = (data ?? []) as unknown as PaymentRow[];
  const expected = payments.reduce((sum, item) => sum + Number(item.expected_amount ?? 0), 0);
  const paid = payments.reduce((sum, item) => sum + Number(item.paid_amount ?? 0), 0);
  const missing = Math.max(expected - paid, 0);

  return <main><AppHeader /><div className="container page"><header className="page-header"><div><p className="eyebrow">Gestione</p><h1 className="page-title">Pagamenti</h1><p className="muted">Monitora quote previste, incassato e pagamenti registrati dagli espositori.</p></div><nav className="toolbar"><GoogleSheetExportButton /><a href="/api/export/payments" className="btn btn-secondary">Esporta CSV</a></nav></header>
    {error ? <div className="card" style={{ color: 'var(--wine)', marginBottom: 24 }}>Errore caricamento: {error.message}</div> : null}
    <section className="grid grid-3" style={{ marginBottom: 24 }}><div className="card"><p className="muted">Incasso previsto</p><strong className="stat-value">€ {expected.toFixed(2)}</strong></div><div className="card"><p className="muted">Incassato</p><strong className="stat-value">€ {paid.toFixed(2)}</strong></div><div className="card"><p className="muted">Da incassare</p><strong className="stat-value">€ {missing.toFixed(2)}</strong></div></section>
    <section className="card table-wrap"><table className="table"><thead><tr><th>Espositore</th><th>Previsto</th><th>Pagato</th><th>Metodo</th><th>Data</th></tr></thead><tbody>{payments.map((item) => <tr key={item.id}><td><strong>{getExhibitorName(item.exhibitors)}</strong></td><td>€ {Number(item.expected_amount).toFixed(2)}</td><td><strong style={{ color: 'var(--wine)' }}>€ {Number(item.paid_amount).toFixed(2)}</strong></td><td>{item.payment_method ?? '-'}</td><td>{item.payment_date ?? '-'}</td></tr>)}{payments.length === 0 ? <tr><td colSpan={5} className="muted">Nessun pagamento registrato.</td></tr> : null}</tbody></table></section>
  </div></main>;
}
