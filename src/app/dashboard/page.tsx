import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { createClient } from '@/lib/supabase/server';
import { requireActiveStaff } from '@/lib/auth/profile';

function formatDate(value: string) { return new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)); }

export default async function DashboardPage() {
  const profile = await requireActiveStaff();
  const supabase = await createClient();
  const { data: edition } = await supabase.from('editions').select('*').eq('is_active', true).order('year', { ascending: false }).limit(1).single();
  const editionId = edition?.id;
  const { data: exhibitors } = editionId ? await supabase.from('exhibitors').select('id, status').eq('edition_id', editionId) : { data: [] };
  const { data: payments } = await supabase.from('payments').select('paid_amount, exhibitors!inner(edition_id)').eq('exhibitors.edition_id', editionId ?? '');
  const { data: followUps } = editionId ? await supabase.from('staff_activities').select('id, activity_type, outcome, notes, follow_up_at, exhibitors(id, brand_name)').eq('edition_id', editionId).eq('completed', false).not('follow_up_at', 'is', null).order('follow_up_at', { ascending: true }).limit(6) : { data: [] };
  const total = exhibitors?.length ?? 0;
  const confirmed = exhibitors?.filter((item) => item.status === 'confermato').length ?? 0;
  const pendingPayment = exhibitors?.filter((item) => item.status === 'in_attesa_pagamento').length ?? 0;
  const accepted = exhibitors?.filter((item) => item.status === 'accettato').length ?? 0;
  const received = exhibitors?.filter((item) => item.status === 'candidatura_ricevuta').length ?? 0;
  const paid = payments?.reduce((sum, item) => sum + Number(item.paid_amount ?? 0), 0) ?? 0;
  const maxExhibitors = Number(edition?.max_exhibitors ?? 45);
  const available = Math.max(maxExhibitors - confirmed, 0);
  const stats = [{ label: 'Posti disponibili', value: String(available) }, { label: 'Confermati', value: String(confirmed) }, { label: 'Incassato', value: `€ ${paid.toFixed(2)}` }, { label: 'Totali', value: String(total) }, { label: 'Ricevute', value: String(received) }, { label: 'Accettati', value: String(accepted) }, { label: 'Attesa pagamento', value: String(pendingPayment) }];
  return <><main><AppHeader /><div className="container page"><header className="page-header"><div><p className="eyebrow">{edition?.name ?? 'Rosso di Sera'}</p><h1 className="page-title">Dashboard staff</h1><p className="muted">Accesso: {profile.full_name ?? profile.email} <span className="badge">{profile.role}</span></p></div><nav className="toolbar page-actions"><Link className="btn btn-secondary" href="/espositori">Espositori</Link><Link className="btn btn-secondary" href="/pagamenti">Pagamenti</Link><Link className="btn btn-primary" href="/candidatura">Nuova candidatura</Link></nav></header><section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 20 }}>{stats.map((item) => <div className="card" key={item.label}><p className="muted">{item.label}</p><strong className="stat-value">{item.value}</strong></div>)}</section><section className="grid grid-2" style={{ marginTop: 28 }}><div className="card"><p className="eyebrow">CRM</p><h2>Follow-up aperti</h2><div className="grid" style={{ marginTop: 16 }}>{(followUps ?? []).map((item: any) => <Link key={item.id} className="card" style={{ boxShadow: 'none' }} href={`/espositori/${item.exhibitors?.id}`}><strong>{item.exhibitors?.brand_name ?? 'Espositore'}</strong><p className="muted" style={{ margin: '6px 0 0' }}>{item.follow_up_at ? formatDate(item.follow_up_at) : '-'} · {item.outcome ?? item.activity_type}</p></Link>)}{(followUps ?? []).length === 0 ? <p className="muted">Nessun follow-up aperto.</p> : null}</div></div><div className="grid"><Link className="card" href="/espositori"><p className="eyebrow">Operatività</p><h2>Gestisci espositori</h2><p className="muted">Valuta candidature, aggiorna stati e note interne.</p></Link><Link className="card" href="/pagamenti"><p className="eyebrow">Pagamenti</p><h2>Controlla incassi</h2><p className="muted">Registra pagamenti e verifica quote ancora da incassare.</p></Link><Link className="card" href="/report"><p className="eyebrow">Report</p><h2>Controlla dati</h2><p className="muted">Analizza andamento, province, posti e pagamenti.</p></Link></div></section></div></main><AppFooter /></>;
}
