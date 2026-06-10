create table if not exists public.staff_access (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  role text not null default 'operator' check (role in ('admin', 'operator')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.staff_access enable row level security;

drop policy if exists "staff access read active staff" on public.staff_access;
create policy "staff access read active staff" on public.staff_access
for select to authenticated
using (true);
