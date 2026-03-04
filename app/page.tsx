// Landing Page — ponto de entrada público da aplicação
import Link from 'next/link'
import { LoginButton } from '@/app/components/auth/LoginButton'

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold text-center">PokéxGames Hub</h1>
      <p className="text-lg text-muted-foreground text-center max-w-md">
        Gerencie suas sessões de caça, acompanhe seu progresso e compare resultados com outros jogadores.
      </p>
      <div className="flex flex-col gap-3 items-center">
        <LoginButton />
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          Ir para o Dashboard sem login
        </Link>
      </div>
    </main>
  )
}
