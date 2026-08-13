create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  gender text,
  date_of_birth date,
  height_cm numeric,
  weight_kg numeric,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'User health and body profile data.';

-- Row-level security: users can only access their own profile.
alter table public.profiles enable row level security;

create policy "Users can select own profile"
  on public.profiles
  for select
  using (user_id = auth.uid());

create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (user_id = auth.uid());

create policy "Users can update own profile"
  on public.profiles
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Auto-update the updated_at timestamp on row changes.
create extension if not exists moddatetime schema extensions;

create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute procedure extensions.moddatetime(updated_at);

-- Create an empty profile row for every new auth user.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
