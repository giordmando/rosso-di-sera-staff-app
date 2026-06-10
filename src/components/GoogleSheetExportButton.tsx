'use client';

import { useState } from 'react';

export function GoogleSheetExportButton() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    setMessage('');
    const response = await fetch('/api/export/google-sheet', { method: 'POST' });
    const data = await response.json();
    setLoading(false);
    setMessage(data.message || (response.ok ? 'Google Sheet aggiornato' : 'Errore esportazione'));
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <button className="btn btn-secondary" type="button" onClick={handleClick} disabled={loading}>
        {loading ? 'Esportazione...' : 'Esporta su Google Sheet'}
      </button>
      {message ? <small style={{ color: 'var(--muted)' }}>{message}</small> : null}
    </div>
  );
}
