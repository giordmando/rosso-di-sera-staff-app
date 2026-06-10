'use client';

import { useActionState } from 'react';
import { registerPayment, type PaymentState } from '@/lib/actions/payments';

const initialState: PaymentState = { ok: false, message: '' };

export function PaymentForm({ exhibitorId, expectedAmount }: { exhibitorId: string; expectedAmount: number }) {
  const [state, formAction, pending] = useActionState(registerPayment, initialState);

  return (
    <form action={formAction} style={{ display: 'grid', gap: 14, marginTop: 16 }}>
      <input type="hidden" name="exhibitor_id" value={exhibitorId} />
      <label>Importo previsto<input name="expected_amount" type="number" step="0.01" defaultValue={expectedAmount} style={inputStyle} /></label>
      <label>Importo pagato<input name="paid_amount" type="number" step="0.01" required style={inputStyle} /></label>
      <label>Metodo pagamento<input name="payment_method" placeholder="Bonifico, contanti..." style={inputStyle} /></label>
      <label>Data pagamento<input name="payment_date" type="date" style={inputStyle} /></label>
      <label><input type="checkbox" name="receipt_received" /> Ricevuta ricevuta</label>
      <label>Note<textarea name="notes" rows={3} style={inputStyle} /></label>
      <button className="btn btn-primary" disabled={pending} type="submit">{pending ? 'Registrazione...' : 'Registra pagamento'}</button>
      {state.message ? <p style={{ color: state.ok ? 'green' : 'var(--wine)', fontWeight: 700 }}>{state.message}</p> : null}
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: 8,
  padding: 12,
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: 'white',
};
