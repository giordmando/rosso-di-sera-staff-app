import { AppHeader } from '@/components/AppHeader';
import { createClient } from '@/lib/supabase/server';
import { createProfile, updateProfile } from '@/lib/actions/profiles';

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
          Gestisci gli utenti autorizzati ad accedere all'app. L'utente deve esistere in Supabase Auth e avere un profilo attivo.
        </p>

        <section className="card" style={{ marginBottom: 24 }}>
          <h2>Aggiungi profilo staff</h2>
          <p style={{ color: 'var(--muted)' }}>Usa l'ID Auth dell'utente solo quando verra completata la creazione automatica. Per ora questa sezione e di preparazione.</p>
          <form action={createProfile} className="grid grid-3">
            <label>Nome<input name="full_name" style={inputStyle} /></label>
            <label>Email<input name="email" type="email" required style={inputStyle} /></label>
            <label>Ruolo<select name="role" style={inputStyle}><option value="operator">Operatore</option><option value="admin">Admin</option></select></label>
            <button className="btn btn-primary" type="submit">Aggiungi profilo</button>
          </form>
        </section>

        {error ? <div className="card" style={{ color: 'var(--wine)', marginBottom: 24 }}>Errore caricamento: {error.message}</div> : null}
        <section className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--muted)' }}>
                <th style={{ padding: 12 }}>Nome</th>
                <th style={{ padding: 12 }}>Email</th>
                <th style={{ padding: 12 }}>Ruolo</th>
                <th style={{ padding: 12 }}>Attivo</th>
                <th style={{ padding: 12 }}></th>
              </tr>
            </thead>
            <tbody>
              {(profiles ?? []).map((item) => (
                <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: 12 }}><input form={`profile-${item.id}`} name="full_name" defaultValue={item.full_name ?? ''} style={inputStyle} /></td>
                  <td style={{ padding: 12 }}>{item.email}</td>
                  <td style={{ padding: 12 }}><select form={`profile-${item.id}`} name="role" defaultValue={item.role} style={inputStyle}><option value="operator">Operatore</option><option value="admin">Admin</option></select></td>
                  <td style={{ padding: 12 }}><input form={`profile-${item.id}`} type="checkbox" name="is_active" defaultChecked={item.is_active} /></td>
                  <td style={{ padding: 12 }}>
                    <form id={`profile-${item.id}`} action={updateProfile}>
                      <input type="hidden" name="id" value={item.id} />
                      <button className="btn btn-secondary" type="submit">Salva</button>
                    </form>
                  </td>
                </tr>
              ))}
              {(profiles ?? []).length === 0 ? <tr><td colSpan={5} style={{ padding: 24, color: 'var(--muted)' }}>Nessun utente presente in profiles.</td></tr> : null}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: 8,
  padding: 10,
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'white',
};
