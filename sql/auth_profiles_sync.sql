-- Create a table for public profiles (idempotent)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  role text default 'user' check (role in ('user', 'admin', 'client', 'team_member')),

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policies (idempotent)
do $$
begin
    if not exists (select 1 from pg_policies where policyname = 'Public profiles are viewable by everyone.' and tablename = 'profiles') then
        create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
    end if;

    if not exists (select 1 from pg_policies where policyname = 'Users can insert their own profile.' and tablename = 'profiles') then
        create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
    end if;

    if not exists (select 1 from pg_policies where policyname = 'Users can update own profile.' and tablename = 'profiles') then
        create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);
    end if;
end $$;

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id, 
    new.raw_user_meta_data->>'display_name', 
    new.raw_user_meta_data->>'avatar_url', 
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Also handle metadata updates
create or replace function public.handle_user_update()
returns trigger as $$
begin
  update public.profiles
  set 
    full_name = new.raw_user_meta_data->>'display_name',
    avatar_url = new.raw_user_meta_data->>'avatar_url',
    role = coalesce(new.raw_user_meta_data->>'role', role),
    updated_at = now()
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_user_update();
