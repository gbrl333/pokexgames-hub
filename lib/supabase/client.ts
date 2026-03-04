import { createBrowserClient } from '@supabase/ssr'

// Next.js substitui variáveis NEXT_PUBLIC_ estaticamente em build time.
// Acesso via process.env[variavel_dinamica] não funciona — deve ser literal.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) throw new Error('Variável de ambiente NEXT_PUBLIC_SUPABASE_URL não definida')
if (!supabaseAnonKey) throw new Error('Variável de ambiente NEXT_PUBLIC_SUPABASE_ANON_KEY não definida')

export function createClient() {
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!)
}
