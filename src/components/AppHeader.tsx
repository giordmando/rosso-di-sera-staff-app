import Link from 'next/link';
import { StaffLogout } from './StaffLogout';

export function AppHeader() {
  return (
    <header style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,247,236,0.78)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', paddingTop: 16, paddingBottom: 16 }}>
        <Link href="/dashboard" style={{ fontWeight: 900, color: 'var(--wine)' }}>Rosso di Sera Staff</Link>
        <nav style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 14, alignItems: 'center' }}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/espositori">Espositori</Link>
          <Link href="/pagamenti">Pagamenti</Link>
          <Link href="/candidatura">Candidatura</Link>
          <Link href="/utenti">Utenti</Link>
          <StaffLogout />
        </nav>
      </div>
    </header>
  );
}
