import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { createClient } from '@/lib/supabase/server';
import { EXHIBITOR_STATUSES } from '@/lib/constants';
import { updateExhibitor } from '@/lib/actions/exhibitors';
import { PaymentForm } from './PaymentForm';

export default async function ExhibitorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: item } = await supabase.from('exhibitors').select('*').eq('id', id).single();
  if (!item) notFound();

  const { data: payments } = await supabase.from('payments').select('*').eq('exhibitor_id', id).order('created_at', { ascending: false });
  const paymentRows = payments ?? [];
  const paidTotal = paymentRows.reduce((sum, row) => sum + Number(row.paid_amount ?? 0), 0);
  const expectedAmount = 183;

  return (
    <main>
      <AppHeader />
      <div className="container" style={{ paddingTop: 36, paddingBottom: 36 }}>
        <Link href="/espositori" style={{ color: 'var(--wine)', fontWeight: 700 }}>Torna agli espositori</Link>
        <div className="grid grid-2" style={{ marginTop: 24 }}>
          <section className="card">
            <p style={{ color: 'var(--wine)', fontWeight: 800 }}>SCHEDA ESPOSITORE</p>
            <h1>{item.brand_name}</h1>
            <StatusBadge status={item.status} />

            <form action={updateExhibitor} style={{ display: 'grid', gap: 14, marginTop: 24 }}>
              <input type="hidden" name="id" value={item.id} />
              <label>Stato
                <select name="status" defaultValue={item.status} style={inputStyle}>
                  {EXHIBITOR_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                </select>
              </label>
              <label>Nome azienda / cantina<input name="brand_name" defaultValue={item.brand_name ?? ''} required style={inputStyle} /></label>
              <label>Ragione sociale<input name="company_name" defaultValue={item.company_name ?? ''} style={inputStyle} /></label>
              <div className="grid grid-2">
                <label>Referente<input name="contact_name" defaultValue={item.contact_name ?? ''} style={inputStyle} /></label>
                <label>Email<input name="email" defaultValue={item.email ?? ''} style={inputStyle} /></label>
              </div>
              <div className="grid grid-2">
                <label>Telefono<input name="phone" defaultValue={item.phone ?? ''} style={inputStyle} /></label>
                <label>Provincia<input name="province" defaultValue={item.province ?? ''} style={inputStyle} /></label>
              </div>
              <div className="grid grid-2">
                <label>Comune<input name="city" defaultValue={item.city ?? ''} style={inputStyle} /></label>
                <label>Regione<input name="region" defaultValue={item.region ?? ''} style={inputStyle} /></label>
              </div>
              <label>Prodotti<textarea name="products" defaultValue={item.products ?? ''} rows={4} style={inputStyle} /></label>
              <label>Racconto azienda<textarea name="company_story" defaultValue={item.company_story ?? ''} rows={4} style={inputStyle} /></label>
              <label>Note interne<textarea name="internal_notes" defaultValue={item.internal_notes ?? ''} rows={4} style={inputStyle} /></label>
              <button className="btn btn-primary" type="submit">Salva modifiche</button>
            </form>
          </section>
          <section className="card">
            <h2>Pagamenti</h2>
            <p>Quota prevista: <strong>€ {expectedAmount.toFixed(2)}</strong></p>
            <p>Totale pagato: <strong>€ {paidTotal.toFixed(2)}</strong></p>
            <PaymentForm exhibitorId={item.id} expectedAmount={expectedAmount} />
            <h3 style={{ marginTop: 28 }}>Storico</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {paymentRows.map((payment) => (
                <div key={payment.id} style={{ border: '1px solid var(--border)', borderRadius: 14, padding: 12 }}>
                  <strong>€ {Number(payment.paid_amount).toFixed(2)}</strong><br />
                  <span style={{ color: 'var(--muted)' }}>{payment.payment_date ?? '-'} - {payment.payment_method ?? '-'}</span>
                </div>
              ))}
              {paymentRows.length === 0 ? <p style={{ color: 'var(--muted)' }}>Nessun pagamento registrato.</p> : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: 8,
  padding: 12,
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: 'white',
};
