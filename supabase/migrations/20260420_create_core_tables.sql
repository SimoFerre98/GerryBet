create table teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null,
  power_ranking integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table matches (
  id uuid default gen_random_uuid() primary key,
  team_a_id uuid references teams(id) not null,
  team_b_id uuid references teams(id) not null,
  start_time timestamp with time zone not null,
  status text default 'open' check (status in ('open', 'closed')),
  result text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table odds (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references matches(id) on delete cascade not null,
  type text not null,
  description text not null,
  value decimal not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table bets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  match_id uuid references matches(id) not null,
  odd_id uuid references odds(id) not null,
  amount_gp integer not null check (amount_gp > 0),
  status text default 'pending' check (status in ('pending', 'won', 'lost')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Abilita RLS
alter table teams enable row level security;
alter table matches enable row level security;
alter table odds enable row level security;
alter table bets enable row level security;

-- Policies per Teams
create policy "Anyone can view teams" on teams for select using (true);
create policy "Admins can insert teams" on teams for insert with check (exists(select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Policies per Matches
create policy "Anyone can view matches" on matches for select using (true);
create policy "Admins can insert matches" on matches for insert with check (exists(select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can update matches" on matches for update using (exists(select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Policies per Odds
create policy "Anyone can view odds" on odds for select using (true);
create policy "Admins can insert odds" on odds for insert with check (exists(select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Policies per Bets
create policy "Users can view own bets" on bets for select using (auth.uid() = user_id);
create policy "Users can place bets" on bets for insert with check (auth.uid() = user_id);
create policy "Admins can update bets status" on bets for update using (exists(select 1 from profiles where id = auth.uid() and role = 'admin'));
