import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/profile';
import { EditionCard, NewEditionForm } from './EditionForms';

type PageSearchParams = Promise<{ edition?: string }>;

function feedbackMessage(status: string | undefined) {
  switch (status) {
    case 'created':
      return { text: 'Edizione creata correttamente.', tone: 'success' };
    case 'updated':
      return { text: 'Edizione aggiornata correttamente.', tone: 'success' };
    case 'create-error':
      return { text: 'Errore durante la creazione dell edizione.', tone: 'error' };
    case 'update-error':
      return { text: 'Errore durante il salvataggio dell edizione.', tone: 'error' };
    default:
      return null;
  }
}

export default async function EditionsPage({ searchParams }: { searchParams: PageSearchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const feedback = feedbackMessage(params.edition);
  const supabase = createSupabaseAdmin();
  const { data: editions } = await supabase.from('editions').select('*').order('year', { ascending: false });
  return <><main><AppHeader /><div className="container page"><header className="page-header"><div><p className="eyebrow">Admin</p><h1 className="page-title">Edizioni</h1><p className="muted">Gestisci le edizioni annuali e scegli quella attiva.</p></div></header>{feedback ? <div className="card" style={{ marginBottom: 20, borderColor: feedback.tone === 'success' ? 'rgba(31,120,68,.35)' : 'var(--wine)' }}><strong>{feedback.text}</strong></div> : null}<NewEditionForm /><section className="grid">{(editions ?? []).map((edition) => <EditionCard key={edition.id} edition={edition} />)}{(editions ?? []).length === 0 ? <div className="card muted">Nessuna edizione configurata.</div> : null}</section></div></main><AppFooter /></>;
}
