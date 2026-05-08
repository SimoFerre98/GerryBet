-- Aggiunge la policy per permettere agli admin di vedere tutte le scommesse
create policy "Admins can view all bets" on bets for select using (exists(select 1 from profiles where id = auth.uid() and role = 'admin'));
