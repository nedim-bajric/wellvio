-- Diet module tables and active-plan link.

-- Generated diet plans.

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  target_calories integer not null,
  target_protein numeric not null,
  target_carbs numeric not null,
  target_fat numeric not null,
  daily_deficit numeric not null,
  days_to_target integer not null,
  rate text not null check (rate in ('mild', 'moderate', 'aggressive')),
  safe boolean not null default true,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.plans is 'User-generated diet plans.';

-- Diet-related fields on the user's profile.
alter table public.profiles
  add column goal_weight_kg numeric,
  add column activity_level text check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'veryActive')),
  add column target_date date,
  add column health_disclaimer_acknowledged boolean not null default false,
  add column active_plan_id uuid references public.plans (id) on delete set null;

comment on column public.profiles.goal_weight_kg is 'User goal weight in kilograms.';
comment on column public.profiles.activity_level is 'User activity level for TDEE calculation.';
comment on column public.profiles.target_date is 'Target date for reaching the goal weight.';
comment on column public.profiles.health_disclaimer_acknowledged is 'Whether the user has accepted the health disclaimer.';
comment on column public.profiles.active_plan_id is 'The plan currently active for this user.';

-- User-created food catalog items.
create table public.foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  calories_per_100g numeric not null,
  protein_per_100g numeric not null,
  carbs_per_100g numeric not null,
  fat_per_100g numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.foods is 'User-created food catalog.';

-- Logged food entries.
create table public.log_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  food_id uuid references public.foods (id) on delete set null,
  food_name text not null,
  grams numeric not null,
  calories numeric not null,
  protein numeric not null,
  carbs numeric not null,
  fat numeric not null,
  meal_slot text not null check (meal_slot in ('breakfast', 'lunch', 'dinner', 'snacks')),
  logged_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.log_entries is 'Individual food log entries.';

-- Weight log entries.
create table public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  weight_kg numeric not null,
  logged_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.weight_logs is 'User weight entries.';

-- Row-level security: users can only access their own rows.
alter table public.plans enable row level security;
alter table public.foods enable row level security;
alter table public.log_entries enable row level security;
alter table public.weight_logs enable row level security;

-- Profiles already has RLS; add a policy so users can update their own active plan.
create policy "Users can update own active plan"
  on public.profiles
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Plans policies.
create policy "Users can select own plans"
  on public.plans
  for select
  using (user_id = auth.uid());

create policy "Users can insert own plans"
  on public.plans
  for insert
  with check (user_id = auth.uid());

create policy "Users can update own plans"
  on public.plans
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own plans"
  on public.plans
  for delete
  using (user_id = auth.uid());

-- Foods policies.
create policy "Users can select own foods"
  on public.foods
  for select
  using (user_id = auth.uid());

create policy "Users can insert own foods"
  on public.foods
  for insert
  with check (user_id = auth.uid());

create policy "Users can update own foods"
  on public.foods
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own foods"
  on public.foods
  for delete
  using (user_id = auth.uid());

-- Log entries policies.
create policy "Users can select own log entries"
  on public.log_entries
  for select
  using (user_id = auth.uid());

create policy "Users can insert own log entries"
  on public.log_entries
  for insert
  with check (user_id = auth.uid());

create policy "Users can update own log entries"
  on public.log_entries
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own log entries"
  on public.log_entries
  for delete
  using (user_id = auth.uid());

-- Weight logs policies.
create policy "Users can select own weight logs"
  on public.weight_logs
  for select
  using (user_id = auth.uid());

create policy "Users can insert own weight logs"
  on public.weight_logs
  for insert
  with check (user_id = auth.uid());

create policy "Users can update own weight logs"
  on public.weight_logs
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own weight logs"
  on public.weight_logs
  for delete
  using (user_id = auth.uid());

-- Auto-update updated_at on row changes.
create extension if not exists moddatetime schema extensions;

create trigger plans_updated_at
  before update on public.plans
  for each row
  execute procedure extensions.moddatetime(updated_at);

create trigger foods_updated_at
  before update on public.foods
  for each row
  execute procedure extensions.moddatetime(updated_at);

create trigger log_entries_updated_at
  before update on public.log_entries
  for each row
  execute procedure extensions.moddatetime(updated_at);

create trigger weight_logs_updated_at
  before update on public.weight_logs
  for each row
  execute procedure extensions.moddatetime(updated_at);
