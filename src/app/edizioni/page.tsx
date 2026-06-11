import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/profile';
import { EditionCard, NewEditionForm } from './EditionForms';

export default async function EditionsPage() {
  await requireAdmin();
  const supabase = createSupabaseAdmin();
  const { data: editions } = await supabase.from('editions').select('*').order('year', { ascending: false });
  return <><main><AppHeader /><div className="container page"><header className="page-header"><div><p className="eyebrow">Admin</p><h1 className="page-title">Edizioni</h1><p className="muted">Gestisci le edizioni annuali e scegli quella attiva.</p></div></header><NewEditionForm /><section className="grid">{(editions ?? []).map((edition) => <EditionCard key={edition.id} edition={edition} />)}{(editions ?? []).length === 0 ? <div className="card muted">Nessuna edizione configurata.</div> : null}</section></div></main><AppFooter /></>;
}
