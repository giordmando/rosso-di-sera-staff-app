import { deletePayment } from '@/lib/actions/payments';

export function PaymentHistory({ payments, exhibitorId, expectedAmount }: { payments: any[]; exhibitorId: string; expectedAmount: number }) {
  if (payments.length === 0) return <p style={{ color: 'var(--muted)' }}>Nessun pagamento registrato.</p>;

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {payments.map((payment) => (
        <div key={payment.id} style={{ border: '1px solid var(--border)', borderRadius: 14, padding: 12, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <div>
            <strong>€ {Number(payment.paid_amount).toFixed(2)}</strong><br />
            <span style={{ color: 'var(--muted)' }}>{payment.payment_date ?? '-'} - {payment.payment_method ?? '-'}</span>
            {payment.notes ? <p style={{ color: 'var(--muted)', margin: '6px 0 0' }}>{payment.notes}</p> : null}
          </div>
          <form action={deletePayment}>
            <input type="hidden" name="id" value={payment.id} />
            <input type="hidden" name="exhibitor_id" value={exhibitorId} />
            <input type="hidden" name="expected_amount" value={expectedAmount} />
            <button className="btn btn-secondary" type="submit">Elimina</button>
          </form>
        </div>
      ))}
    </div>
  );
}
