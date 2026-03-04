'use client'

// Lista de personagens com visual rico e clãs coloridos (US02)
import { Badge } from '@/components/ui/badge'
import type { Character } from '@/types/index'
import { CLAN_COLORS } from '@/types/index'
import { Shield, Swords, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CharacterListProps {
  characters: Character[]
}

export function CharacterList({ characters }: CharacterListProps) {
  if (characters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 py-14 text-center">
        <div className="rounded-2xl border border-border bg-secondary p-4">
          <Users size={28} className="text-muted-foreground/60" />
        </div>
        <div>
          <p className="font-medium text-foreground">Sem personagens ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Adicione um personagem para começar a registar hunts.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {characters.map((char) => {
        const clanColor = CLAN_COLORS[char.clan] ?? CLAN_COLORS['Nenhum']
        const initial = char.name[0]?.toUpperCase() ?? '?'

        return (
          <li
            key={char.id}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20"
          >
            {/* Barra de cor do clã no topo */}
            <div className={cn('absolute inset-x-0 top-0 h-0.5', clanColor.dot)} />

            <div className="flex items-start gap-3">
              {/* Avatar com inicial */}
              <div className={cn(
                'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold',
                clanColor.bg, clanColor.text
              )}>
                {initial}
              </div>

              <div className="min-w-0 flex-1">
                {/* Nome e clã */}
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{char.name}</p>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
                      clanColor.bg, clanColor.text, clanColor.border
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', clanColor.dot)} />
                    {char.clan}
                  </span>
                </div>

                {/* Level */}
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield size={11} />
                  <span>Level {char.level}</span>
                  {char.pokemons.length > 0 && (
                    <>
                      <span className="text-border">·</span>
                      <Swords size={11} />
                      <span>{char.pokemons.length} Pokémon</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Pokémon tags */}
            {char.pokemons.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {char.pokemons.map((pokemon) => (
                  <Badge
                    key={pokemon}
                    variant="outline"
                    className="border-border bg-secondary/50 text-xs text-muted-foreground hover:bg-secondary"
                  >
                    {pokemon}
                  </Badge>
                ))}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
