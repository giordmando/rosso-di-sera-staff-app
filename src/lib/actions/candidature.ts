'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  brand_name: z.string().min(2),
  company_name: z.string().optional(),
  contact_name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  region: z.string().optional(),
  products: z.string().optional(),
  company_story: z.string().optional(),
});

export type CandidatureState = { ok: boolean; message: string };

export async function submitCandidature(_: CandidatureState, formData: FormData): Promise<CandidatureState> {
  const supabase = await createClient();
  const parsed = schema.safeParse({
    brand_name: String(formData.get('brand_name') || ''),
    company_name: String(formData.get('company_name') || ''),
    contact_name: String(formData.get('contact_name') || ''),
    email: String(formData.get('email') || ''),
    phone: String(formData.get('phone') || ''),
    city: String(formData.get('city') || ''),
    province: String(formData.get('province') || ''),
    region: String(formData.get('region') || ''),
    products: String(formData.get('products') || ''),
    company_story: String(formData.get('company_story') || ''),
  });

  if (!parsed.success) return { ok: false, message: 'Controlla i dati obbligatori.' };

  const { data: edition } = await supabase.from('editions').select('id').eq('is_active', true).order('year', { ascending: false }).limit(1).single();
  if (!edition) return { ok: false, message: 'Nessuna edizione attiva configurata.' };

  const { error } = await supabase.from('exhibitors').insert({
    edition_id: edition.id,
    brand_name: parsed.data.brand_name,
    company_name: parsed.data.company_name || null,
    contact_name: parsed.data.contact_name || null,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    city: parsed.data.city || null,
    province: parsed.data.province || null,
    region: parsed.data.region || null,
    products: parsed.data.products || null,
    company_story: parsed.data.company_story || null,
    status: 'candidatura_ricevuta',
    media_consent: formData.get('media_consent') === 'on',
    experiences: formData.getAll('experiences').map(String),
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true, message: 'Candidatura inviata correttamente.' };
}
