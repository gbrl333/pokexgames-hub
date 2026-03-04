'use client'

// Formulário de registro de sessão de hunt (US03)
// net_profit NÃO é enviado ao servidor — calculado na Server Action
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { huntSchema } from '@/lib/validations/huntSchema'
import { createHuntAction } from '@/lib/actions/createHuntAction'
import type { CreateHuntResult } from '@/lib/actions/createHuntAction'
import { calculateNetProfit, formatGp } from '@/lib/huntCalculations'
import type { Character } from '@/types/index'

// Schema client-side para validação do formulário (char_id só precisa ser não-vazio)
import { z } from 'zod'
const huntFormSchema = huntSchema.extend({
  char_id: z.string().min(1, 'Selecione um personagem'),
})

interface HuntFormProps {
  characters: Character[]
  /** Chamado após submit bem-sucedido, recebendo o resultado da action */
  onSuccess?: (result: CreateHuntResult) => void
}

interface FormErrors {
  char_id?: string
  loot?: string
  expenses?: string
  duration?: string
  pokemon_target?: string
  server?: string
}

interface CharSelectProps {
  characters: Character[]
  value: string
  onChange: (value: string) => void
  id?: string
}

/** Combobox simples para seleção de personagem (sem Radix) */
function CharSelect({ characters, value, onChange, id }: CharSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const listboxId = id ? `${id}-listbox` : 'char-select-listbox'

  const selected = characters.find((c) => c.id === value)

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>{selected ? selected.name : 'Selecione o personagem'}</span>
        <svg
          aria-hidden="true"
          className="lucide lucide-chevron-down h-4 w-4 opacity-50"
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-white shadow-md"
        >
          {characters.map((c) => (
            <li
              key={c.id}
              role="option"
              aria-selected={c.id === value}
              onClick={() => {
                onChange(c.id)
                setOpen(false)
              }}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              {c.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function HuntForm({ characters, onSuccess }: HuntFormProps) {
  const [charId, setCharId] = useState('')
  const [loot, setLoot] = useState('')
  const [expenses, setExpenses] = useState('')
  const [duration, setDuration] = useState('')
  const [pokemonTarget, setPokemonTarget] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Cálculo dinâmico do lucro líquido (preview visual — US03 AC Frontend)
  const lootNum = Number(loot) || 0
  const expensesNum = Number(expenses) || 0
  const netProfit = lootNum > 0 || expensesNum > 0 ? calculateNetProfit(lootNum, expensesNum) : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const rawData = {
      char_id: charId,
      loot: Number(loot),
      expenses: Number(expenses),
      duration: Number(duration),
      pokemon_target: pokemonTarget,
      // net_profit deliberadamente ausente — calculado no servidor
    }

    // Validação client-side
    const parsed = huntFormSchema.safeParse(rawData)
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
    const result = await createHuntAction(rawData)
    setIsSubmitting(false)

    if (!result.success) {
      setErrors({ server: result.error })
      return
    }

    // Limpa o formulário
    setCharId('')
    setLoot('')
    setExpenses('')
    setDuration('')
    setPokemonTarget('')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
    onSuccess?.(result)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Personagem */}
      <div className="space-y-1.5">
        <Label htmlFor="hunt-char">Personagem</Label>
        <CharSelect
          id="hunt-char"
          characters={characters}
          value={charId}
          onChange={setCharId}
        />
        {errors.char_id && <p className="text-xs text-red-500">{errors.char_id}</p>}
      </div>

      {/* Loot */}
      <div className="space-y-1.5">
        <Label htmlFor="hunt-loot">Loot (GP)</Label>
        <Input
          id="hunt-loot"
          type="number"
          min={0}
          value={loot}
          onChange={(e) => setLoot(e.target.value)}
          placeholder="Ex: 5000000"
        />
        {errors.loot && <p className="text-xs text-red-500">{errors.loot}</p>}
      </div>

      {/* Gastos */}
      <div className="space-y-1.5">
        <Label htmlFor="hunt-expenses">Gastos (GP)</Label>
        <Input
          id="hunt-expenses"
          type="number"
          min={0}
          value={expenses}
          onChange={(e) => setExpenses(e.target.value)}
          placeholder="Ex: 2000000"
        />
        {errors.expenses && <p className="text-xs text-red-500">{errors.expenses}</p>}
      </div>

      {/* Preview dinâmico de lucro líquido */}
      {netProfit !== null && (
        <div
          data-testid="hunt-preview"
          className={`rounded-md px-4 py-3 text-sm font-semibold ${
            netProfit >= 0
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-600'
          }`}
        >
          Lucro líquido estimado:{' '}
          <span className="font-bold">{formatGp(netProfit)}</span>
        </div>
      )}

      {/* Duração */}
      <div className="space-y-1.5">
        <Label htmlFor="hunt-duration">Duração (minutos)</Label>
        <Input
          id="hunt-duration"
          type="number"
          min={1}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Ex: 60"
        />
        {errors.duration && <p className="text-xs text-red-500">{errors.duration}</p>}
      </div>

      {/* Pokémon Alvo */}
      <div className="space-y-1.5">
        <Label htmlFor="hunt-pokemon">Pokémon Alvo</Label>
        <Input
          id="hunt-pokemon"
          value={pokemonTarget}
          onChange={(e) => setPokemonTarget(e.target.value)}
          placeholder="Ex: Dragonite"
        />
        {errors.pokemon_target && (
          <p className="text-xs text-red-500">{errors.pokemon_target}</p>
        )}
      </div>

      {/* Erro do servidor */}
      {errors.server && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {errors.server}
        </p>
      )}

      {success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Hunt registada com sucesso!
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Registando...' : 'Registrar hunt'}
      </Button>
    </form>
  )
}
