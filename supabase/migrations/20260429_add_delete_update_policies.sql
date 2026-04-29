-- Policies per Teams
create policy "Admins can update teams" on teams for update using (exists(select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can delete teams" on teams for delete using (exists(select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Policies per Matches
create policy "Admins can delete matches" on matches for delete using (exists(select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Policies per Players
create policy "Admins can delete players" on players for delete using (exists(select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Policies per Odds
create policy "Admins can delete odds" on odds for delete using (exists(select 1 from profiles where id = auth.uid() and role = 'admin'));
