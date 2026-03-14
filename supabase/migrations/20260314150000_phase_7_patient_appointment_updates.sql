drop policy if exists "patients update own appointments" on public.appointments;
create policy "patients update own appointments" on public.appointments
for update using (
  patient_id = public.current_patient_id() or public.current_role() = 'admin'
)
with check (
  patient_id = public.current_patient_id() or public.current_role() = 'admin'
);

drop policy if exists "patients delete own appointments" on public.appointments;
create policy "patients delete own appointments" on public.appointments
for delete using (
  patient_id = public.current_patient_id() or public.current_role() = 'admin'
);
