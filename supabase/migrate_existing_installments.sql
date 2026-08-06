-- Corrige parcelamentos criados pela regra antiga, na qual o valor informado
-- era dividido pela quantidade de parcelas.
--
-- IMPORTANTE: execute este arquivo apenas uma vez no SQL Editor do Supabase.
-- Ele considera que total_amount ainda guarda o valor originalmente digitado.

begin;

update public.entries
set
  -- Se a parcela estava totalmente paga pela regra antiga, mantém o status
  -- de quitação usando o novo valor integral da parcela.
  paid = case
    when paid >= amount then total_amount
    else paid
  end,
  amount = total_amount,
  total_amount = total_amount * installment_count
where installment_count > 1
  and total_amount is not null
  and group_id is not null;

commit;

