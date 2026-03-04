'use client'

// Formulário de criação de personagem com validação Zod (US02)
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { characterSchema } from '@/lib/validations/characterSchema'
import { createCharacterAction } from '@/lib/actions/createCharacterAction'
import type { CreateCharacterResult } from '@/lib/actions/createCharacterAction'
import { CLAN_NAMES } from '@/types/index'

interface FormErrors {
  name?: string
  level?: string
  clan?: string
  pokemons?: string
  server?: string
}

interface CharacterFormProps {
  /** Chamado após submit bem-sucedido, recebendo o resultado da action */
  onSuccess?: (result: CreateCharacterResult) => void
}

export function CharacterForm({ onSuccess }: CharacterFormProps) {
  const [name, setName] = useState('')
  const [level, setLevel] = useState('')
  const [clan, setClan] = useState('Nenhum')
  const [pokemons, setPokemons] = useState<string[]>([])
  const [pokemonInput, setPokemonInput] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  function addPokemon() {
    const trimmed = pokemonInput.trim()
    if (!trimmed || pokemons.length >= 6) return
    if (pokemons.includes(trimmed)) return
    setPokemons((prev) => [...prev, trimmed])
    setPokemonInput('')
  }

  function removePokemon(pokemon: string) {
    setPokemons((prev) => prev.filter((p) => p !== pokemon))
  }

  function handlePokemonKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addPokemon()
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const rawData = {
      name,
      level: Number(level),
      clan,
      pokemons,
    }

    // Validação client-side com Zod (feedback imediato)
    const parsed = characterSchema.safeParse(rawData)
    if (!parsed.success) {
      const fieldErrors: FormErrors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FormErrors
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    setIsSubmitting(true)
    const result = await createCharacterAction(rawData)
    setIsSubmitting(false)

    if (!result.success) {
      setErrors({ server: result.error })
      return
    }

    // Sucesso — limpa o formulário
    setName('')
    setLevel('')
    setClan('')
    setPokemons([])
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
    onSuccess?.(result)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nome */}
      <div className="space-y-1.5">
        <Label htmlFor="char-name">Personagem</Label>
        <Input
          id="char-name"
          aria-label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do personagem"
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Level */}
      <div className="space-y-1.5">
        <Label htmlFor="char-level">Level</Label>
        <Input
          id="char-level"
          type="number"
          min={1}
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          placeholder="1 – 1000"
          aria-describedby={errors.level ? 'level-error' : undefined}
        />
        {errors.level && (
          <p id="level-error" className="text-xs text-red-500">{errors.level}</p>
        )}
      </div>

      {/* Clã */}
      <div className="space-y-1.5">
        <Label htmlFor="char-clan">Clã</Label>
        <select
          id="char-clan"
          value={clan}
          onChange={(e) => setClan(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {CLAN_NAMES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errors.clan && (
          <p className="text-xs text-red-500">{errors.clan}</p>
        )}
      </div>

      {/* Pokémons (tags) */}
      <div className="space-y-1.5">
        <Label htmlFor="pokemon-input">Pokémons do time (máx. 6)</Label>
        <div className="flex gap-2">
          <Input
            id="pokemon-input"
            value={pokemonInput}
            onChange={(e) => setPokemonInput(e.target.value)}
            onKeyDown={handlePokemonKeyDown}
            placeholder="Pokémon — pressione Enter para adicionar"
            disabled={pokemons.length >= 6}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addPokemon}
            disabled={pokemons.length >= 6}
          >
            +
          </Button>
        </div>
        {pokemons.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {pokemons.map((pokemon) => (
              <Badge key={pokemon} variant="secondary" className="gap-1 pr-1">
                {pokemon}
                <button
                  type="button"
                  aria-label={`Remover ${pokemon}`}
                  onClick={() => removePokemon(pokemon)}
                  className="ml-1 rounded-full text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
        {errors.pokemons && (
          <p className="text-xs text-red-500">{errors.pokemons}</p>
        )}
      </div>

      {/* Erro do servidor */}
      {errors.server && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {errors.server}
        </p>
      )}

      {/* Sucesso */}
      {success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Personagem criado com sucesso!
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Criando...' : 'Criar personagem'}
      </Button>
    </form>
  )
}
