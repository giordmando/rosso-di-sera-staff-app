'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { writeAuditLog } from '@/lib/audit/log';
import { normalizeProvince, normalizeRegion } from '@/lib/geo/normalize';
import type { ExhibitorStatus } from '@/types/database';

export async function updateExhibitor(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || 'candidatura_ricevuta') as ExhibitorStatus;
  const brandName = String(formData.get('brand_name') || '');
  if (!id) return;
  const { error } = await supabase.from('exhibitors').update({
    brand_name: brandName,
    company_name: String(formData.get('company_name') || '') || null,
    contact_name: String(formData.get('contact_name') || '') || null,
    email: String(formData.get('email') || '') || null,
    phone: String(formData.get('phone') || '') || null,
    city: String(formData.get('city') || '') || null,
    province: normalizeProvince(String(formData.get('province') || '')),
    region: normalizeRegion(String(formData.get('region') || '')),
    products: String(formData.get('products') || '') || null,
    company_story: String(formData.get('company_story') || '') || null,
    internal_notes: String(formData.get('internal_notes') || '') || null,
    status,
    updated_at: new Date().toISOString(),
  }).eq('id', id);
  if (!error) await writeAuditLog({ action: 'exhibitor.update', entityType: 'exhibitor', entityId: id, message: `Aggiornato espositore ${brandName}`, metadata: { status } });
  revalidatePath(`/espositori/${id}`);
  revalidatePath('/espositori');
  revalidatePath('/dashboard');
}
