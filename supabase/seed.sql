insert into public.editions (year, name, location, max_exhibitors, exhibitor_fee)
values (2026, 'Rosso di Sera 2026', 'Villa Bonaparte, Porto San Giorgio', 45, 183.00)
on conflict (year) do nothing;

insert into public.exhibitor_types (name)
values
  ('Cantina vitivinicola'),
  ('Azienda agricola Olio EVO'),
  ('Pasticceria'),
  ('Gastronomia'),
  ('Sponsor'),
  ('Partner istituzionale'),
  ('Altro')
on conflict (name) do nothing;
