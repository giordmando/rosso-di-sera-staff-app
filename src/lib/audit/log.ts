import { createSupabaseAdmin } from '@/lib/auth/admin';
import { getStaffProfile } from '@/lib/auth/profile';

export async function writeAuditLog(input: { action: string; entityType?: string; entityId?: string; message?: string; metadata?: Record<string, unknown> }) {
  const actor = await getStaffProfile().catch(() => null);
  const supabase = createSupabaseAdmin();
  await supabase.from('audit_logs').insert({
    actor_email: actor?.email ?? null,
    action: input.action,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    message: input.message ?? null,
    metadata: input.metadata ?? {},
  });
}
