create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  gerry_points integer default 100,
  role text default 'user' check (role in ('user', 'admin')),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Abilita RLS
alter table profiles enable row level security;

-- Policy: Gli utenti possono leggere il proprio profilo
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

-- Policy: Solo gli admin possono modificare i GP
create policy "Admins can update profiles" on profiles
  for update using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Funzione per gestire i nuovi utenti
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, gerry_points, role)
  values (new.id, new.raw_user_meta_data->>'username', 100, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger per nuovi utenti
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
