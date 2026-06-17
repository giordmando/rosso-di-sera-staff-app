'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { EXHIBITOR_STATUSES } from '@/lib/constants';
import { bulkDeleteExhibitors, bulkUpdateExhibitorStatus } from '@/lib/actions/exhibitors';
import { StatusBadge } from '@/components/StatusBadge';
import type { ExhibitorStatus } from '@/types/database';

export type BulkExhibitorRow = {
  id: string;
  brand_name: string;
  company_name: string | null;
  city: string | null;
  province: string | null;
  region: string | null;
  status: ExhibitorStatus;
  email: string | null;
};

export function BulkExhibitorsTable({ rows, isAdmin }: { rows: BulkExhibitorRow[]; isAdmin: boolean }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<ExhibitorStatus>('in_valutazione');
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const allSelected = rows.length > 0 && selected.length === rows.length;
  const selectedCount = selected.length;
  const selectedNames = useMemo(() => rows.filter((row) => selected.includes(row.id)).map((row) => row.brand_name).slice(0, 3).join(', '), [rows, selected]);

  function toggleAll() {
    setSelected(allSelected ? [] : rows.map((row) => row.id));
  }

  function toggleOne(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function runStatusUpdate() {
    if (!selectedCount) return setMessage('Seleziona almeno un espositore.');
    const formData = new FormData();
    selected.forEach((id) => formData.append('ids', id));
    formData.set('status', status);
    setMessage('Aggiornamento massivo in corso...');
    startTransition(async () => {
      const result = await bulkUpdateExhibitorStatus(formData);
      setMessage(result.message);
      if (result.ok) setSelected([]);
    });
  }

  function runDelete() {
    if (!selectedCount) return setMessage('Seleziona almeno un espositore.');
    const label = selectedNames ? ` (${selectedNames}${selectedCount > 3 ? '...' : ''})` : '';
    if (!confirm(`Eliminare ${selectedCount} espositori${label}?\n\nVerranno eliminati anche pagamenti e attività collegate. Operazione non annullabile.`)) return;
    const formData = new FormData();
    selected.forEach((id) => formData.append('ids', id));
    setMessage('Eliminazione massiva in corso...');
    startTransition(async () => {
      const result = await bulkDeleteExhibitors(formData);
      setMessage(result.message);
      if (result.ok) setSelected([]);
    });
  }

  return <section className="card table-wrap">
    <div className="bulk-bar">
      <div>
        <strong>{selectedCount}</strong> selezionati
        {message ? <span className="muted" style={{ marginLeft: 12 }}>{message}</span> : null}
      </div>
      <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
        <select value={status} onChange={(event) => setStatus(event.target.value as ExhibitorStatus)} disabled={isPending || !selectedCount} style={{ minWidth: 220 }}>
          {EXHIBITOR_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <button className="btn btn-secondary" type="button" onClick={runStatusUpdate} disabled={isPending || !selectedCount}>Cambia stato</button>
        {isAdmin ? <button className="btn btn-soft" type="button" onClick={runDelete} disabled={isPending || !selectedCount}>Elimina selezionati</button> : null}
      </div>
    </div>
    <table className="table"><thead><tr><th style={{ width: 44 }}><input type="checkbox" aria-label="Seleziona tutti" checked={allSelected} onChange={toggleAll} /></th><th>Azienda</th><th>Località</th><th>Regione</th><th>Email</th><th>Stato</th><th></th></tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td><input type="checkbox" aria-label={`Seleziona ${item.brand_name}`} checked={selected.includes(item.id)} onChange={() => toggleOne(item.id)} /></td><td><strong>{item.brand_name}</strong><br /><span className="muted">{item.company_name ?? '-'}</span></td><td>{item.city ?? '-'} {item.province ? `(${item.province})` : ''}</td><td>{item.region ?? '-'}</td><td>{item.email ?? '-'}</td><td><StatusBadge status={item.status} /></td><td style={{ textAlign: 'right' }}><Link className="btn btn-soft" href={`/espositori/${item.id}`}>Apri</Link></td></tr>)}{rows.length === 0 ? <tr><td colSpan={7} className="muted">Nessun espositore presente.</td></tr> : null}</tbody></table>
  </section>;
}
