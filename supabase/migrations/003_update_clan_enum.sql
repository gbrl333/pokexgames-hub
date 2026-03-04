-- Migração 003: Atualizar enum clan_name para os clãs reais do PokéxGames
-- Os clãs reais são: Naturia, Malefic, Wingeon, Raibolt, Volcanic, Gardestrike, Orebound, Psycraft, Seavell, Ironhard
-- Os clãs antigos (Impulso, Elemento, Enigma, Frenesi, Harmonia) são substituídos pelos reais.

-- Passo 1: Criar o novo tipo enum com os clãs corretos
CREATE TYPE clan_name_new AS ENUM (
  'Nenhum',
  'Naturia',
  'Malefic',
  'Wingeon',
  'Raibolt',
  'Volcanic',
  'Gardestrike',
  'Orebound',
  'Psycraft',
  'Seavell',
  'Ironhard'
);

-- Passo 2: Alterar a coluna para usar o novo tipo
-- (converter dados antigos para 'Nenhum' como fallback seguro)
ALTER TABLE characters
  ALTER COLUMN clan TYPE clan_name_new
  USING (
    CASE
      WHEN clan::text IN ('Nenhum','Naturia','Malefic','Wingeon','Raibolt','Volcanic','Gardestrike','Orebound','Psycraft','Seavell','Ironhard')
        THEN clan::text::clan_name_new
      ELSE 'Nenhum'::clan_name_new
    END
  );

-- Passo 3: Remover o tipo antigo e renomear o novo
DROP TYPE clan_name;
ALTER TYPE clan_name_new RENAME TO clan_name;

-- Passo 4: Atualizar a view v_global_stats (recriar para garantir consistência)
DROP VIEW IF EXISTS v_global_stats;

CREATE VIEW v_global_stats AS
SELECT
  he.pokemon_target,
  c.clan::text AS clan,
  COUNT(*)                                              AS total_hunts,
  ROUND(
    SUM(he.net_profit)::numeric / NULLIF(SUM(he.duration), 0) * 60
  )                                                     AS avg_gp_per_hour,
  SUM(he.net_profit)                                    AS total_net_profit,
  ROUND(AVG(c.level))                                   AS avg_level,
  MIN(c.level)                                          AS min_level,
  MAX(c.level)                                          AS max_level
FROM hunt_entries he
JOIN characters c ON c.id = he.char_id
GROUP BY he.pokemon_target, c.clan;

COMMENT ON VIEW v_global_stats IS 'Estatísticas globais de hunt por Pokémon e clã';
