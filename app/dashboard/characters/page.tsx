'use client'

// Página de gestão de personagens (US02) — layout 2 colunas com visual premium
import { useCharacters } from '@/hooks/useCharacters'
import { CharacterList } from '@/app/components/characters/CharacterList'
import { CharacterForm } from '@/app/components/characters/CharacterForm'
import { Skeleton } from '@/components/ui/skeleton'
import type { CreateCharacterResult } from '@/lib/actions/createCharacterAction'
import type { Character } from '@/types/index'
import { Users, Plus, AlertCircle } from 'lucide-react'

export default function CharactersPage() {
  const { characters, isLoading, error, addLocalCharacter, refetch } = useCharacters()

  function handleSuccess(result: CreateCharacterResult) {
    if (result.local && result.data) {
      // Sem login: adiciona ao estado em memória
      addLocalCharacter(result.data as Character)
    } else {
      // Com login: recarrega do Supabase
      refetch()
    }
  }

  return (
    <div className="space-y-8">
      {/* Header da página */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Meus Personagens
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gira os teus personagens e equipa de Pokémon.
        </p>
      </div>

      {/* Layout: formulário + lista em 2 colunas em telas grandes */}
      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Painel de criação */}
        <div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Plus size={16} className="text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Novo personagem
                </h2>
                <p className="text-xs text-muted-foreground">
                  Preencha os dados do seu char
                </p>
              </div>
            </div>
            <CharacterForm onSuccess={handleSuccess} />
          </div>
        </div>

        {/* Lista de personagens */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">
                Personagens cadastrados
              </h2>
            </div>
            {!isLoading && !error && (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {characters.length} {characters.length === 1 ? 'personagem' : 'personagens'}
              </span>
            )}
          </div>

          {isLoading && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-400">
              <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
              Erro ao carregar personagens: {error}
            </div>
          )}

          {!isLoading && !error && <CharacterList characters={characters} />}
        </div>
      </div>
    </div>
  )
}
