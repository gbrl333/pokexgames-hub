// Layout do dashboard — usa o novo Topbar responsivo com auth
import { Topbar } from '@/app/components/layout/Topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Topbar />

      {/* Conteúdo da página */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <p className="text-center text-xs text-muted-foreground">
            PokeHub &copy; {new Date().getFullYear()} &mdash; Ferramenta da comunidade PokéxGames. Não afiliado oficialmente.
          </p>
        </div>
      </footer>
    </div>
  )
}
