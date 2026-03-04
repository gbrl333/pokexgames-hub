'use client'

// Lista de personagens do utilizador (US02)
import { Badge } from '@/components/ui/badge'
import type { Character } from '@/types/index'

interface CharacterListProps {
  characters: Character[]
}

export function CharacterList({ characters }: CharacterListProps) {
  if (characters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
        <p className="text-muted-foreground">
          Nenhum personagem cadastrado. Adicione um personagem para começar.
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {characters.map((char) => (
        <li
          key={char.id}
          className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">{char.name}</p>
              <p className="text-sm text-muted-foreground">
                Level {char.level} &mdash; {char.clan}
              </p>
            </div>
          </div>
          {char.pokemons.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {char.pokemons.map((pokemon) => (
                <Badge key={pokemon} variant="outline" className="text-xs">
                  {pokemon}
                </Badge>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
