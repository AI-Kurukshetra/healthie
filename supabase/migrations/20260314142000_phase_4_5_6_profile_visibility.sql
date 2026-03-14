drop policy if exists "authenticated users read provider user rows" on public.users;
create policy "authenticated users read provider user rows" on public.users
for select using (
  exists (
    select 1
    from public.providers p
    where p.user_id = users.id
  )
  or auth.uid() = id
  or public.current_role() = 'admin'
);

drop policy if exists "providers read patient user rows for appointments" on public.users;
create policy "providers read patient user rows for appointments" on public.users
for select using (
  public.current_role() = 'provider'
  and exists (
    select 1
    from public.patients p
    join public.appointments a on a.patient_id = p.id
    where p.user_id = users.id
      and a.provider_id = public.current_provider_id()
  )
);

drop policy if exists "patients read provider user rows for appointments" on public.users;
create policy "patients read provider user rows for appointments" on public.users
for select using (
  public.current_role() = 'patient'
  and exists (
    select 1
    from public.providers p
    join public.appointments a on a.provider_id = p.id
    where p.user_id = users.id
      and a.patient_id = public.current_patient_id()
  )
);
