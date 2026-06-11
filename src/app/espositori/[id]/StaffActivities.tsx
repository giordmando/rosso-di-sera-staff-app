import { completeStaffActivity, createStaffActivity } from '@/lib/actions/activities';

type Activity = {
  id: string;
  activity_type: string;
  outcome: string | null;
  notes: string | null;
  follow_up_at: string | null;
  completed: boolean;
  created_at: string;
  profiles?: { full_name: string | null; email: string | null } | null;
};

const activityLabels: Record<string, string> = {
  phone: 'Telefono',
  whatsapp: 'WhatsApp',
  email: 'Email',
  sms: 'SMS',
  meeting: 'Incontro',
  payment_reminder: 'Sollecito pagamento',
  note: 'Nota',
  other: 'Altro',
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export function StaffActivities({ exhibitorId, editionId, activities }: { exhibitorId: string; editionId: string | null; activities: Activity[] }) {
  return (
    <section className="card" style={{ marginTop: 24 }}>
      <p className="eyebrow">CRM Staff</p>
      <h2>Attività e contatti</h2>
      <p className="muted">Registra email, WhatsApp, telefonate, esiti e follow-up.</p>
      <form action={createStaffActivity} className="grid" style={{ marginTop: 20, marginBottom: 28 }}>
        <input type="hidden" name="exhibitor_id" value={exhibitorId} />
        <input type="hidden" name="edition_id" value={editionId ?? ''} />
        <div className="form-grid">
          <label><span>Tipo attività</span><select name="activity_type" defaultValue="phone"><option value="phone">Telefono</option><option value="whatsapp">WhatsApp</option><option value="email">Email</option><option value="sms">SMS</option><option value="meeting">Incontro</option><option value="payment_reminder">Sollecito pagamento</option><option value="note">Nota</option><option value="other">Altro</option></select></label>
          <label><span>Esito</span><select name="outcome" defaultValue="da_richiamare"><option value="nessuna_risposta">Nessuna risposta</option><option value="da_richiamare">Da richiamare</option><option value="interessato">Interessato</option><option value="molto_interessato">Molto interessato</option><option value="info_inviate">Info inviate</option><option value="in_attesa">In attesa</option><option value="confermato">Confermato</option><option value="non_interessato">Non interessato</option><option value="pagamento_richiesto">Pagamento richiesto</option><option value="pagamento_ricevuto">Pagamento ricevuto</option></select></label>
        </div>
        <label><span>Note</span><textarea name="notes" rows={3} placeholder="Es. contattato su WhatsApp, vuole ricevere regolamento e richiamare venerdì." /></label>
        <div className="form-grid">
          <label><span>Follow-up</span><input name="follow_up_at" type="datetime-local" /></label>
          <label style={{ fontWeight: 400 }}><span>Completata</span><input type="checkbox" name="completed" style={{ width: 'auto', marginRight: 8 }} />Segna già completata</label>
        </div>
        <button className="btn btn-primary" type="submit">Aggiungi attività</button>
      </form>
      <div className="grid">
        {activities.map((activity) => <div key={activity.id} className="card" style={{ boxShadow: 'none' }}><div className="page-header" style={{ marginBottom: 10 }}><div><span className="badge">{activityLabels[activity.activity_type] ?? activity.activity_type}</span><p className="muted" style={{ margin: '10px 0 0' }}>{formatDate(activity.created_at)} · {activity.profiles?.full_name ?? activity.profiles?.email ?? 'Staff'}</p></div>{activity.follow_up_at && !activity.completed ? <form action={completeStaffActivity}><input type="hidden" name="id" value={activity.id} /><input type="hidden" name="exhibitor_id" value={exhibitorId} /><button className="btn btn-secondary" type="submit">Completa</button></form> : null}</div>{activity.outcome ? <p><strong>Esito:</strong> {activity.outcome}</p> : null}{activity.notes ? <p className="muted">{activity.notes}</p> : null}{activity.follow_up_at ? <p><strong>Follow-up:</strong> {formatDate(activity.follow_up_at)} {activity.completed ? <span className="badge">Completato</span> : null}</p> : null}</div>)}
        {activities.length === 0 ? <p className="muted">Nessuna attività registrata.</p> : null}
      </div>
    </section>
  );
}
