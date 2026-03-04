-- =============================================================================
-- Seed de dados de teste — pokexgames-hub
-- Espelha os cálculos validados em __tests__/backend/us04-ranking-seed.test.ts
--
-- Resultado esperado na view v_global_stats após este seed:
--
--   Pokémon    | Clã      | Level | GP/h   | Hunts
--   -----------|----------|-------|--------|------
--   Mewtwo     | Enigma   | 300   | 8kk/h  | 3
--   Alakazam   | Elemento | 400   | 5kk/h  | 3
--   Blastoise  | Elemento | 400   | 4kk/h  | 3
--   Dragonite  | Impulso  | 500   | 3kk/h  | 3
--   Gengar     | Impulso  | 500   | 2kk/h  | 3
--
-- COMO USAR:
--   1. Acesse o SQL Editor do Supabase (painel → SQL Editor)
--   2. Cole este arquivo inteiro e clique em "Run"
--   3. Abra http://localhost:3000/dashboard/ranking para ver os dados
--
-- COMO REVERTER:
--   Execute apenas o bloco "Limpeza" no final deste arquivo.
--
-- ATENÇÃO: Este seed insere diretamente em auth.users via service_role,
-- o que só é possível no SQL Editor do Supabase (que roda como postgres/superuser).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Limpeza prévia (idempotente — pode rodar múltiplas vezes com segurança)
--    Remove pelo e-mail de teste para evitar conflito de unique constraints.
-- -----------------------------------------------------------------------------
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id
  from auth.users
  where email = 'seed-test@pokexgames.dev'
  limit 1;

  if v_user_id is not null then
    -- Cascata: hunt_entries → characters → profiles → auth.users
    delete from hunt_entries  where user_id = v_user_id;
    delete from characters    where user_id = v_user_id;
    delete from profiles      where user_id = v_user_id;
    delete from auth.users    where id      = v_user_id;
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- 1. Usuário de teste em auth.users
--    (requer execução como postgres/superuser no SQL Editor do Supabase)
-- -----------------------------------------------------------------------------
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
values (
  'aaaabbbb-cccc-dddd-eeee-ffffffff0001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated',
  'authenticated',
  'seed-test@pokexgames.dev',
  crypt('seed-password-not-real', gen_salt('bf')),
  now(),
  '{"full_name": "Seed Tester", "avatar_url": null}'::jsonb,
  now(),
  now()
);

-- Perfil criado manualmente (o trigger handle_new_user faz isso no login real,
-- mas como inserimos direto em auth.users aqui precisamos forçar)
insert into profiles (user_id, username, avatar_url)
values (
  'aaaabbbb-cccc-dddd-eeee-ffffffff0001'::uuid,
  'Seed Tester',
  null
)
on conflict (user_id) do nothing;

-- -----------------------------------------------------------------------------
-- 2. Personagens
--    - DragonitoTester: Impulso, level 500 → hunts de Dragonite e Gengar
--    - AlakazamTester:  Elemento, level 400 → hunts de Alakazam e Blastoise
--    - MewtwoTester:    Enigma,   level 300 → hunts de Mewtwo
-- -----------------------------------------------------------------------------
insert into characters (id, user_id, name, level, clan, pokemons)
values
  (
    'ccccdddd-eeee-ffff-0000-111111111101'::uuid,
    'aaaabbbb-cccc-dddd-eeee-ffffffff0001'::uuid,
    'DragonitoTester',
    500,
    'Impulso',
    array['Dragonite', 'Gyarados', 'Lapras', 'Vaporeon', 'Starmie', 'Cloyster']
  ),
  (
    'ccccdddd-eeee-ffff-0000-111111111102'::uuid,
    'aaaabbbb-cccc-dddd-eeee-ffffffff0001'::uuid,
    'AlakazamTester',
    400,
    'Elemento',
    array['Alakazam', 'Gengar', 'Haunter', 'Kadabra', 'Jynx', 'Mr. Mime']
  ),
  (
    'ccccdddd-eeee-ffff-0000-111111111103'::uuid,
    'aaaabbbb-cccc-dddd-eeee-ffffffff0001'::uuid,
    'MewtwoTester',
    300,
    'Enigma',
    array['Mewtwo', 'Mew', 'Raichu', 'Electrode', 'Voltorb', 'Jolteon']
  );

-- -----------------------------------------------------------------------------
-- 3. Hunt entries
--    net_profit é GENERATED ALWAYS (loot - expenses), não precisa ser informado.
--
--    Fórmula validada nos testes:
--      avg_gp_per_hour = SUM(net_profit) / SUM(duration) * 60
--
--    Dragonite  → 13.500.000 / 270min * 60 = 3.000.000/h  → "3kk/h"
--    Alakazam   → 15.000.000 / 180min * 60 = 5.000.000/h  → "5kk/h"
--    Mewtwo     → 28.000.000 / 210min * 60 = 8.000.000/h  → "8kk/h"
--    Gengar     →  7.000.000 / 210min * 60 = 2.000.000/h  → "2kk/h"
--    Blastoise  → 14.000.000 / 210min * 60 = 4.000.000/h  → "4kk/h"
-- -----------------------------------------------------------------------------

-- --- Dragonite (char: DragonitoTester / Impulso / 500) ---
-- Hunt 1: loot=5.5kk, expenses=1kk → net=4.5kk, 90min → 3kk/h
insert into hunt_entries (user_id, char_id, loot, expenses, duration, pokemon_target)
values ('aaaabbbb-cccc-dddd-eeee-ffffffff0001', 'ccccdddd-eeee-ffff-0000-111111111101', 5_500_000, 1_000_000, 90, 'Dragonite');

-- Hunt 2: loot=4kk, expenses=1kk → net=3kk, 60min → 3kk/h
insert into hunt_entries (user_id, char_id, loot, expenses, duration, pokemon_target)
values ('aaaabbbb-cccc-dddd-eeee-ffffffff0001', 'ccccdddd-eeee-ffff-0000-111111111101', 4_000_000, 1_000_000, 60, 'Dragonite');

-- Hunt 3: loot=8kk, expenses=2kk → net=6kk, 120min → 3kk/h
insert into hunt_entries (user_id, char_id, loot, expenses, duration, pokemon_target)
values ('aaaabbbb-cccc-dddd-eeee-ffffffff0001', 'ccccdddd-eeee-ffff-0000-111111111101', 8_000_000, 2_000_000, 120, 'Dragonite');

-- --- Alakazam (char: AlakazamTester / Elemento / 400) ---
-- Hunt 4: loot=6kk, expenses=1kk → net=5kk, 60min → 5kk/h
insert into hunt_entries (user_id, char_id, loot, expenses, duration, pokemon_target)
values ('aaaabbbb-cccc-dddd-eeee-ffffffff0001', 'ccccdddd-eeee-ffff-0000-111111111102', 6_000_000, 1_000_000, 60, 'Alakazam');

-- Hunt 5: loot=3kk, expenses=500k → net=2.5kk, 30min → 5kk/h
insert into hunt_entries (user_id, char_id, loot, expenses, duration, pokemon_target)
values ('aaaabbbb-cccc-dddd-eeee-ffffffff0001', 'ccccdddd-eeee-ffff-0000-111111111102', 3_000_000, 500_000, 30, 'Alakazam');

-- Hunt 6: loot=9kk, expenses=1.5kk → net=7.5kk, 90min → 5kk/h
insert into hunt_entries (user_id, char_id, loot, expenses, duration, pokemon_target)
values ('aaaabbbb-cccc-dddd-eeee-ffffffff0001', 'ccccdddd-eeee-ffff-0000-111111111102', 9_000_000, 1_500_000, 90, 'Alakazam');

-- --- Mewtwo (char: MewtwoTester / Enigma / 300) ---
-- Hunt 7: loot=9kk, expenses=1kk → net=8kk, 60min → 8kk/h
insert into hunt_entries (user_id, char_id, loot, expenses, duration, pokemon_target)
values ('aaaabbbb-cccc-dddd-eeee-ffffffff0001', 'ccccdddd-eeee-ffff-0000-111111111103', 9_000_000, 1_000_000, 60, 'Mewtwo');

-- Hunt 8: loot=4.5kk, expenses=500k → net=4kk, 30min → 8kk/h
insert into hunt_entries (user_id, char_id, loot, expenses, duration, pokemon_target)
values ('aaaabbbb-cccc-dddd-eeee-ffffffff0001', 'ccccdddd-eeee-ffff-0000-111111111103', 4_500_000, 500_000, 30, 'Mewtwo');

-- Hunt 9: loot=18kk, expenses=2kk → net=16kk, 120min → 8kk/h
insert into hunt_entries (user_id, char_id, loot, expenses, duration, pokemon_target)
values ('aaaabbbb-cccc-dddd-eeee-ffffffff0001', 'ccccdddd-eeee-ffff-0000-111111111103', 18_000_000, 2_000_000, 120, 'Mewtwo');

-- --- Gengar (char: DragonitoTester / Impulso / 500) ---
-- Hunt 10: loot=3kk, expenses=1kk → net=2kk, 60min → 2kk/h
insert into hunt_entries (user_id, char_id, loot, expenses, duration, pokemon_target)
values ('aaaabbbb-cccc-dddd-eeee-ffffffff0001', 'ccccdddd-eeee-ffff-0000-111111111101', 3_000_000, 1_000_000, 60, 'Gengar');

-- Hunt 11: loot=1.5kk, expenses=500k → net=1kk, 30min → 2kk/h
insert into hunt_entries (user_id, char_id, loot, expenses, duration, pokemon_target)
values ('aaaabbbb-cccc-dddd-eeee-ffffffff0001', 'ccccdddd-eeee-ffff-0000-111111111101', 1_500_000, 500_000, 30, 'Gengar');

-- Hunt 12: loot=6kk, expenses=2kk → net=4kk, 120min → 2kk/h
insert into hunt_entries (user_id, char_id, loot, expenses, duration, pokemon_target)
values ('aaaabbbb-cccc-dddd-eeee-ffffffff0001', 'ccccdddd-eeee-ffff-0000-111111111101', 6_000_000, 2_000_000, 120, 'Gengar');

-- --- Blastoise (char: AlakazamTester / Elemento / 400) ---
-- Hunt 13: loot=5kk, expenses=1kk → net=4kk, 60min → 4kk/h
insert into hunt_entries (user_id, char_id, loot, expenses, duration, pokemon_target)
values ('aaaabbbb-cccc-dddd-eeee-ffffffff0001', 'ccccdddd-eeee-ffff-0000-111111111102', 5_000_000, 1_000_000, 60, 'Blastoise');

-- Hunt 14: loot=2.5kk, expenses=500k → net=2kk, 30min → 4kk/h
insert into hunt_entries (user_id, char_id, loot, expenses, duration, pokemon_target)
values ('aaaabbbb-cccc-dddd-eeee-ffffffff0001', 'ccccdddd-eeee-ffff-0000-111111111102', 2_500_000, 500_000, 30, 'Blastoise');

-- Hunt 15: loot=10kk, expenses=2kk → net=8kk, 120min → 4kk/h
insert into hunt_entries (user_id, char_id, loot, expenses, duration, pokemon_target)
values ('aaaabbbb-cccc-dddd-eeee-ffffffff0001', 'ccccdddd-eeee-ffff-0000-111111111102', 10_000_000, 2_000_000, 120, 'Blastoise');

-- -----------------------------------------------------------------------------
-- 4. Verificação imediata — execute após o seed para confirmar os dados
-- -----------------------------------------------------------------------------
select
  pokemon_target  as "Pokémon",
  clan            as "Clã",
  total_hunts     as "Hunts",
  min_level       as "Level",
  round(avg_gp_per_hour / 1000000.0, 1) || 'kk/h' as "GP/h"
from v_global_stats
order by avg_gp_per_hour desc;

-- =============================================================================
-- BLOCO DE LIMPEZA (execute separadamente se quiser reverter)
-- =============================================================================
-- do $$
-- declare v_user_id uuid := 'aaaabbbb-cccc-dddd-eeee-ffffffff0001'::uuid;
-- begin
--   delete from hunt_entries where user_id = v_user_id;
--   delete from characters   where user_id = v_user_id;
--   delete from profiles     where user_id = v_user_id;
--   delete from auth.users   where id      = v_user_id;
-- end;
-- $$;
