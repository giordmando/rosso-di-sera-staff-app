import { EXHIBITOR_STATUSES } from '@/lib/constants';
import type { ExhibitorStatus } from '@/types/database';

export function StatusBadge({ status }: { status: ExhibitorStatus }) {
  const label = EXHIBITOR_STATUSES.find((item) => item.value === status)?.label ?? status;

  return (
    <span style={{ display: 'inline-flex', borderRadius: 999, border: '1px solid var(--border)', padding: '6px 10px', fontSize: 12, fontWeight: 700, color: 'var(--wine)', background: 'var(--cream)' }}>
      {label}
    </span>
  );
}
