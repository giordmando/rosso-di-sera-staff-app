import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: exhibitors } = await supabase.from('exhibitors').select('id, status');
  const { data: payments } = await supabase.from('payments').select('paid_amount');

  const total = exhibitors?.length ?? 0;
  const confirmed = exhibitors?.filter((item) => item.status === 'confermato').length ?? 0;
  const pendingPayment = exhibitors?.filter((item) => item.status === 'in_attesa_pagamento').length ?? 0;
  const received = exhibitors?.filter((item) => item.status === 'candidatura_ricevuta').length ?? 0;
  const paid = payments?.reduce((sum, item) => sum + Number(item.paid_amount ?? 0), 0) ?? 0;
  const maxExhibitors = 45;

  const stats = [
    { label: 'Espositori', value: String(total) },
    { label: 'Candidature ricevute', value: String(received) },
    { label: 'Confermati', value: String(confirmed) },
    { label: 'In attesa pagamento', value: String(pendingPayment) },
    { label: 'Posti disponibili', value: String(Math.max(maxExhibitors - total, 0)) },
    { label: 'Incassato', value: `€ ${paid.toFixed(2)}` },
  ];

  return (
    <main>
      <AppHeader />
      <div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'center', marginBottom: 32 }}>
          <div>
            <p style={{ color: 'var(--wine)', fontWeight: 800 }}>ROSSO DI SERA 2026</p>
            <h1 style={{ margin: 0 }}>Dashboard staff</h1>
          </div>
          <nav style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link className="btn btn-secondary" href="/espositori">Espositori</Link>
            <Link className="btn btn-secondary" href="/pagamenti">Pagamenti</Link>
            <Link className="btn btn-primary" href="/candidatura">Nuova candidatura</Link>
          </nav>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
          {stats.map((item) => (
            <div className="card" key={item.label}>
              <p style={{ color: 'var(--muted)' }}>{item.label}</p>
              <strong style={{ fontSize: 36, color: 'var(--wine)' }}>{item.value}</strong>
            </div>
          ))}
        </section>

        <section className="card" style={{ marginTop: 28 }}>
          <h2>Operativita</h2>
          <ul style={{ lineHeight: 2 }}>
            <li>Valuta le candidature ricevute.</li>
            <li>Aggiorna stato e note degli espositori.</li>
            <li>Registra pagamenti dalla scheda espositore.</li>
            <li>Monitora posti disponibili e incasso.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
