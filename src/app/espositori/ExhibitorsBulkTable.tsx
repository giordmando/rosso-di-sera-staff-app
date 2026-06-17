'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/StatusBadge';
import type { ExhibitorStatus } from '@/types/database';

export type ExhibitorBulkRow = {
  id: string;
  brand_name: string;
  company_name: string | null;
  city: string | null;
  province: string | null;
  region: string | null;
  status: ExhibitorStatus;
  email: string | null;
};

const statusOptions: Array<{ value: ExhibitorStatus; label: string }> = [
  { value: 'bozza', label: 'Bozza' },
  { value: 'candidatura_ricevuta', label: 'Candidatura ricevuta' },
  { value: 'in_valutazione', label: 'In valutazione' },
  { value: 'accettato', label: 'Accettato' },
  { value: 'in_attesa_pagamento', label: 'In attesa pagamento' },
  { value: 'confermato', label: 'Confermato' },
  { value: 'rifiutato', label: 'Rifiutato' },
  { value: 'rinunciato', label: 'Rinunciato' },
];

function normalize(value: string | null | undefined) {
  return String(value ?? '').trim().toLowerCase();
}

function possibleDuplicate(row: ExhibitorBulkRow, rows: ExhibitorBulkRow[]) {
  const email = normalize(row.email);
  const brand = normalize(row.brand_name);
  if (email && rows.filter((item) => normalize(item.email) === email).length > 1) return true;
  if (brand && rows.filter((item) => normalize(item.brand_name) === brand).length > 1) return true;
  return false;
}

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export function ExhibitorsBulkTable({ rows }: { rows: ExhibitorBulkRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<ExhibitorStatus>('in_valutazione');
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const allSelected = rows.length > 0 && selected.length === rows.length;
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const duplicateCount = useMemo(() => rows.filter((row) => possibleDuplicate(row, rows)).length, [rows]);

  function toggleAll() {
    setSelected(allSelected ? [] : rows.map((row) => row.id));
  }

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function bulkStatus() {
    setMessage('Aggiornamento massivo in corso...');
    const response = await fetch('/api/exhibitors/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'status', status, ids: selected }),
    });
    const data = await safeJson(response);
    setMessage(`${response.ok ? '✓' : '⚠'} ${data.message || 'Operazione completata'}`);
    if (response.ok) {
      setSelected([]);
      startTransition(() => router.refresh());
    }
  }

  async function bulkDelete() {
    const ok = window.confirm(`Eliminare ${selected.length} espositori selezionati? Operazione non annullabile.`);
    if (!ok) return;
    setMessage('Eliminazione massiva in corso...');
    const response = await fetch('/api/exhibitors/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', ids: selected }),
    });
    const data = await safeJson(response);
    setMessage(`${response.ok ? '✓' : '⚠'} ${data.message || 'Operazione completata'}`);
    if (response.ok) {
      setSelected([]);
      startTransition(() => router.refresh());
    }
  }

  return <>
    <section className="card" style={{ marginBottom: 24 }}>
      <div className="toolbar" style={{ justifyContent: 'space-between', gap: 16 }}>
        <div>
          <strong>{selected.length} selezionati</strong>
          <p className="muted" style={{ margin: '4px 0 0' }}>Seleziona più espositori per aggiornare stato o cancellare in blocco.</p>
        </div>
        <div className="toolbar page-actions" style={{ justifyContent: 'flex-end' }}>
          <select value={status} onChange={(event) => setStatus(event.target.value as ExhibitorStatus)} disabled={selected.length === 0 || isPending}>
            {statusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <button className="btn btn-secondary" type="button" onClick={bulkStatus} disabled={selected.length === 0 || isPending}>Aggiorna stato</button>
          <button className="btn btn-soft" type="button" onClick={bulkDelete} disabled={selected.length === 0 || isPending}>Elimina selezionati</button>
        </div>
      </div>
      {duplicateCount > 0 ? <p className="badge" style={{ marginTop: 16 }}>⚠ {duplicateCount} righe mostrano possibili duplicati per email o denominazione. Verifica prima di fare azioni massive.</p> : null}
      {message ? <p className="badge" style={{ marginTop: 16 }}>{message}</p> : null}
    </section>

    <section className="card table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Seleziona tutti" /></th>
            <th>Azienda</th>
            <th>Località</th>
            <th>Regione</th>
            <th>Email</th>
            <th>Stato</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => {
            const isDuplicate = possibleDuplicate(item, rows);
            return <tr key={item.id}>
              <td><input type="checkbox" checked={selectedSet.has(item.id)} onChange={() => toggle(item.id)} aria-label={`Seleziona ${item.brand_name}`} /></td>
              <td><strong>{item.brand_name}</strong>{isDuplicate ? <span className="badge" style={{ marginLeft: 8 }}>Duplicato?</span> : null}<br /><span className="muted">{item.company_name ?? '-'}</span></td>
              <td>{item.city ?? '-'} {item.province ? `(${item.province})` : ''}</td>
              <td>{item.region ?? '-'}</td>
              <td>{item.email ?? '-'}</td>
              <td><StatusBadge status={item.status} /></td>
              <td style={{ textAlign: 'right' }}><Link className="btn btn-soft" href={`/espositori/${item.id}`}>Apri</Link></td>
            </tr>;
          })}
          {rows.length === 0 ? <tr><td colSpan={7} className="muted">Nessun espositore presente.</td></tr> : null}
        </tbody>
      </table>
    </section>
  </>;
}
