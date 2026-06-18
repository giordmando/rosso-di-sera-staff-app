import Link from 'next/link';
import { getStaffProfile } from '@/lib/auth/profile';
import { StaffLogout } from './StaffLogout';

export async function AppHeader() {
  const profile = await getStaffProfile().catch(() => null);
  const isAdmin = profile?.role === 'admin';
  return (
    <header className="app-header">
      <div className="container app-header-inner">
        <Link href="/dashboard" className="app-logo">Rosso di Sera <span>Staff</span></Link>
        <nav className="desktop-nav"><MegaMenu isAdmin={isAdmin} />{profile ? <span className="badge">{profile.role}</span> : null}<StaffLogout /></nav>
      </div>
    </header>
  );
}

function MegaMenu({ isAdmin }: { isAdmin: boolean }) {
  return <details className="mega-menu">
    <summary>Menu</summary>
    <div className="mega-menu-panel">
      <div className="mega-menu-section">
        <p>Operativita</p>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/espositori">Espositori</Link>
        <Link href="/pagamenti">Pagamenti</Link>
        <Link href="/report">Report</Link>
      </div>
      <div className="mega-menu-section">
        <p>Dati</p>
        <Link href="/sync/google-sheet">Sync Google Sheet</Link>
        <Link href="/candidatura">Nuova candidatura</Link>
      </div>
      {isAdmin ? <div className="mega-menu-section">
        <p>Admin</p>
        <Link href="/edizioni">Edizioni</Link>
        <Link href="/utenti">Utenti staff</Link>
        <Link href="/log">Log attivita</Link>
      </div> : null}
    </div>
  </details>;
}
