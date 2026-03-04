// Página de login via Discord OAuth (US01)
import { LoginButton } from '@/app/components/auth/LoginButton'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">PokéxGames Hub</h1>
        <p className="text-muted-foreground">
          Faça login para registrar suas hunts e ver o ranking da comunidade.
        </p>
      </div>
      <LoginButton />
    </main>
  )
}
