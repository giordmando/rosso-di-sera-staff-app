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
        <details className="mobile-menu"><summary>Menu</summary><nav className="mobile-menu-panel"><NavGroups isAdmin={isAdmin} /><div className="mobile-actions">{profile ? <span className="badge">{profile.role}</span> : null}<StaffLogout /></div></nav></details>
        <nav className="desktop-nav"><NavGroups isAdmin={isAdmin} />{profile ? <span className="badge">{profile.role}</span> : null}<StaffLogout /></nav>
      </div>
    </header>
  );
}

function NavGroups({ isAdmin }: { isAdmin: boolean }) {
  return <>
    <details className="nav-group"><summary>Operativita</summary><div className="nav-dropdown"><Link href="/dashboard">Dashboard</Link><Link href="/espositori">Espositori</Link><Link href="/pagamenti">Pagamenti</Link><Link href="/report">Report</Link></div></details>
    <details className="nav-group"><summary>Dati</summary><div className="nav-dropdown"><Link href="/sync/google-sheet">Sync</Link><Link href="/candidatura">Candidatura</Link></div></details>
    {isAdmin ? <details className="nav-group"><summary>Admin</summary><div className="nav-dropdown"><Link href="/edizioni">Edizioni</Link><Link href="/utenti">Utenti</Link><Link href="/log">Log</Link></div></details> : null}
  </>;
}
