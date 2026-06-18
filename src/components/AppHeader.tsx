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
        <details className="mobile-menu"><summary>Menu</summary><nav className="mobile-menu-panel"><NavLinks isAdmin={isAdmin} /><div className="mobile-actions">{profile ? <span className="badge">{profile.role}</span> : null}<StaffLogout /></div></nav></details>
        <nav className="desktop-nav"><NavLinks isAdmin={isAdmin} />{profile ? <span className="badge">{profile.role}</span> : null}<StaffLogout /></nav>
      </div>
    </header>
  );
}

function NavLinks({ isAdmin }: { isAdmin: boolean }) {
  return <>
    <span className="nav-section"><Link href="/dashboard">Dashboard</Link><Link href="/espositori">Espositori</Link><Link href="/pagamenti">Pagamenti</Link><Link href="/report">Report</Link></span>
    <span className="nav-section nav-section-accent"><Link href="/sync/google-sheet">Sync</Link><Link href="/candidatura">Candidatura</Link></span>
    {isAdmin ? <span className="nav-section nav-section-admin"><Link href="/edizioni">Edizioni</Link><Link href="/utenti">Utenti</Link><Link href="/log">Log</Link></span> : null}
  </>;
}
