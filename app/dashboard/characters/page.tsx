'use client'

// Página de gestão de personagens (US02) — lista + formulário
import { useCharacters } from '@/hooks/useCharacters'
import { CharacterList } from '@/app/components/characters/CharacterList'
import { CharacterForm } from '@/app/components/characters/CharacterForm'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import type { CreateCharacterResult } from '@/lib/actions/createCharacterAction'
import type { Character } from '@/types/index'

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
      <h1 className="text-2xl font-bold tracking-tight">Meus Personagens</h1>

      {/* Formulário de criação */}
      <section aria-labelledby="form-heading">
        <h2 id="form-heading" className="mb-4 text-lg font-semibold">
          Adicionar personagem
        </h2>
        <CharacterForm onSuccess={handleSuccess} />
      </section>

      <Separator />

      {/* Lista de personagens */}
      <section aria-labelledby="list-heading">
        <h2 id="list-heading" className="mb-4 text-lg font-semibold">
          Personagens cadastrados
        </h2>

        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        )}

        {error && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
            Erro ao carregar personagens: {error}
          </p>
        )}

        {!isLoading && !error && <CharacterList characters={characters} />}
      </section>
    </div>
  )
}
