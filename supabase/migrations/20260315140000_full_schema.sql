-- ============================================================
-- Healthie — Full Consolidated Schema
-- Merges: original schema + performance optimizations + RLS fixes
-- Safe to run on a fresh Supabase project
-- ============================================================

-- ===================
-- EXTENSIONS
-- ===================
create extension if not exists "pgcrypto";

-- ===================
-- HELPER FUNCTIONS
-- ===================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ===================
-- TABLES
-- ===================
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null check (role in ('patient', 'provider', 'admin')),
  organization_id uuid references public.organizations(id) on delete set null,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  date_of_birth date,
  phone text,
  emergency_contact text,
  insurance_provider text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  specialty text,
  license_number text,
  bio text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.provider_availability (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  slot_duration_minutes integer not null default 30 check (slot_duration_minutes > 0),
  timezone text not null default 'UTC',
  is_available boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint provider_availability_time_window check (start_time < end_time)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  scheduled_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  video_link text,
  reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.medical_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  provider_id uuid references public.providers(id) on delete set null,
  diagnosis text not null,
  notes text not null,
  treatment_plan text,
  document_path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.clinical_notes (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  subjective text not null,
  objective text not null,
  assessment text not null,
  plan text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  medication_name text not null,
  dosage text not null,
  instructions text not null,
  duration text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('message', 'appointment', 'prescription')),
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

-- ===================
-- INDEXES (original + performance additions)
-- ===================
create index if not exists appointments_patient_id_idx on public.appointments(patient_id);
create index if not exists appointments_provider_id_idx on public.appointments(provider_id);
create index if not exists appointments_scheduled_at_idx on public.appointments(scheduled_at);
create index if not exists appointments_status_idx on public.appointments(status);
create index if not exists medical_records_patient_id_idx on public.medical_records(patient_id);
create index if not exists medical_records_provider_id_idx on public.medical_records(provider_id);
create index if not exists clinical_notes_appointment_id_idx on public.clinical_notes(appointment_id);
create index if not exists clinical_notes_provider_id_idx on public.clinical_notes(provider_id);
create index if not exists clinical_notes_patient_id_idx on public.clinical_notes(patient_id);
create index if not exists prescriptions_patient_id_idx on public.prescriptions(patient_id);
create index if not exists prescriptions_provider_id_idx on public.prescriptions(provider_id);
create index if not exists messages_sender_receiver_idx on public.messages(sender_id, receiver_id);
create index if not exists messages_receiver_id_idx on public.messages(receiver_id);
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_user_type_idx on public.notifications(user_id, type);
create index if not exists users_role_idx on public.users(role);
create index if not exists audit_logs_entity_type_idx on public.audit_logs(entity_type, created_at desc);
create index if not exists provider_availability_provider_day_idx
  on public.provider_availability(provider_id, day_of_week, start_time);

-- ===================
-- TRIGGERS (updated_at)
-- ===================
drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists patients_set_updated_at on public.patients;
create trigger patients_set_updated_at
before update on public.patients
for each row execute function public.set_updated_at();

drop trigger if exists providers_set_updated_at on public.providers;
create trigger providers_set_updated_at
before update on public.providers
for each row execute function public.set_updated_at();

drop trigger if exists provider_availability_set_updated_at on public.provider_availability;
create trigger provider_availability_set_updated_at
before update on public.provider_availability
for each row execute function public.set_updated_at();

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

drop trigger if exists medical_records_set_updated_at on public.medical_records;
create trigger medical_records_set_updated_at
before update on public.medical_records
for each row execute function public.set_updated_at();

drop trigger if exists clinical_notes_set_updated_at on public.clinical_notes;
create trigger clinical_notes_set_updated_at
before update on public.clinical_notes
for each row execute function public.set_updated_at();

drop trigger if exists prescriptions_set_updated_at on public.prescriptions;
create trigger prescriptions_set_updated_at
before update on public.prescriptions
for each row execute function public.set_updated_at();

-- ===================
-- AUTH TRIGGER (auto-create user profile on signup)
-- ===================
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  incoming_role text := coalesce(new.raw_user_meta_data ->> 'role', 'patient');
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, incoming_role);

  if incoming_role = 'patient' then
    insert into public.patients (user_id) values (new.id);
  elsif incoming_role = 'provider' then
    insert into public.providers (user_id) values (new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- ===================
-- RLS HELPER FUNCTIONS (optimized with security invoker + search_path)
-- ===================
create or replace function public.current_role()
returns text
language sql
stable
security invoker
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.current_patient_id()
returns uuid
language sql
stable
security invoker
set search_path = public
as $$
  select id from public.patients where user_id = auth.uid()
$$;

create or replace function public.current_provider_id()
returns uuid
language sql
stable
security invoker
set search_path = public
as $$
  select id from public.providers where user_id = auth.uid()
$$;

-- ===================
-- ENABLE ROW LEVEL SECURITY
-- ===================
alter table public.users enable row level security;
alter table public.organizations enable row level security;
alter table public.patients enable row level security;
alter table public.providers enable row level security;
alter table public.provider_availability enable row level security;
alter table public.appointments enable row level security;
alter table public.medical_records enable row level security;
alter table public.clinical_notes enable row level security;
alter table public.prescriptions enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- ===================
-- RLS POLICIES: organizations
-- ===================
drop policy if exists "admins manage organizations" on public.organizations;
create policy "admins manage organizations" on public.organizations
for all using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

-- ===================
-- RLS POLICIES: users
-- ===================
drop policy if exists "users read own user row" on public.users;
create policy "users read own user row" on public.users
for select using (auth.uid() = id or public.current_role() = 'admin');

drop policy if exists "users update own profile" on public.users;
create policy "users update own profile" on public.users
for update using (auth.uid() = id or public.current_role() = 'admin')
with check (auth.uid() = id or public.current_role() = 'admin');

-- Any authenticated user can read user rows for providers (needed for booking dropdown joins)
drop policy if exists "authenticated users read provider user rows" on public.users;
create policy "authenticated users read provider user rows" on public.users
for select using (
  exists (select 1 from public.providers p where p.user_id = users.id)
  or auth.uid() = id
  or public.current_role() = 'admin'
);

-- Providers can read user rows for all patients (needed for patient list joins)
drop policy if exists "providers read all patient user rows" on public.users;
create policy "providers read all patient user rows" on public.users
for select using (
  public.current_role() = 'provider'
  and exists (select 1 from public.patients p where p.user_id = users.id)
);

-- Patients can read user rows for all providers (needed for provider list joins)
drop policy if exists "patients read all provider user rows" on public.users;
create policy "patients read all provider user rows" on public.users
for select using (
  public.current_role() = 'patient'
  and exists (select 1 from public.providers p where p.user_id = users.id)
);

-- ===================
-- RLS POLICIES: patients
-- ===================
drop policy if exists "patients read own profile" on public.patients;
create policy "patients read own profile" on public.patients
for select using (user_id = auth.uid() or public.current_role() = 'admin');

-- Providers can read all patient profiles (not just those with appointments)
drop policy if exists "providers read all patient profiles" on public.patients;
create policy "providers read all patient profiles" on public.patients
for select using (public.current_role() = 'provider');

-- ===================
-- RLS POLICIES: providers
-- ===================
-- All authenticated users can read provider profiles (patients need this for booking)
drop policy if exists "authenticated users read providers" on public.providers;
create policy "authenticated users read providers" on public.providers
for select using (auth.role() = 'authenticated');

-- Providers/admins can manage their own provider row
drop policy if exists "providers manage own provider row" on public.providers;
create policy "providers manage own provider row" on public.providers
for all using (user_id = auth.uid() or public.current_role() = 'admin')
with check (user_id = auth.uid() or public.current_role() = 'admin');

-- ===================
-- RLS POLICIES: provider_availability
-- ===================
drop policy if exists "authenticated users read provider availability" on public.provider_availability;
create policy "authenticated users read provider availability" on public.provider_availability
for select using (auth.role() = 'authenticated');

drop policy if exists "providers manage own availability" on public.provider_availability;
create policy "providers manage own availability" on public.provider_availability
for all using (provider_id = public.current_provider_id() or public.current_role() = 'admin')
with check (provider_id = public.current_provider_id() or public.current_role() = 'admin');

-- ===================
-- RLS POLICIES: appointments
-- ===================
drop policy if exists "patients read own appointments" on public.appointments;
create policy "patients read own appointments" on public.appointments
for select using (patient_id = public.current_patient_id() or public.current_role() = 'admin');

drop policy if exists "patients create appointments" on public.appointments;
create policy "patients create appointments" on public.appointments
for insert with check (patient_id = public.current_patient_id() or public.current_role() = 'admin');

drop policy if exists "patients update own appointments" on public.appointments;
create policy "patients update own appointments" on public.appointments
for update using (patient_id = public.current_patient_id() or public.current_role() = 'admin')
with check (patient_id = public.current_patient_id() or public.current_role() = 'admin');

drop policy if exists "patients delete own appointments" on public.appointments;
create policy "patients delete own appointments" on public.appointments
for delete using (patient_id = public.current_patient_id() or public.current_role() = 'admin');

drop policy if exists "providers manage their appointments" on public.appointments;
create policy "providers manage their appointments" on public.appointments
for all using (provider_id = public.current_provider_id() or public.current_role() = 'admin')
with check (provider_id = public.current_provider_id() or public.current_role() = 'admin');

-- ===================
-- RLS POLICIES: medical_records
-- ===================
drop policy if exists "patients read own medical records" on public.medical_records;
create policy "patients read own medical records" on public.medical_records
for select using (patient_id = public.current_patient_id() or public.current_role() = 'admin');

drop policy if exists "providers manage patient records" on public.medical_records;
create policy "providers manage patient records" on public.medical_records
for all using (provider_id = public.current_provider_id() or public.current_role() = 'admin')
with check (provider_id = public.current_provider_id() or public.current_role() = 'admin');

-- ===================
-- RLS POLICIES: clinical_notes
-- ===================
drop policy if exists "patients read own notes" on public.clinical_notes;
create policy "patients read own notes" on public.clinical_notes
for select using (patient_id = public.current_patient_id() or public.current_role() = 'admin');

drop policy if exists "providers manage own notes" on public.clinical_notes;
create policy "providers manage own notes" on public.clinical_notes
for all using (provider_id = public.current_provider_id() or public.current_role() = 'admin')
with check (provider_id = public.current_provider_id() or public.current_role() = 'admin');

-- ===================
-- RLS POLICIES: prescriptions
-- ===================
drop policy if exists "patients read own prescriptions" on public.prescriptions;
create policy "patients read own prescriptions" on public.prescriptions
for select using (patient_id = public.current_patient_id() or public.current_role() = 'admin');

drop policy if exists "providers manage prescriptions" on public.prescriptions;
create policy "providers manage prescriptions" on public.prescriptions
for all using (provider_id = public.current_provider_id() or public.current_role() = 'admin')
with check (provider_id = public.current_provider_id() or public.current_role() = 'admin');

-- ===================
-- RLS POLICIES: messages
-- ===================
drop policy if exists "users read own messages" on public.messages;
create policy "users read own messages" on public.messages
for select using (sender_id = auth.uid() or receiver_id = auth.uid() or public.current_role() = 'admin');

drop policy if exists "users send messages" on public.messages;
create policy "users send messages" on public.messages
for insert with check (sender_id = auth.uid() or public.current_role() = 'admin');

-- ===================
-- RLS POLICIES: notifications
-- ===================
drop policy if exists "users read own notifications" on public.notifications;
create policy "users read own notifications" on public.notifications
for select using (user_id = auth.uid() or public.current_role() = 'admin');

drop policy if exists "users update own notifications" on public.notifications;
create policy "users update own notifications" on public.notifications
for update using (user_id = auth.uid() or public.current_role() = 'admin')
with check (user_id = auth.uid() or public.current_role() = 'admin');

-- ===================
-- RLS POLICIES: audit_logs
-- ===================
drop policy if exists "admins read audit logs" on public.audit_logs;
create policy "admins read audit logs" on public.audit_logs
for select using (public.current_role() = 'admin');

-- ===================
-- STORAGE: medical documents bucket
-- ===================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'medical-documents',
  'medical-documents',
  false,
  52428800,
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS
drop policy if exists "admins manage medical documents" on storage.objects;
create policy "admins manage medical documents" on storage.objects
for all using (bucket_id = 'medical-documents' and public.current_role() = 'admin')
with check (bucket_id = 'medical-documents' and public.current_role() = 'admin');

drop policy if exists "authenticated users read own medical documents" on storage.objects;
create policy "authenticated users read own medical documents" on storage.objects
for select using (
  bucket_id = 'medical-documents'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "authenticated users upload own medical documents" on storage.objects;
create policy "authenticated users upload own medical documents" on storage.objects
for insert with check (
  bucket_id = 'medical-documents'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "authenticated users update own medical documents" on storage.objects;
create policy "authenticated users update own medical documents" on storage.objects
for update using (
  bucket_id = 'medical-documents'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'medical-documents'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "authenticated users delete own medical documents" on storage.objects;
create policy "authenticated users delete own medical documents" on storage.objects
for delete using (
  bucket_id = 'medical-documents'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- ===================
-- REALTIME: only messages + notifications (not appointments)
-- ===================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    execute 'alter publication supabase_realtime add table public.messages';
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    execute 'alter publication supabase_realtime add table public.notifications';
  end if;
end
$$;

-- ===================
-- HELPER FUNCTIONS for script-based management (exec_sql, run_ddl)
-- ===================
create or replace function exec_sql(query text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  result jsonb;
begin
  execute 'select coalesce(jsonb_agg(row_to_json(t)), ''[]''::jsonb) from (' || query || ') t'
    into result;
  return result;
exception when others then
  return jsonb_build_object('error', SQLERRM);
end;
$fn$;

create or replace function run_ddl(query text)
returns text
language plpgsql
security definer
set search_path = public
as $fn$
begin
  execute query;
  return 'ok';
exception when others then
  return SQLERRM;
end;
$fn$;

-- ===================
-- ANALYZE all tables for query planner
-- ===================
analyze public.users;
analyze public.patients;
analyze public.providers;
analyze public.organizations;
analyze public.provider_availability;
analyze public.appointments;
analyze public.medical_records;
analyze public.clinical_notes;
analyze public.prescriptions;
analyze public.messages;
analyze public.notifications;
analyze public.audit_logs;
