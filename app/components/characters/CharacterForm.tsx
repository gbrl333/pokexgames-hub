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
import { CLAN_NAMES, CLAN_COLORS } from '@/types/index'
import { CheckCircle2, AlertCircle, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const [clan, setClan] = useState<typeof CLAN_NAMES[number]>('Nenhum')
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

    // Validação client-side com Zod
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
    setClan('Nenhum')
    setPokemons([])
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
    onSuccess?.(result)
  }

  const selectedClanColor = CLAN_COLORS[clan]

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Nome */}
      <div className="space-y-1.5">
        <Label htmlFor="char-name">Nome do personagem</Label>
        <Input
          id="char-name"
          aria-label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: MeuChar"
          aria-describedby={errors.name ? 'name-error' : undefined}
          className={cn(errors.name && 'border-red-500 focus:ring-red-500')}
        />
        {errors.name && (
          <p id="name-error" className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle size={11} /> {errors.name}
          </p>
        )}
      </div>

      {/* Level */}
      <div className="space-y-1.5">
        <Label htmlFor="char-level">Level</Label>
        <Input
          id="char-level"
          type="number"
          min={1}
          max={1000}
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          placeholder="1 – 1000"
          aria-describedby={errors.level ? 'level-error' : undefined}
          className={cn(errors.level && 'border-red-500 focus:ring-red-500')}
        />
        {errors.level && (
          <p id="level-error" className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle size={11} /> {errors.level}
          </p>
        )}
      </div>

      {/* Clã */}
      <div className="space-y-1.5">
        <Label htmlFor="char-clan">Clã</Label>
        <div className="relative">
          <select
            id="char-clan"
            value={clan}
            onChange={(e) => setClan(e.target.value as typeof CLAN_NAMES[number])}
            className="flex h-9 w-full appearance-none rounded-md border border-input bg-background pl-8 pr-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {CLAN_NAMES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {/* Dot de cor do clã */}
          <span
            className={cn(
              'pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full',
              selectedClanColor.dot
            )}
          />
        </div>
        {/* Preview do clã selecionado */}
        {clan !== 'Nenhum' && (
          <div className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
            selectedClanColor.bg, selectedClanColor.text, selectedClanColor.border
          )}>
            <span className={cn('h-1.5 w-1.5 rounded-full', selectedClanColor.dot)} />
            Clã {clan}
          </div>
        )}
        {errors.clan && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle size={11} /> {errors.clan}
          </p>
        )}
      </div>

      {/* Pokémons (tags) */}
      <div className="space-y-1.5">
        <Label htmlFor="pokemon-input">
          Time de Pokémon
          <span className="ml-1.5 text-xs text-muted-foreground">
            ({pokemons.length}/6)
          </span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="pokemon-input"
            value={pokemonInput}
            onChange={(e) => setPokemonInput(e.target.value)}
            onKeyDown={handlePokemonKeyDown}
            placeholder="Ex: Charizard — Enter para adicionar"
            disabled={pokemons.length >= 6}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addPokemon}
            disabled={pokemons.length >= 6}
            className="flex-shrink-0"
            aria-label="Adicionar Pokémon"
          >
            <Plus size={16} />
          </Button>
        </div>
        {pokemons.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {pokemons.map((pokemon) => (
              <Badge
                key={pokemon}
                variant="secondary"
                className="gap-1.5 pr-1.5 text-xs"
              >
                {pokemon}
                <button
                  type="button"
                  aria-label={`Remover ${pokemon}`}
                  onClick={() => removePokemon(pokemon)}
                  className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/10 hover:text-foreground transition-colors"
                >
                  <X size={10} />
                </button>
              </Badge>
            ))}
          </div>
        )}
        {errors.pokemons && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle size={11} /> {errors.pokemons}
          </p>
        )}
      </div>

      {/* Erro do servidor */}
      {errors.server && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
          {errors.server}
        </div>
      )}

      {/* Sucesso */}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700 dark:border-emerald-800/30 dark:bg-emerald-950/20 dark:text-emerald-400">
          <CheckCircle2 size={15} />
          Personagem criado com sucesso!
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Criando...' : 'Criar personagem'}
      </Button>
    </form>
  )
}
