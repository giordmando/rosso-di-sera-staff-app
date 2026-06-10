import { AppHeader } from '@/components/AppHeader';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { requireAdmin } from '@/lib/auth/profile';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(value));
}

export default async function LogPage() {
  await requireAdmin();
  const supabase = createSupabaseAdmin();
  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select('id, actor_email, action, entity_type, entity_id, message, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <main>
      <AppHeader />
      <div className="container" style={{ paddingTop: 36, paddingBottom: 36 }}>
        <p style={{ color: 'var(--wine)', fontWeight: 800 }}>ADMIN</p>
        <h1>Log attività</h1>
        <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
          Ultime 200 attività registrate dall'app. La pagina è visibile solo agli admin.
        </p>
        {error ? <div className="card" style={{ color: 'var(--wine)', marginBottom: 24 }}>Errore caricamento: {error.message}</div> : null}
        <section className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--muted)' }}>
                <th style={{ padding: 12 }}>Data</th>
                <th style={{ padding: 12 }}>Utente</th>
                <th style={{ padding: 12 }}>Azione</th>
                <th style={{ padding: 12 }}>Entità</th>
                <th style={{ padding: 12 }}>Messaggio</th>
              </tr>
            </thead>
            <tbody>
              {(logs ?? []).map((item) => (
                <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: 12 }}>{formatDate(item.created_at)}</td>
                  <td style={{ padding: 12 }}>{item.actor_email ?? '-'}</td>
                  <td style={{ padding: 12, fontWeight: 700 }}>{item.action}</td>
                  <td style={{ padding: 12 }}>{item.entity_type ?? '-'} {item.entity_id ? `#${item.entity_id}` : ''}</td>
                  <td style={{ padding: 12 }}>{item.message ?? '-'}</td>
                </tr>
              ))}
              {(logs ?? []).length === 0 ? <tr><td colSpan={5} style={{ padding: 24, color: 'var(--muted)' }}>Nessun log registrato.</td></tr> : null}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
