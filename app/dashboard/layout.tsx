// Layout do dashboard — público, sem exigência de autenticação
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Barra de navegação */}
      <header className="border-b bg-background">
        <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
          <Link href="/dashboard" className="text-lg font-bold tracking-tight">
            PokéxGames Hub
          </Link>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/dashboard/characters" className="hover:text-foreground">
              Personagens
            </Link>
            <Link href="/dashboard/hunt" className="hover:text-foreground">
              Registrar Hunt
            </Link>
            <Link href="/dashboard/ranking" className="hover:text-foreground">
              Ranking
            </Link>
          </div>
        </nav>
      </header>

      {/* Conteúdo da página */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  )
}
