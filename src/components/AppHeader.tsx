import Link from 'next/link';
import { getStaffProfile } from '@/lib/auth/profile';
import { StaffLogout } from './StaffLogout';

export async function AppHeader() {
  const profile = await getStaffProfile().catch(() => null);
  return (
    <header style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,247,236,0.78)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', paddingTop: 16, paddingBottom: 16 }}>
        <Link href="/dashboard" style={{ fontWeight: 900, color: 'var(--wine)' }}>Rosso di Sera Staff</Link>
        <nav style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 14, alignItems: 'center' }}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/espositori">Espositori</Link>
          <Link href="/pagamenti">Pagamenti</Link>
          <Link href="/sync/google-sheet">Sync</Link>
          <Link href="/candidatura">Candidatura</Link>
          <Link href="/utenti">Utenti</Link>
          <Link href="/log">Log</Link>
          {profile ? <span style={{ border: '1px solid var(--border)', borderRadius: 999, padding: '4px 10px', color: 'var(--wine)', fontWeight: 800 }}>{profile.role}</span> : null}
          <StaffLogout />
        </nav>
      </div>
    </header>
  );
}
