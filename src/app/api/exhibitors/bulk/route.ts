import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/auth/admin';
import { requireActiveStaff } from '@/lib/auth/profile';
import { writeAuditLog } from '@/lib/audit/log';
import type { ExhibitorStatus } from '@/types/database';

export const runtime = 'nodejs';

const allowedStatuses: ExhibitorStatus[] = [
  'bozza',
  'candidatura_ricevuta',
  'in_valutazione',
  'accettato',
  'in_attesa_pagamento',
  'confermato',
  'rifiutato',
  'rinunciato',
];

type BulkPayload = {
  ids?: string[];
  action?: 'status' | 'delete';
  status?: ExhibitorStatus;
};

function uniqueIds(ids: unknown) {
  if (!Array.isArray(ids)) return [];
  return Array.from(new Set(ids.map((id) => String(id).trim()).filter(Boolean)));
}

export async function POST(request: Request) {
  try {
    const profile = await requireActiveStaff();
    const body = (await request.json()) as BulkPayload;
    const ids = uniqueIds(body.ids);

    if (ids.length === 0) {
      return NextResponse.json({ message: 'Seleziona almeno un espositore.' }, { status: 400 });
    }

    if (ids.length > 250) {
      return NextResponse.json({ message: 'Selezione troppo grande. Lavora su massimo 250 espositori per volta.' }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();

    if (body.action === 'delete') {
      if (profile.role !== 'admin') {
        return NextResponse.json({ message: 'Solo un admin può eliminare espositori.' }, { status: 403 });
      }

      const { error } = await supabase.from('exhibitors').delete().in('id', ids);
      if (error) return NextResponse.json({ message: error.message }, { status: 400 });

      await writeAuditLog({
        action: 'exhibitor.bulk_delete',
        entityType: 'exhibitor',
        message: `Eliminati ${ids.length} espositori`,
        metadata: { ids, count: ids.length },
      });

      return NextResponse.json({ message: `Eliminati ${ids.length} espositori.`, deleted: ids.length });
    }

    if (body.action === 'status') {
      const status = body.status;
      if (!status || !allowedStatuses.includes(status)) {
        return NextResponse.json({ message: 'Stato non valido.' }, { status: 400 });
      }

      const { error } = await supabase
        .from('exhibitors')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', ids);

      if (error) return NextResponse.json({ message: error.message }, { status: 400 });

      await writeAuditLog({
        action: 'exhibitor.bulk_status',
        entityType: 'exhibitor',
        message: `Aggiornato stato a ${status} per ${ids.length} espositori`,
        metadata: { ids, count: ids.length, status },
      });

      return NextResponse.json({ message: `Aggiornati ${ids.length} espositori.`, updated: ids.length });
    }

    return NextResponse.json({ message: 'Azione massiva non valida.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Errore azione massiva' }, { status: 500 });
  }
}
