// Landing Page — redesenho completo estilo gaming/SaaS premium
import Link from 'next/link'
import { LoginButton } from '@/app/components/auth/LoginButton'
import { ThemeToggle } from '@/app/components/layout/ThemeToggle'
import {
  BarChart3,
  Users,
  Trophy,
  Zap,
  Shield,
  TrendingUp,
  ArrowRight,
  Swords,
} from 'lucide-react'

function PokeBallIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="3" fill="none" />
      <path d="M2 32 Q32 32 62 32" stroke="currentColor" strokeWidth="3" />
      <path d="M2 32 Q6 10 32 2 Q58 10 62 32" fill="currentColor" fillOpacity="0.12" />
      <circle cx="32" cy="32" r="10" stroke="currentColor" strokeWidth="3" fill="hsl(var(--background))" />
      <circle cx="32" cy="32" r="5" fill="currentColor" />
    </svg>
  )
}

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Dashboard Pessoal',
    description: 'Visualize o seu desempenho com gráficos interativos, métricas de GP/h e histórico de hunts.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Swords,
    title: 'Registo de Hunts',
    description: 'Registe loot, gastos e duração de cada sessão. O lucro líquido é calculado automaticamente.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Trophy,
    title: 'Ranking Global',
    description: 'Compare resultados com outros trainers. Filtre por clã e nível para encontrar as melhores hunts.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Users,
    title: 'Gestão de Personagens',
    description: 'Registe todos os seus chars com clã, nível e equipa de Pokémon para organizar as hunts.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Shield,
    title: 'Login com Discord',
    description: 'Autenticação segura via Discord. Os seus dados ficam na nuvem e sincronizados em qualquer device.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Sem Login Necessário',
    description: 'Use todas as funcionalidades sem conta. Com login, os dados são guardados permanentemente.',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
]

const STATS = [
  { value: '10+', label: 'Clãs suportados' },
  { value: '∞', label: 'Hunts regístáveis' },
  { value: '100%', label: 'Gratuito' },
  { value: '0ms', label: 'Lag no registo' },
]

const CLAN_PILLS = [
  { name: 'Naturia', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { name: 'Malefic', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { name: 'Raibolt', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { name: 'Volcanic', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { name: 'Seavell', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { name: 'Wingeon', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  { name: 'Psycraft', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  { name: 'Ironhard', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navbar da Landing */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <PokeBallIcon className="h-7 w-7 text-primary" />
            <span className="text-lg font-bold">
              <span className="text-primary">Poke</span>Hub
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Dashboard
            </Link>
            <LoginButton compact />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -right-40 top-20 h-[400px] w-[400px] rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>

        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32">
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap size={13} />
              A ferramenta definitiva para trainers PokéxGames
            </div>
          </div>

          {/* Title */}
          <h1 className="text-center text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Domine o seu
            <br />
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              desempenho
            </span>{' '}
            no PokéxGames
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-muted-foreground">
            Registe hunts, analise métricas de GP/hora, compare com a comunidade
            e descubra quais Pokémon rendem mais para o seu clã.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <LoginButton />
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 rounded-xl border border-border bg-secondary px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/30 hover:bg-accent"
            >
              Ver Dashboard sem login
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Clan pills */}
          <div className="mt-14 flex flex-wrap justify-center gap-2">
            {CLAN_PILLS.map((clan) => (
              <span
                key={clan.name}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${clan.color}`}
              >
                {clan.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Tudo o que precisas num só lugar
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Funcionalidades pensadas especificamente para a comunidade PokéxGames,
              com foco em performance e facilidade de uso.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
                >
                  <div className={`mb-4 inline-flex rounded-xl p-2.5 ${feature.bg}`}>
                    <Icon size={22} className={feature.color} />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative overflow-hidden py-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <PokeBallIcon className="mx-auto mb-6 h-14 w-14 text-primary opacity-80 animate-float" />
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Pronto para começar?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Junte-se à comunidade, registe as suas primeiras hunts e descubra
            onde consegue mais GP/hora.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <LoginButton />
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Continuar sem login
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <PokeBallIcon className="h-4 w-4" />
              <span>PokeHub &copy; {new Date().getFullYear()}</span>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Ferramenta da comunidade. Não afiliada oficialmente ao PokéxGames.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
