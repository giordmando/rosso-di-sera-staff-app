alter table public.profiles enable row level security;
alter table public.editions enable row level security;
alter table public.exhibitor_types enable row level security;
alter table public.exhibitors enable row level security;
alter table public.payments enable row level security;
alter table public.activity_logs enable row level security;
alter table public.sheet_sync_logs enable row level security;

create or replace function public.current_user_role()
returns text
language sql
security definer
as $$
  select role from public.profiles where id = auth.uid() and is_active = true;
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
as $$
  select public.current_user_role() = 'admin';
$$;

create policy "staff can read profiles" on public.profiles
for select using (auth.uid() is not null);

create policy "admin can manage profiles" on public.profiles
for all using (public.is_admin()) with check (public.is_admin());

create policy "staff can read editions" on public.editions
for select using (auth.uid() is not null);

create policy "admin can manage editions" on public.editions
for all using (public.is_admin()) with check (public.is_admin());

create policy "staff can read exhibitor types" on public.exhibitor_types
for select using (auth.uid() is not null);

create policy "admin can manage exhibitor types" on public.exhibitor_types
for all using (public.is_admin()) with check (public.is_admin());

create policy "staff can read exhibitors" on public.exhibitors
for select using (auth.uid() is not null);

create policy "staff can insert exhibitors" on public.exhibitors
for insert with check (auth.uid() is not null and created_by = auth.uid());

create policy "staff can update exhibitors" on public.exhibitors
for update using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "admin can delete exhibitors" on public.exhibitors
for delete using (public.is_admin());

create policy "operator can delete own exhibitors" on public.exhibitors
for delete using (created_by = auth.uid());

create policy "staff can read payments" on public.payments
for select using (auth.uid() is not null);

create policy "staff can insert payments" on public.payments
for insert with check (auth.uid() is not null and registered_by = auth.uid());

create policy "admin can update payments" on public.payments
for update using (public.is_admin()) with check (public.is_admin());

create policy "admin can delete payments" on public.payments
for delete using (public.is_admin());

create policy "staff can read logs" on public.activity_logs
for select using (auth.uid() is not null);

create policy "system or admin can insert logs" on public.activity_logs
for insert with check (auth.uid() is not null);

create policy "admin can read sheet sync logs" on public.sheet_sync_logs
for select using (public.is_admin());

create policy "admin can insert sheet sync logs" on public.sheet_sync_logs
for insert with check (public.is_admin());
