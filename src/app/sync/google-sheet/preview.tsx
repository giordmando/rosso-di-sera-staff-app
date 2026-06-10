'use client';

import { useState } from 'react';

type PreviewItem = {
  row: number;
  action: 'create' | 'update';
  conflict: boolean;
  existingId: string | null;
  record: Record<string, string>;
};

export function GoogleSheetSyncPreview() {
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    setMessage('');
    const response = await fetch('/api/sync/google-sheet/preview');
    const data = await response.json();
    setLoading(false);
    if (!response.ok) setMessage(data.message || 'Errore analisi');
    setItems(data.items ?? []);
  }

  const createCount = items.filter((item) => item.action === 'create').length;
  const updateCount = items.filter((item) => item.action === 'update').length;
  const conflictCount = items.filter((item) => item.conflict).length;

  return (
    <section className="card">
      <button className="btn btn-primary" type="button" onClick={analyze} disabled={loading}>{loading ? 'Analisi...' : 'Analizza Google Sheet'}</button>
      {message ? <p style={{ color: 'var(--wine)', fontWeight: 700 }}>{message}</p> : null}
      {items.length > 0 ? <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
        <div className="grid grid-3">
          <div className="card"><p>Nuovi</p><strong>{createCount}</strong></div>
          <div className="card"><p>Aggiornabili</p><strong>{updateCount}</strong></div>
          <div className="card"><p>Conflitti</p><strong>{conflictCount}</strong></div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ textAlign: 'left', color: 'var(--muted)' }}><th style={{ padding: 12 }}>Riga</th><th style={{ padding: 12 }}>Cantina</th><th style={{ padding: 12 }}>Email</th><th style={{ padding: 12 }}>Azione</th><th style={{ padding: 12 }}>Conflitto</th></tr></thead>
            <tbody>
              {items.map((item) => <tr key={item.row} style={{ borderTop: '1px solid var(--border)' }}><td style={{ padding: 12 }}>{item.row}</td><td style={{ padding: 12 }}>{item.record.Cantina}</td><td style={{ padding: 12 }}>{item.record.Email}</td><td style={{ padding: 12 }}>{item.action === 'create' ? 'Crea' : 'Aggiorna'}</td><td style={{ padding: 12 }}>{item.conflict ? 'Si' : 'No'}</td></tr>)}
            </tbody>
          </table>
        </div>
      </div> : null}
    </section>
  );
}
