import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { createClient } from '@/lib/supabase/server';
import { requireActiveStaff } from '@/lib/auth/profile';

export default async function DashboardPage() {
  const profile = await requireActiveStaff();
  const supabase = await createClient();
  const { data: exhibitors } = await supabase.from('exhibitors').select('id, status');
  const { data: payments } = await supabase.from('payments').select('paid_amount');
  const total = exhibitors?.length ?? 0;
  const confirmed = exhibitors?.filter((item) => item.status === 'confermato').length ?? 0;
  const pendingPayment = exhibitors?.filter((item) => item.status === 'in_attesa_pagamento').length ?? 0;
  const accepted = exhibitors?.filter((item) => item.status === 'accettato').length ?? 0;
  const received = exhibitors?.filter((item) => item.status === 'candidatura_ricevuta').length ?? 0;
  const paid = payments?.reduce((sum, item) => sum + Number(item.paid_amount ?? 0), 0) ?? 0;
  const maxExhibitors = 45;
  const available = Math.max(maxExhibitors - confirmed, 0);
  const stats = [
    { label: 'Posti disponibili', value: String(available) },
    { label: 'Confermati', value: String(confirmed) },
    { label: 'Incassato', value: `€ ${paid.toFixed(2)}` },
    { label: 'Totali', value: String(total) },
    { label: 'Ricevute', value: String(received) },
    { label: 'Accettati', value: String(accepted) },
    { label: 'Attesa pagamento', value: String(pendingPayment) },
  ];

  return <main><AppHeader /><div className="container page"><header className="page-header"><div><p className="eyebrow">Rosso di Sera 2026</p><h1 className="page-title">Dashboard staff</h1><p className="muted">Accesso: {profile.full_name ?? profile.email} <span className="badge">{profile.role}</span></p></div><nav className="toolbar"><Link className="btn btn-secondary" href="/espositori">Espositori</Link><Link className="btn btn-secondary" href="/pagamenti">Pagamenti</Link><Link className="btn btn-primary" href="/candidatura">Nuova candidatura</Link></nav></header>
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 20 }}>{stats.map((item) => <div className="card" key={item.label}><p className="muted">{item.label}</p><strong className="stat-value">{item.value}</strong></div>)}</section>
    <section className="grid grid-3" style={{ marginTop: 28 }}><Link className="card" href="/espositori"><p className="eyebrow">Operatività</p><h2>Gestisci espositori</h2><p className="muted">Valuta candidature, aggiorna stati e note interne.</p></Link><Link className="card" href="/pagamenti"><p className="eyebrow">Pagamenti</p><h2>Controlla incassi</h2><p className="muted">Registra pagamenti e verifica quote ancora da incassare.</p></Link><Link className="card" href="/sync/google-sheet"><p className="eyebrow">Sync</p><h2>Import/export</h2><p className="muted">Aggiorna Google Sheet, importa CSV e controlla conflitti.</p></Link></section>
  </div></main>;
}
