import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/profile';

function formatDate(value: string) { return new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(value)); }
function pageUrl(page: number, q: string, action: string) { const params = new URLSearchParams(); if (q) params.set('q', q); if (action) params.set('action', action); params.set('page', String(page)); return `/log?${params.toString()}`; }

export default async function LogPage({ searchParams }: { searchParams?: { q?: string; action?: string; page?: string } }) {
  await requireAdmin();
  const supabase = createSupabaseAdmin();
  const q = String(searchParams?.q ?? '').trim();
  const action = String(searchParams?.action ?? '').trim();
  const page = Math.max(1, Number(searchParams?.page ?? 1));
  const limit = 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data: actions } = await supabase.from('audit_logs').select('action').order('action');
  const actionOptions = Array.from(new Set((actions ?? []).map((item) => item.action).filter(Boolean)));
  let query = supabase.from('audit_logs').select('id, actor_email, action, entity_type, entity_id, message, metadata, created_at', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
  if (action) query = query.eq('action', action);
  if (q) query = query.or(`actor_email.ilike.%${q}%,action.ilike.%${q}%,message.ilike.%${q}%`);
  const { data: logs, error, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / limit));
  return <><main><AppHeader /><div className="container page"><div className="page-header"><div><p className="eyebrow">Admin</p><h1 className="page-title">Log attività</h1><p className="muted">Controlla le operazioni critiche effettuate dallo staff, incluse le nuove candidature.</p></div></div><form className="card form-row filter-card"><label><span>Cerca</span><input name="q" defaultValue={q} placeholder="utente, azione, messaggio" /></label><label><span>Azione</span><select name="action" defaultValue={action}><option value="">Tutte</option>{actionOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><button className="btn btn-primary" type="submit">Filtra</button><Link className="btn btn-secondary" href="/log">Reset</Link><span className="muted result-count">{count ?? 0} risultati</span></form>{error ? <div className="card" style={{ color: 'var(--wine)', marginBottom: 24 }}>Errore caricamento: {error.message}</div> : null}<section className="card table-wrap"><table className="table"><thead><tr><th>Data</th><th>Utente</th><th>Azione</th><th>Entità</th><th>Messaggio</th></tr></thead><tbody>{(logs ?? []).map((item) => <tr key={item.id}><td>{formatDate(item.created_at)}</td><td>{item.actor_email ?? '-'}</td><td><span className="badge">{item.action}</span></td><td>{item.entity_type ?? '-'} {item.entity_id ? <span className="truncate">#{item.entity_id}</span> : null}</td><td>{item.message ?? '-'}</td></tr>)}{(logs ?? []).length === 0 ? <tr><td colSpan={5} className="muted">Nessun log registrato.</td></tr> : null}</tbody></table></section><div className="toolbar" style={{ justifyContent: 'flex-start', marginTop: 16 }}><Link className="btn btn-secondary" href={pageUrl(Math.max(1, page - 1), q, action)}>Precedente</Link><span>Pagina {page} di {totalPages}</span><Link className="btn btn-secondary" href={pageUrl(Math.min(totalPages, page + 1), q, action)}>Successiva</Link></div></div></main><AppFooter /></>;
}
