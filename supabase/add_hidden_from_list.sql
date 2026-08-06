alter table public.entries
add column if not exists hidden_from_list boolean not null default false;
