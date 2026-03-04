import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Next.js substitui variáveis NEXT_PUBLIC_ estaticamente em build time.
// Acesso via process.env[variavel_dinamica] não funciona — deve ser literal.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // setAll chamado de um Server Component — pode ser ignorado com segurança
          }
        },
      },
    },
  )
}
