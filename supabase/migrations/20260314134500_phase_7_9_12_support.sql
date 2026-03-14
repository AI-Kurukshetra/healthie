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

create index if not exists provider_availability_provider_day_idx
  on public.provider_availability(provider_id, day_of_week, start_time);

drop trigger if exists provider_availability_set_updated_at on public.provider_availability;
create trigger provider_availability_set_updated_at
before update on public.provider_availability
for each row execute function public.set_updated_at();

alter table public.provider_availability enable row level security;

drop policy if exists "authenticated users read provider availability" on public.provider_availability;
create policy "authenticated users read provider availability" on public.provider_availability
for select using (auth.role() = 'authenticated');

drop policy if exists "providers manage own availability" on public.provider_availability;
create policy "providers manage own availability" on public.provider_availability
for all using (provider_id = public.current_provider_id() or public.current_role() = 'admin')
with check (provider_id = public.current_provider_id() or public.current_role() = 'admin');

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

drop policy if exists "admins manage medical documents" on storage.objects;
create policy "admins manage medical documents" on storage.objects
for all using (
  bucket_id = 'medical-documents' and public.current_role() = 'admin'
)
with check (
  bucket_id = 'medical-documents' and public.current_role() = 'admin'
);

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

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    execute 'alter publication supabase_realtime add table public.messages';
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    execute 'alter publication supabase_realtime add table public.notifications';
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'appointments'
  ) then
    execute 'alter publication supabase_realtime add table public.appointments';
  end if;
end
$$;
