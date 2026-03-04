'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/app/components/layout/ThemeToggle'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Swords,
  Trophy,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Zap,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/characters', label: 'Personagens', icon: Users, exact: false },
  { href: '/dashboard/hunt', label: 'Registar Hunt', icon: Swords, exact: false },
  { href: '/dashboard/ranking', label: 'Ranking', icon: Trophy, exact: false },
]

function PokeBallIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M1 16 Q16 16 31 16" stroke="currentColor" strokeWidth="2" />
      <path
        d="M1 16 Q4 5 16 1 Q28 5 31 16"
        fill="hsl(var(--primary))"
        fillOpacity="0.15"
      />
      <circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="2" fill="hsl(var(--background))" />
      <circle cx="16" cy="16" r="2.5" fill="hsl(var(--primary))" />
    </svg>
  )
}

export function Topbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoadingUser(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 4)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fechar mobile menu ao navegar
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setDropdownOpen(false)
    router.push('/')
  }

  async function handleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Trainer'

  const avatarUrl = user?.user_metadata?.avatar_url

  function isActive(link: (typeof NAV_LINKS)[number]) {
    if (link.exact) return pathname === link.href
    return pathname.startsWith(link.href)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-200',
        scrolled
          ? 'border-b border-border/80 bg-background/80 shadow-sm glass'
          : 'border-b border-border bg-background'
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-0 sm:px-6">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 py-3.5 text-foreground transition-opacity hover:opacity-80"
        >
          <PokeBallIcon className="h-7 w-7 text-primary" />
          <span className="text-lg font-bold tracking-tight">
            <span className="text-primary">Poke</span>
            <span>Hub</span>
          </span>
          <span className="hidden rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary sm:inline-block">
            Beta
          </span>
        </Link>

        {/* Nav Links — Desktop */}
        <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label="Navegação principal">
          {NAV_LINKS.map((link) => {
            const active = isActive(link)
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'group flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Icon
                  size={15}
                  className={cn(
                    'transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {/* Status indicator — conectado */}
          {user && (
            <div className="hidden items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </div>
          )}

          {/* Dark mode toggle */}
          <ThemeToggle />

          {/* User section */}
          {loadingUser ? (
            <div className="h-8 w-24 animate-pulse rounded-lg bg-secondary" />
          ) : user ? (
            /* User dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition-all',
                  dropdownOpen
                    ? 'border-primary/50 bg-accent text-foreground'
                    : 'border-border bg-secondary text-foreground hover:border-primary/30 hover:bg-accent'
                )}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                aria-label="Menu do utilizador"
              >
                {/* Avatar */}
                {avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-6 w-6 rounded-full object-cover ring-1 ring-primary/30"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary ring-1 ring-primary/30">
                    {displayName[0]?.toUpperCase()}
                  </div>
                )}
                <span className="hidden max-w-[100px] truncate text-sm font-medium sm:block">
                  {displayName}
                </span>
                <ChevronDown
                  size={13}
                  className={cn(
                    'text-muted-foreground transition-transform duration-200',
                    dropdownOpen && 'rotate-180'
                  )}
                />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 overflow-hidden rounded-xl border border-border bg-popover shadow-lg ring-1 ring-black/5 dark:ring-white/5">
                  <div className="border-b border-border px-4 py-3">
                    <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                    {user.email && (
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    )}
                  </div>
                  <div className="p-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <LogOut size={14} />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Login button */
            <button
              type="button"
              onClick={handleLogin}
              className="flex items-center gap-2 rounded-lg bg-[#5865F2] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#4752C4] hover:shadow-md active:scale-95"
              aria-label="Entrar com Discord"
            >
              <Zap size={14} />
              <span className="hidden sm:inline">Entrar</span>
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Navegação mobile">
            {NAV_LINKS.map((link) => {
              const active = isActive(link)
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              )
            })}
          </nav>
          {!user && (
            <div className="mt-3 border-t border-border pt-3">
              <button
                type="button"
                onClick={handleLogin}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#4752C4]"
              >
                <Zap size={14} />
                Entrar com Discord
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
