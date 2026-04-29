-- Drop the old trigger and function to be safe
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Create the robust function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, gerry_points, role)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 
    100, 
    'user'
  );
  return new;
end;
$$;

-- Recreate the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
