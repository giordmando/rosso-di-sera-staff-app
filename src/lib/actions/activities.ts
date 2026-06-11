'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { requireActiveStaff } from '@/lib/auth/profile';
import { writeAuditLog } from '@/lib/audit/log';

function value(formData: FormData, key: string) { return String(formData.get(key) ?? '').trim(); }

export async function createStaffActivity(formData: FormData) {
  const profile = await requireActiveStaff();
  const supabase = createSupabaseAdmin();
  const exhibitorId = value(formData, 'exhibitor_id');
  const editionId = value(formData, 'edition_id') || null;
  const followUp = value(formData, 'follow_up_at');
  const payload = {
    edition_id: editionId,
    exhibitor_id: exhibitorId,
    staff_user_id: profile.id,
    activity_type: value(formData, 'activity_type') || 'note',
    outcome: value(formData, 'outcome') || null,
    notes: value(formData, 'notes') || null,
    follow_up_at: followUp ? new Date(followUp).toISOString() : null,
    completed: formData.get('completed') === 'on',
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from('staff_activities').insert(payload).select('id').single();
  if (!error) await writeAuditLog({ action: 'activity.create', entityType: 'exhibitor', entityId: exhibitorId, message: `Nuova attività staff: ${payload.activity_type}`, metadata: { activityId: data?.id, outcome: payload.outcome } });
  revalidatePath(`/espositori/${exhibitorId}`);
  revalidatePath('/dashboard');
  redirect(`/espositori/${exhibitorId}?activity=${error ? 'error' : 'created'}`);
}

export async function completeStaffActivity(formData: FormData) {
  await requireActiveStaff();
  const supabase = createSupabaseAdmin();
  const id = value(formData, 'id');
  const exhibitorId = value(formData, 'exhibitor_id');
  const { error } = await supabase.from('staff_activities').update({ completed: true, updated_at: new Date().toISOString() }).eq('id', id);
  if (!error) await writeAuditLog({ action: 'activity.complete', entityType: 'exhibitor', entityId: exhibitorId, message: 'Follow-up completato', metadata: { activityId: id } });
  revalidatePath(`/espositori/${exhibitorId}`);
  revalidatePath('/dashboard');
  redirect(`/espositori/${exhibitorId}?activity=${error ? 'error' : 'completed'}`);
}
