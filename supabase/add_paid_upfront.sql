alter table public.entries
add column if not exists paid_upfront boolean not null default false;
