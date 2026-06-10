import { AppHeader } from '@/components/AppHeader';
import { createClient } from '@/lib/supabase/server';

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, is_active, created_at')
    .order('created_at', { ascending: false });

  return (
    <main>
      <AppHeader />
      <div className="container" style={{ paddingTop: 36, paddingBottom: 36 }}>
        <p style={{ color: 'var(--wine)', fontWeight: 800 }}>STAFF</p>
        <h1>Utenti e autorizzazioni</h1>
        <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
          Elenco utenti autorizzati. La gestione completa di ruoli e attivazione sara completata nel prossimo step.
        </p>
        {error ? <div className="card" style={{ color: 'var(--wine)', marginBottom: 24 }}>Errore caricamento: {error.message}</div> : null}
        <section className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--muted)' }}>
                <th style={{ padding: 12 }}>Nome</th>
                <th style={{ padding: 12 }}>Email</th>
                <th style={{ padding: 12 }}>Ruolo</th>
                <th style={{ padding: 12 }}>Attivo</th>
              </tr>
            </thead>
            <tbody>
              {(profiles ?? []).map((item) => (
                <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: 12 }}>{item.full_name ?? '-'}</td>
                  <td style={{ padding: 12 }}>{item.email}</td>
                  <td style={{ padding: 12 }}>{item.role}</td>
                  <td style={{ padding: 12 }}>{item.is_active ? 'Si' : 'No'}</td>
                </tr>
              ))}
              {(profiles ?? []).length === 0 ? <tr><td colSpan={4} style={{ padding: 24, color: 'var(--muted)' }}>Nessun utente presente in profiles.</td></tr> : null}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
