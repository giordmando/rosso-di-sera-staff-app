import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { createClient } from '@/lib/supabase/server';
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
            <dl style={{ display: 'grid', gap: 12, marginTop: 24 }}>
              <div><dt>Ragione sociale</dt><dd>{item.company_name ?? '-'}</dd></div>
              <div><dt>Referente</dt><dd>{item.contact_name ?? '-'}</dd></div>
              <div><dt>Email</dt><dd>{item.email ?? '-'}</dd></div>
              <div><dt>Telefono</dt><dd>{item.phone ?? '-'}</dd></div>
              <div><dt>Località</dt><dd>{item.city ?? '-'} {item.province ?? ''} {item.region ?? ''}</dd></div>
              <div><dt>Sito/Social</dt><dd>{item.website_social ?? '-'}</dd></div>
            </dl>
            <h2 style={{ marginTop: 28 }}>Prodotti</h2>
            <p style={{ whiteSpace: 'pre-wrap', color: 'var(--muted)' }}>{item.products ?? '-'}</p>
            <h2>Racconto azienda</h2>
            <p style={{ whiteSpace: 'pre-wrap', color: 'var(--muted)' }}>{item.company_story ?? '-'}</p>
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
