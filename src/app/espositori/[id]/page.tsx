import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { StatusBadge } from '@/components/StatusBadge';

export default function ExhibitorDetailPage({ params }: { params: { id: string } }) {
  return (
    <main>
      <AppHeader />
      <div className="container" style={{ paddingTop: 36, paddingBottom: 36 }}>
        <Link href="/espositori" style={{ color: 'var(--wine)', fontWeight: 700 }}>← Torna agli espositori</Link>
        <div className="grid grid-2" style={{ marginTop: 24 }}>
          <section className="card">
            <p style={{ color: 'var(--wine)', fontWeight: 800 }}>SCHEDA ESPOSITORE</p>
            <h1>Cantina Demo</h1>
            <StatusBadge status="candidatura_ricevuta" />
            <dl style={{ display: 'grid', gap: 12, marginTop: 24 }}>
              <div><dt>Ragione sociale</dt><dd>Azienda Agricola Demo</dd></div>
              <div><dt>Referente</dt><dd>Mario Rossi</dd></div>
              <div><dt>Email</dt><dd>demo@example.com</dd></div>
              <div><dt>Località</dt><dd>Porto San Giorgio, FM, Marche</dd></div>
            </dl>
            <p style={{ marginTop: 24, color: 'var(--muted)' }}>ID demo: {params.id}. Questa pagina sarà collegata a Supabase nella prossima milestone.</p>
          </section>
          <section className="card">
            <h2>Pagamenti</h2>
            <p>Quota prevista: <strong>€183,00</strong></p>
            <p>Pagato: <strong>€0,00</strong></p>
            <button className="btn btn-primary">Registra pagamento</button>
          </section>
        </div>
      </div>
    </main>
  );
}
