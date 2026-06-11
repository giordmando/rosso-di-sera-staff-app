create table if not exists public.staff_activities (
  id uuid primary key default uuid_generate_v4(),
  edition_id uuid references public.editions(id) on delete cascade,
  exhibitor_id uuid not null references public.exhibitors(id) on delete cascade,
  staff_user_id uuid references public.profiles(id),
  activity_type text not null check (activity_type in ('phone','whatsapp','email','sms','meeting','payment_reminder','note','other')),
  outcome text,
  notes text,
  follow_up_at timestamptz,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists staff_activities_exhibitor_idx on public.staff_activities(exhibitor_id, created_at desc);
create index if not exists staff_activities_follow_up_idx on public.staff_activities(follow_up_at) where completed = false;

alter table public.staff_activities enable row level security;

drop policy if exists "staff can read activities" on public.staff_activities;
create policy "staff can read activities" on public.staff_activities for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_active = true)
);

drop policy if exists "staff can insert activities" on public.staff_activities;
create policy "staff can insert activities" on public.staff_activities for insert with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_active = true)
);

drop policy if exists "staff can update activities" on public.staff_activities;
create policy "staff can update activities" on public.staff_activities for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_active = true)
);
