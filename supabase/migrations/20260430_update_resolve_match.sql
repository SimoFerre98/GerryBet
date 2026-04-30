-- Aggiornamento della funzione resolve_match_bets per supportare il salvataggio del risultato testuale
create or replace function resolve_match_bets(p_match_id uuid, p_winning_odd_id uuid, p_result text)
returns void as $$
declare
  v_bet record;
  v_payout decimal;
  v_odds_value decimal;
begin
  -- Aggiorna lo stato del match e salva il risultato (es. "2-1")
  update matches 
  set status = 'closed', 
      result = p_result 
  where id = p_match_id and status = 'open';
  
  if not found then
    raise exception 'Match non trovato o già chiuso';
  end if;

  -- Ottengo il valore della quota vincente
  select value into v_odds_value from odds where id = p_winning_odd_id;
  
  -- Valuta tutte le scommesse pendenti per questo match
  for v_bet in 
    select id, user_id, amount_gp, odd_id 
    from bets 
    where match_id = p_match_id and status = 'pending' 
  loop
    if v_bet.odd_id = p_winning_odd_id then
      -- Scommessa Vinta
      v_payout := v_bet.amount_gp * v_odds_value;
      update bets set status = 'won' where id = v_bet.id;
      -- Accredita i punti al profilo dell'utente (usando floor per evitare decimali nel saldo)
      update profiles set gerry_points = gerry_points + floor(v_payout) where id = v_bet.user_id;
    else
      -- Scommessa Persa
      update bets set status = 'lost' where id = v_bet.id;
    end if;
  end loop;
end;
$$ language plpgsql security definer;
