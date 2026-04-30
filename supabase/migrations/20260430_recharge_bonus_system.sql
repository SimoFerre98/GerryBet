-- Aggiunge il contatore ricariche al profilo
-- Ogni volta che un admin aggiunge GC, questo contatore si incrementa
-- Dopo 3 ricariche, l'utente riceve un bonus di 50 GC
alter table profiles add column if not exists recharge_count integer default 0;

-- Aggiorna la funzione di creazione utente: NIENTE bonus iscrizione (0 GC)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, gerry_points, recharge_count, role)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 
    0,
    0,
    'user'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
