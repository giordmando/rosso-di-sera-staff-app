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
  return <><Link href="/dashboard">Dashboard</Link><Link href="/espositori">Espositori</Link><Link href="/pagamenti">Pagamenti</Link><Link href="/sync/google-sheet">Sync</Link><Link href="/candidatura">Candidatura</Link>{isAdmin ? <Link href="/utenti">Utenti</Link> : null}{isAdmin ? <Link href="/log">Log</Link> : null}</>;
}
