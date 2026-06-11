import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/profile';

export default async function EditionsPage() {
  await requireAdmin();
  const supabase = createSupabaseAdmin();
  const { data: editions } = await supabase.from('editions').select('*').order('year', { ascending: false });
  return <><main><AppHeader /><div className="container page"><header className="page-header"><div><p className="eyebrow">Admin</p><h1 className="page-title">Edizioni</h1><p className="muted">Gestisci le edizioni annuali e scegli quella attiva.</p></div></header><section className="card table-wrap"><table className="table"><thead><tr><th>Anno</th><th>Nome</th><th>Posti</th><th>Quota</th><th>Stato</th></tr></thead><tbody>{(editions ?? []).map((edition) => <tr key={edition.id}><td>{edition.year}</td><td>{edition.name}</td><td>{edition.max_exhibitors}</td><td>€ {Number(edition.exhibitor_fee).toFixed(2)}</td><td>{edition.is_active ? <span className="badge">Attiva</span> : '-'}</td></tr>)}</tbody></table></section></div></main><AppFooter /></>;
}
