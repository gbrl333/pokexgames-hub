'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Evita hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground',
          className
        )}
        aria-label="Alternar tema"
      >
        <Sun size={16} />
      </button>
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      className={cn(
        'group relative flex h-9 w-9 items-center justify-center rounded-lg border border-border',
        'bg-secondary text-muted-foreground transition-all duration-200',
        'hover:border-primary/50 hover:bg-accent hover:text-primary',
        className
      )}
    >
      <Sun
        size={16}
        className={cn(
          'absolute transition-all duration-300',
          isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
        )}
      />
      <Moon
        size={16}
        className={cn(
          'absolute transition-all duration-300',
          isDark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        )}
      />
    </button>
  )
}
