import { AppHeader } from '@/components/AppHeader';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { createProfile, updateProfile } from '@/lib/actions/profiles';
import { requireAdmin } from '@/lib/auth/profile';

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export default async function UsersPage() {
  const current = await requireAdmin();
  const supabase = createSupabaseAdmin();
  const { data: profiles, error } = await supabase
    .from('staff_access')
    .select('id, full_name, email, role, is_active, created_at')
    .order('created_at', { ascending: false });

  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const authByEmail = new Map((authUsers?.users ?? []).map((user) => [user.email?.toLowerCase(), user]));

  return (
    <main>
      <AppHeader />
      <div className="container" style={{ paddingTop: 36, paddingBottom: 36 }}>
        <p style={{ color: 'var(--wine)', fontWeight: 800 }}>STAFF</p>
        <h1>Utenti e autorizzazioni</h1>
        <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
          Autorizza admin e operatori prima del primo accesso. La colonna stato mostra se l'utente ha gia effettuato il login.
        </p>

        <section className="card" style={{ marginBottom: 24 }}>
          <h2>Aggiungi accesso staff</h2>
          <form action={createProfile} className="grid grid-3">
            <label>Nome<input name="full_name" style={inputStyle} /></label>
            <label>Email<input name="email" type="email" required style={inputStyle} /></label>
            <label>Ruolo<select name="role" style={inputStyle}><option value="operator">Operatore</option><option value="admin">Admin</option></select></label>
            <button className="btn btn-primary" type="submit">Autorizza</button>
          </form>
        </section>

        {error ? <div className="card" style={{ color: 'var(--wine)', marginBottom: 24 }}>Errore caricamento: {error.message}</div> : null}
        <section className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ textAlign: 'left', color: 'var(--muted)' }}><th style={{ padding: 12 }}>Nome</th><th style={{ padding: 12 }}>Email</th><th style={{ padding: 12 }}>Ruolo</th><th style={{ padding: 12 }}>Stato</th><th style={{ padding: 12 }}>Ultimo accesso</th><th style={{ padding: 12 }}>Attivo</th><th style={{ padding: 12 }}></th></tr></thead>
            <tbody>
              {(profiles ?? []).map((item) => {
                const authUser = authByEmail.get(item.email.toLowerCase());
                const isMe = item.email.toLowerCase() === current.email;
                const status = !item.is_active ? 'Disattivato' : authUser ? 'Accesso effettuato' : 'Pending';
                return (
                  <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: 12 }}><input form={`profile-${item.id}`} name="full_name" defaultValue={item.full_name ?? ''} style={inputStyle} />{isMe ? <small style={{ color: 'var(--wine)', fontWeight: 800 }}>Sei tu</small> : null}</td>
                    <td style={{ padding: 12 }}>{item.email}<input form={`profile-${item.id}`} type="hidden" name="email" value={item.email} /></td>
                    <td style={{ padding: 12 }}><select form={`profile-${item.id}`} name="role" defaultValue={item.role} style={inputStyle}><option value="operator">Operatore</option><option value="admin">Admin</option></select></td>
                    <td style={{ padding: 12, fontWeight: 700 }}>{status}</td>
                    <td style={{ padding: 12 }}>{formatDate(authUser?.last_sign_in_at)}</td>
                    <td style={{ padding: 12 }}><input form={`profile-${item.id}`} type="checkbox" name="is_active" defaultChecked={item.is_active} disabled={isMe} /></td>
                    <td style={{ padding: 12 }}><form id={`profile-${item.id}`} action={updateProfile}><input type="hidden" name="id" value={item.id} />{isMe ? <input type="hidden" name="is_active" value="on" /> : null}<button className="btn btn-secondary" type="submit">Salva</button></form></td>
                  </tr>
                );
              })}
              {(profiles ?? []).length === 0 ? <tr><td colSpan={7} style={{ padding: 24, color: 'var(--muted)' }}>Nessun accesso staff configurato.</td></tr> : null}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = { display: 'block', width: '100%', marginTop: 8, padding: 10, borderRadius: 10, border: '1px solid var(--border)', background: 'white' };
