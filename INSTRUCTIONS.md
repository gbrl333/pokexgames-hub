# ENGINEERING GUIDELINES & PROJECT RULES
This document is the mandatory technical specification for this AI agent.
Any deviation from these rules will be considered an implementation error.
---
### 1. GOLDEN RULES (NEVER VIOLATE)
- **Mandatory TDD:** Before any feature, write the test. Code only exists if there is a test validating it.
- **No Manual Fix:** If an error is found, I will not fix it manually. I will describe the error and you must correct the logic and the test.
- **DRY & SOLID Principle:** If logic repeats 2 times, extract it into a Service, Helper or Hook. Do not allow "Big Ball of Mud" files.
- **No One-Shots:** For complex tasks, present the step plan first. Only execute after my approval.

---

### 2. TECH STACK & ENVIRONMENT
- **Language:** TypeScript 5.x (strict mode — `any` is forbidden, use `unknown` or explicit types)
- **Framework:** Next.js 14 (App Router — prefer Server Components, use `"use client"` only when strictly necessary)
- **Database:** Supabase (PostgreSQL — all tables must have RLS enabled)
- **Auth:** Supabase Auth with Discord OAuth
- **Styling:** Tailwind CSS + shadcn/ui
- **Package Manager:** pnpm (never use npm or yarn)
- **Test Runner:** `pnpm test` (Vitest + React Testing Library)
- **Coverage:** `pnpm test:coverage` (minimum 80% on calculation functions)
- **Linter:** `pnpm lint` (ESLint) — never ignore warnings
- **Type Check:** `pnpm typecheck` (tsc --noEmit)
- **Formatter:** `pnpm format` (Prettier)

---

### 3. WORKFLOW
Whenever I request a new feature, strictly follow this order:

1. **Exploration:** Read the relevant files to understand the current context.
2. **Plan:** Describe in text what you intend to do and which files will be affected. Wait for my approval before proceeding.
3. **Test (Red):** Create the test file. Run the test and confirm it FAILED.
4. **Implementation (Green):** Write the minimum code necessary to make the test pass.
5. **Refactor:** Clean up the code, check variable names and apply design patterns.
6. **Verification:** Run the linter and the full test suite to ensure nothing broke (No Regression).

---

### 4. CODE STYLE & DOCUMENTATION

- **Language:** Code, variables and function names in **English** — comments and commit messages in **Portuguese (PT-BR)**
- **Security:** Never store API keys or secrets in code. Always use `.env.local`
- **Naming conventions:**
  - React components: `PascalCase` → `HuntCard.tsx`
  - Hooks: `camelCase` starting with `use` → `useHunts.ts`
  - Utils/Helpers: `camelCase` → `calculateAverage.ts`
  - Types/Interfaces: `PascalCase` → `HuntEntry`, `PokemonSpot`
  - Supabase tables: `snake_case` → `hunt_entries`, `pokemon_spots`
- **Architecture:**
  - Business logic → `/lib` or `/hooks`, never inside React components
  - Global types → `/types/index.ts`
  - Zod validation schemas → `/lib/validations/`
  - Supabase clients → `/lib/supabase/server.ts` and `/lib/supabase/client.ts`
- **Commits:** Use Conventional Commits format with messages in **Portuguese (PT-BR)**:
  - `feat: adiciona formulário de registro de hunt`
  - `fix: corrige cálculo de média de loot`
  - `test: adiciona testes unitários de ordenação do ranking`
  - `refactor: extrai lógica de loot para o hook useHunts`
  - `chore: atualiza dependências`

### 6 RESTRIÇÕES (O QUE NÃO FAZER)

 Não instale bibliotecas externas sem consultar primeiro
 Não remova comentários de documentação técnica
 Não use any no TypeScript — prefira unknown ou tipos explícitos
 Não escreva lógica de negócio dentro de componentes React — extraia para hooks ou utils
 Não ignore avisos do ESLint — corrija ou justifique com // eslint-disable-next-line
 Não commite .env.local ou qualquer arquivo com secrets
 Não use useEffect para busca de dados — prefira Server Components ou React Query
 Não faça "one-shot fixes" complexos — refatore em passos pequenos e testados
 Não escreva SQL raw sem passar por RLS (Row Level Security) do Supabase

### 7 SEGURANÇA

Todas as tabelas do Supabase devem ter RLS (Row Level Security) ativado
Usuários só podem editar/deletar seus próprios registros (user_id = auth.uid())
Dados de ranking e médias globais são somente leitura para usuários comuns
Variáveis de ambiente: nunca expor SUPABASE_SERVICE_ROLE_KEY no client-side

## User Historys
US01: Autenticação via Discord
História: Como jogador, quero entrar no app via Discord para manter os meus dados sincronizados.

AC - Frontend (UI):

[ ] Botão de login com branding do Discord na Landing Page.

[ ] Middleware de proteção: Redirecionar /dashboard para /login se não houver sessão.

[ ] Mostrar Skeleton Screen enquanto o Supabase valida a sessão.

AC - Backend (Infra/Segurança):

[ ] Configurar Provider OAuth Discord no Supabase.

[ ] Trigger SQL: Criar automaticamente um registo na tabela profiles sempre que um novo utilizador fizer login.

US02: Gestão de Personagens (Characters)
História: Como jogador com "makers", quero registar os meus chars para segmentar o meu lucro.

AC - Frontend (UI):

[ ] Formulário com validação Zod: name (min 3 chars), level (1-1000), clan (Enum).

[ ] Lista de Pokémons: Input com "Tags" para os 6 pokémons do time.

[ ] Feedback visual de erro se o nome do char já existir.

AC - Backend (Regras/DB):

[ ] Constraint UNIQUE: Impedir name duplicado no PostgreSQL.

[ ] RLS Policy: (auth.uid() = user_id) para INSERT/UPDATE/DELETE.

[ ] Enum Tipo: Criar TYPE clan_name AS ENUM (...) no Postgres para integridade total.

US03: Registo de Sessão de Hunt
História: Como jogador focado em lucro, quero registar gastos e ganhos para calcular o GP/h.

AC - Frontend (UI):

[ ] Select de Personagem (apenas os do utilizador logado).

[ ] Máscara de input para números grandes (KKs/GPs).

[ ] Cálculo dinâmico em JS: Mostrar Loot - Gasto antes de submeter.

AC - Backend (Regras/DB):

[ ] Cálculo no Servidor: O campo net_profit deve ser validado/gerado no banco ou via Server Action para evitar manipulação no client.

[ ] Integridade: Impedir registo de hunt para um char_id que não pertença ao utilizador ativo.

US04: Ranking Comunitário (Global Stats)
História: Como membro da comunidade, quero ver as médias de lucro para saber onde caçar.

AC - Frontend (UI):

[ ] Tabela com Sort por GP/h e Pokémon.

[ ] Filtros reativos (Client-side) para Clã e Range de Level.

[ ] Formatação de números: 1.000.000 -> 1kk.

AC - Backend (Regras/DB):

[ ] Database View: Criar v_global_stats que faz o GROUP BY pokemon_target, clan.

[ ] Performance: A View deve calcular SUM(net_profit) / SUM(duration) * 60.

[ ] Privacidade: RLS deve permitir SELECT apenas nas colunas públicas da View.

US05: Dashboard de Performance Pessoal
História: Como jogador, quero um resumo visual para acompanhar a minha evolução.

AC - Frontend (UI):

[ ] Gráficos (Shadcn/UI + Recharts) com o histórico de lucro.

[ ] Empty State: "Nenhuma hunt registada" com botão de call-to-action.

AC - Backend (Regras/DB):

[ ] Query otimizada para buscar as últimas 7 hunts do utilizador logado.

### 5. SESSION MEMORY (LOG DE EXECUÇÃO)

**Status geral:** Projeto completo — backend + frontend + testes. Site totalmente público (sem auth obrigatória). 206/206 testes passando. `pnpm lint` e `pnpm typecheck` verdes.

---

#### Decisões de arquitetura tomadas

- **Site totalmente público:** Nenhuma rota requer login. Sem login, dados ficam em memória (perdidos no refresh). Com login Discord, dados persistem no Supabase.
- **`net_profit` calculado server-side:** Sempre via `calculateNetProfit(loot, expenses)` na Server Action — nunca aceito do cliente.
- **`user_id` sempre server-side:** Nunca confiado no payload do cliente.
- **Recharts NÃO aprovado:** Gráfico do dashboard usa barras CSS/Tailwind puras (`HuntChart.tsx`).
- **`huntSchema` imutável:** Valida `char_id` como UUID. `HuntForm.tsx` usa `huntFormSchema` local com `z.string().min(1)` para o client (aceita IDs `local-*`).
- **Radix UI Select:** Renderiza dois `role="combobox"`. `CharacterForm.tsx` usa `<select>` nativo. `HuntForm.tsx` usa `CharSelect` customizado.
- **`process.env[dynamic_key]` não funciona com `NEXT_PUBLIC_*`:** Next.js faz substituição estática. Sempre referenciar como literal: `process.env.NEXT_PUBLIC_SUPABASE_URL`.

---

#### Estado atual dos ficheiros

**Testes — 206/206 passando (18 ficheiros):**

| Ficheiro | Testes | Estado |
|---|---|---|
| `__tests__/backend/us01-auth.test.ts` | 6 | ✅ |
| `__tests__/backend/us02-character-schema.test.ts` | 27 | ✅ |
| `__tests__/backend/us02-character-action.test.ts` | 9 | ✅ |
| `__tests__/backend/us03-hunt-calculations.test.ts` | 28 | ✅ |
| `__tests__/backend/us03-hunt-action.test.ts` | 22 | ✅ |
| `__tests__/backend/us04-ranking.test.ts` | 25 | ✅ |
| `__tests__/backend/us05-dashboard.test.ts` | 14 | ✅ |
| `__tests__/auth/AuthGuard.test.tsx` | 6 | ✅ |
| `__tests__/auth/LoginButton.test.tsx` | 5 | ✅ |
| `__tests__/auth/middleware.test.ts` | 9 | ✅ |
| `__tests__/frontend/pages/LandingPage.test.tsx` | 4 | ✅ |
| `__tests__/frontend/characters/CharacterForm.test.tsx` | 14 | ✅ |
| `__tests__/frontend/characters/CharacterList.test.tsx` | 6 | ✅ |
| `__tests__/frontend/hunt/HuntForm.test.tsx` | 11 | ✅ |
| `__tests__/frontend/ranking/RankingTable.test.tsx` | 6 | ✅ |
| `__tests__/frontend/ranking/RankingFilters.test.tsx` | 5 | ✅ |
| `__tests__/frontend/dashboard/StatsCard.test.tsx` | 5 | ✅ |
| `__tests__/frontend/dashboard/HuntChart.test.tsx` | 4 | ✅ |

**Ficheiros de implementação:**

```
middleware.ts                              — público: só redireciona /login→/dashboard se logado
app/page.tsx                              — landing page com h1, descrição, LoginButton, link dashboard
app/layout.tsx                            — title="PokéxGames Hub", lang="pt-BR"
app/login/page.tsx                        — página de login Discord
app/auth/callback/route.ts                — callback OAuth
app/dashboard/layout.tsx                  — layout sem AuthGuard (site público)
app/dashboard/page.tsx                    — dashboard pessoal
app/dashboard/characters/page.tsx         — usa addLocalCharacter do hook
app/dashboard/hunt/page.tsx               — usa addLocalHunt do hook
app/dashboard/ranking/page.tsx            — ranking comunitário
app/components/auth/LoginButton.tsx       — botão Discord OAuth
app/components/auth/AuthGuard.tsx         — skeleton screen (mantido para testes)
app/components/characters/CharacterForm.tsx — prop onSuccess, select nativo de clã
app/components/characters/CharacterList.tsx
app/components/hunt/HuntForm.tsx          — prop onSuccess, huntFormSchema local (char_id min(1))
app/components/ranking/RankingTable.tsx   — sort por GP/h e Pokémon
app/components/ranking/RankingFilters.tsx — filtro clã + range level
app/components/dashboard/StatsCard.tsx    — card de métrica com trend
app/components/dashboard/HuntChart.tsx    — barras CSS/Tailwind (sem Recharts)
hooks/useCharacters.ts                    — estado local + Supabase quando logado; addLocalCharacter()
hooks/useHunts.ts                         — estado local + Supabase quando logado; addLocalHunt()
hooks/useRanking.ts                       — busca v_global_stats
lib/actions/createCharacterAction.ts      — sem login: retorna { success:true, local:true, data: Character }
lib/actions/createHuntAction.ts           — sem login: retorna { success:true, local:true, data: HuntEntry }
lib/validations/characterSchema.ts        — Zod schema US02
lib/validations/huntSchema.ts             — Zod schema US03 (char_id UUID — NÃO ALTERAR)
lib/huntCalculations.ts                   — calculateNetProfit, calculateGpPerHour, formatGp
lib/rankingHelpers.ts                     — sortByGpPerHour, sortByPokemon, filterByClan, filterByLevelRange
lib/supabase/client.ts                    — createBrowserClient com vars literais (não dinâmicas)
lib/supabase/server.ts                    — createServerClient com vars literais (não dinâmicas)
types/index.ts                            — Character, HuntEntry, RankingRow, etc.
supabase/migrations/001_initial_schema.sql — schema completo (profiles, characters, hunt_entries, v_global_stats, RLS, triggers)
components/ui/                            — shadcn/ui components
```

---

#### Para rodar localmente

1. `.env.local` — já preenchido com URL e chave do Supabase (`reltycrqvjxcdghbeizd`)
2. Executar a migration no SQL Editor do Supabase: colar `supabase/migrations/001_initial_schema.sql`
3. Configurar Discord OAuth no Supabase: Authentication → Providers → Discord
4. `pnpm dev` → http://localhost:3000

**Nota importante:** Ao reiniciar o servidor sempre deletar o cache primeiro:
```
rmdir /s /q .next
pnpm dev
```

---

#### Próximo passo

Não há tarefas pendentes de código. Todas as US01–US05 estão implementadas e testadas.
Possíveis evoluções:
- Integração real com Supabase (testar fluxo com login Discord real)
- Persistência de dados no Supabase quando logado (hooks já preparados)
- Melhorias de UX no dashboard