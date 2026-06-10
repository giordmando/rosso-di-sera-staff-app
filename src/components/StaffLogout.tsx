'use client';

import { createClient } from '@/lib/supabase/client';

export function StaffLogout() {
  async function handleClick() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign('/login');
  }

  return <button onClick={handleClick} className="btn btn-secondary" type="button">Esci</button>;
}
