-- =============================================================================
-- Migração inicial: schema completo para pokexgames-hub
-- US01: profiles + trigger de criação automática
-- US02: characters (com UNIQUE constraint + RLS)
-- US03: hunt_entries (net_profit calculado server-side + RLS)
-- US04: view v_global_stats (ranking comunitário)
-- US05: índice para busca eficiente das últimas N hunts por utilizador
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensões necessárias
-- -----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- US02: Enum para clã (integridade total no banco)
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'clan_name') then
    create type clan_name as enum (
      'Nenhum',
      'Impulso',
      'Elemento',
      'Enigma',
      'Frenesi',
      'Harmonia'
    );
  end if;
end
$$;

-- -----------------------------------------------------------------------------
-- US01: Tabela profiles
-- Criada automaticamente via trigger quando o utilizador faz login.
-- -----------------------------------------------------------------------------
create table if not exists profiles (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null unique references auth.users (id) on delete cascade,
  username   text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índice para lookup rápido por user_id
create index if not exists idx_profiles_user_id on profiles (user_id);

-- RLS: utilizador só vê/edita o seu próprio perfil
alter table profiles enable row level security;

create policy "Utilizadores vêem o próprio perfil"
  on profiles for select
  using (auth.uid() = user_id);

create policy "Utilizadores editam o próprio perfil"
  on profiles for update
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- US01: Trigger — cria profile automaticamente após signup
-- -----------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Jogador'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- -----------------------------------------------------------------------------
-- Função auxiliar: atualiza updated_at automaticamente
-- -----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- US02: Tabela characters
-- -----------------------------------------------------------------------------
create table if not exists characters (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  level      integer not null check (level >= 1 and level <= 1000),
  clan       clan_name not null default 'Nenhum',
  pokemons   text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- US02: nomes de personagem únicos por utilizador
  constraint uq_characters_user_name unique (user_id, name)
);

create index if not exists idx_characters_user_id on characters (user_id);

-- Trigger updated_at
drop trigger if exists set_characters_updated_at on characters;
create trigger set_characters_updated_at
  before update on characters
  for each row execute function set_updated_at();

-- RLS
alter table characters enable row level security;

create policy "Utilizadores vêem os próprios chars"
  on characters for select
  using (auth.uid() = user_id);

create policy "Utilizadores inserem os próprios chars"
  on characters for insert
  with check (auth.uid() = user_id);

create policy "Utilizadores editam os próprios chars"
  on characters for update
  using (auth.uid() = user_id);

create policy "Utilizadores apagam os próprios chars"
  on characters for delete
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- US03: Tabela hunt_entries
-- net_profit é sempre calculado server-side (loot - expenses).
-- -----------------------------------------------------------------------------
create table if not exists hunt_entries (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  char_id        uuid not null references characters (id) on delete cascade,
  loot           bigint not null check (loot >= 0),
  expenses       bigint not null check (expenses >= 0),
  -- US03 segurança: net_profit calculado via generated column (server-side, nunca aceite do client)
  net_profit     bigint generated always as (loot - expenses) stored,
  duration       integer not null check (duration > 0),  -- minutos
  pokemon_target text not null,
  created_at     timestamptz not null default now()
);

create index if not exists idx_hunt_entries_user_id         on hunt_entries (user_id);
create index if not exists idx_hunt_entries_user_created_at on hunt_entries (user_id, created_at desc);
create index if not exists idx_hunt_entries_char_id         on hunt_entries (char_id);

-- RLS
alter table hunt_entries enable row level security;

create policy "Utilizadores vêem as próprias hunts"
  on hunt_entries for select
  using (auth.uid() = user_id);

create policy "Utilizadores inserem as próprias hunts"
  on hunt_entries for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from characters
      where characters.id = char_id
        and characters.user_id = auth.uid()
    )
  );

create policy "Utilizadores apagam as próprias hunts"
  on hunt_entries for delete
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- US04: View v_global_stats — ranking comunitário
-- Calcula GP/h médio por (pokemon_target, clan).
-- Performance: SUM(net_profit) / SUM(duration) * 60
-- Privacidade: apenas colunas públicas expostas, sem user_id.
-- -----------------------------------------------------------------------------
create or replace view v_global_stats as
select
  h.pokemon_target,
  c.clan,
  count(*)                                                   as total_hunts,
  round(sum(h.net_profit)::numeric / sum(h.duration) * 60)  as avg_gp_per_hour,
  sum(h.net_profit)                                          as total_net_profit,
  avg(c.level)                                               as avg_level,
  min(c.level)                                               as min_level,
  max(c.level)                                               as max_level
from hunt_entries h
join characters c on c.id = h.char_id
group by h.pokemon_target, c.clan;

-- RLS na view: qualquer utilizador autenticado pode fazer SELECT
-- (a view expõe apenas dados agregados, sem user_id)
grant select on v_global_stats to authenticated;
