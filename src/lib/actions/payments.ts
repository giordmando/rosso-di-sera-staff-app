'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  exhibitor_id: z.string().uuid(),
  expected_amount: z.coerce.number().min(0),
  paid_amount: z.coerce.number().min(0.01),
  payment_method: z.string().optional(),
  payment_date: z.string().optional(),
  receipt_received: z.string().optional(),
  notes: z.string().optional(),
});

export type PaymentState = { ok: boolean; message: string };

export async function registerPayment(_: PaymentState, formData: FormData): Promise<PaymentState> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const parsed = schema.safeParse({
    exhibitor_id: String(formData.get('exhibitor_id') || ''),
    expected_amount: String(formData.get('expected_amount') || '183'),
    paid_amount: String(formData.get('paid_amount') || ''),
    payment_method: String(formData.get('payment_method') || ''),
    payment_date: String(formData.get('payment_date') || ''),
    receipt_received: String(formData.get('receipt_received') || ''),
    notes: String(formData.get('notes') || ''),
  });

  if (!parsed.success) return { ok: false, message: 'Controlla i dati del pagamento.' };

  const { error } = await supabase.from('payments').insert({
    exhibitor_id: parsed.data.exhibitor_id,
    expected_amount: parsed.data.expected_amount,
    paid_amount: parsed.data.paid_amount,
    payment_method: parsed.data.payment_method || null,
    payment_date: parsed.data.payment_date || null,
    receipt_received: parsed.data.receipt_received === 'on',
    notes: parsed.data.notes || null,
    registered_by: userData.user?.id ?? null,
  });

  if (error) return { ok: false, message: error.message };

  await supabase.from('exhibitors').update({ status: 'confermato' }).eq('id', parsed.data.exhibitor_id);

  revalidatePath(`/espositori/${parsed.data.exhibitor_id}`);
  revalidatePath('/pagamenti');
  revalidatePath('/espositori');

  return { ok: true, message: 'Pagamento registrato correttamente.' };
}
