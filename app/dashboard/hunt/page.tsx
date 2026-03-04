'use client'

// Página de registo de hunt (US03)
import { useCharacters } from '@/hooks/useCharacters'
import { useHunts } from '@/hooks/useHunts'
import { HuntForm } from '@/app/components/hunt/HuntForm'
import { Skeleton } from '@/components/ui/skeleton'
import type { CreateHuntResult } from '@/lib/actions/createHuntAction'
import type { HuntEntry } from '@/types/index'

export default function HuntPage() {
  const { characters, isLoading, error } = useCharacters()
  const { addLocalHunt } = useHunts()

  function handleSuccess(result: CreateHuntResult) {
    if (result.local && result.data) {
      // Sem login: adiciona ao estado em memória
      addLocalHunt(result.data as HuntEntry)
    }
    // Com login: o dashboard refetch() cuida disso quando o usuário navegar
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Registrar Hunt</h1>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-9 rounded-md" />
          <Skeleton className="h-9 rounded-md" />
          <Skeleton className="h-9 rounded-md" />
        </div>
      )}

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
          Erro ao carregar personagens: {error}
        </p>
      )}

      {!isLoading && !error && (
        <HuntForm characters={characters} onSuccess={handleSuccess} />
      )}
    </div>
  )
}
