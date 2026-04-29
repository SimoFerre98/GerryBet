create table players (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references teams(id) on delete cascade not null,
  name text not null,
  category text not null check (category in ('Eccellenza', 'Promozione', 'Prima Categoria', 'Altro/Amatoriale')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table players enable row level security;
create policy "Anyone can view players" on players for select using (true);
create policy "Admins can manage players" on players using (exists(select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Trigger per calcolare il power_ranking della squadra in automatico quando vengono aggiunti giocatori
create or replace function calculate_team_power() returns trigger as $$
declare
  v_score integer;
begin
  select coalesce(sum(
    case category
      when 'Eccellenza' then 4
      when 'Promozione' then 3
      when 'Prima Categoria' then 2
      else 1
    end
  ), 0) into v_score
  from players
  where team_id = coalesce(new.team_id, old.team_id);
  
  update teams set power_ranking = v_score where id = coalesce(new.team_id, old.team_id);
  return null;
end;
$$ language plpgsql;

create trigger update_team_power
after insert or update or delete on players
for each row execute function calculate_team_power();

-- RPC func for resolving match bets
create or replace function resolve_match_bets(p_match_id uuid, p_winning_odd_id uuid)
returns void as $$
declare
  v_bet record;
  v_payout decimal;
  v_odds_value decimal;
begin
  -- Controllo che il match esista
  update matches set status = 'closed', result = 'completed' where id = p_match_id and status = 'open';
  
  if not found then
    raise exception 'Match not found or already closed';
  end if;

  -- Ottengo il valore della quota vincente
  select value into v_odds_value from odds where id = p_winning_odd_id;
  
  -- Eval bets
  for v_bet in select id, user_id, amount_gp, odd_id from bets where match_id = p_match_id and status = 'pending' loop
    if v_bet.odd_id = p_winning_odd_id then
      v_payout := v_bet.amount_gp * v_odds_value;
      update bets set status = 'won' where id = v_bet.id;
      update profiles set gerry_points = gerry_points + floor(v_payout) where id = v_bet.user_id;
    else
      update bets set status = 'lost' where id = v_bet.id;
    end if;
  end loop;
end;
$$ language plpgsql security definer;
