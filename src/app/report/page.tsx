import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { requireActiveStaff } from '@/lib/auth/profile';

export default async function ReportPage() {
  await requireActiveStaff();
  const supabase = createSupabaseAdmin();
  const { data: edition } = await supabase.from('editions').select('*').eq('is_active', true).order('year', { ascending: false }).limit(1).single();
  const editionId = edition?.id;
  const { data: exhibitors } = editionId ? await supabase.from('exhibitors').select('id, status, province, products').eq('edition_id', editionId) : { data: [] };
  const { data: payments } = await supabase.from('payments').select('paid_amount, expected_amount, exhibitors!inner(edition_id)').eq('exhibitors.edition_id', editionId ?? '');
  const rows = exhibitors ?? [];
  const total = rows.length;
  const confirmed = rows.filter((item) => item.status === 'confermato').length;
  const received = rows.filter((item) => item.status === 'candidatura_ricevuta').length;
  const pendingPayment = rows.filter((item) => item.status === 'in_attesa_pagamento').length;
  const accepted = rows.filter((item) => item.status === 'accettato').length;
  const refused = rows.filter((item) => item.status === 'rifiutato' || item.status === 'rinunciato').length;
  const paid = (payments ?? []).reduce((sum, item) => sum + Number(item.paid_amount ?? 0), 0);
  const expected = (payments ?? []).reduce((sum, item) => sum + Number(item.expected_amount ?? 0), 0);
  const max = Number(edition?.max_exhibitors ?? 45);
  const byProvince = Array.from(rows.reduce((map, item) => { const key = item.province || 'ND'; map.set(key, (map.get(key) ?? 0) + 1); return map; }, new Map<string, number>()).entries()).sort((a, b) => b[1] - a[1]);
  const stats = [{ label: 'Totale candidature', value: total }, { label: 'Confermati', value: confirmed }, { label: 'Posti disponibili', value: Math.max(max - confirmed, 0) }, { label: 'Ricevute', value: received }, { label: 'Accettati', value: accepted }, { label: 'Attesa pagamento', value: pendingPayment }, { label: 'Rifiutati/Rinunciati', value: refused }, { label: 'Incassato', value: `€ ${paid.toFixed(2)}` }, { label: 'Da incassare', value: `€ ${Math.max(expected - paid, 0).toFixed(2)}` }];
  return <><main><AppHeader /><div className="container page"><header className="page-header"><div><p className="eyebrow">Report</p><h1 className="page-title">Reportistica</h1><p className="muted">Riepilogo operativo dell'edizione attiva: {edition?.name ?? 'non configurata'}.</p></div></header><section className="grid grid-3" style={{ marginBottom: 24 }}>{stats.map((item) => <div className="card" key={item.label}><p className="muted">{item.label}</p><strong className="stat-value">{item.value}</strong></div>)}</section><section className="grid grid-2"><div className="card table-wrap"><h2>Per provincia</h2><table className="table"><thead><tr><th>Provincia</th><th>Espositori</th></tr></thead><tbody>{byProvince.map(([province, count]) => <tr key={province}><td>{province}</td><td>{count}</td></tr>)}{byProvince.length === 0 ? <tr><td colSpan={2} className="muted">Nessun dato.</td></tr> : null}</tbody></table></div><div className="card"><h2>Report operativi</h2><p className="muted">Controlli rapidi consigliati.</p><ul className="muted"><li>{received} candidature da valutare</li><li>{pendingPayment + accepted} espositori da verificare lato pagamento</li><li>{Math.max(max - confirmed, 0)} posti ancora disponibili</li></ul></div></section></div></main><AppFooter /></>;
}
