import { supabase } from '@/lib/supabase'
import type { JwtPayload } from '@/types'

/**
 * A POC pode ser alterada apenas pelo seu criador ou por um administrador.
 * A visibilidade é tratada separadamente: todos os usuários autenticados
 * podem consultar os projetos do time.
 */
export async function canManagePoc(user: JwtPayload, pocId: string): Promise<boolean> {
  if (user.is_admin) return true

  const { data } = await supabase
    .from('pocs')
    .select('created_by_id')
    .eq('id', pocId)
    .maybeSingle()

  return data?.created_by_id === user.sub
}

export async function requirePocManager(user: JwtPayload, pocId: string): Promise<Response | null> {
  if (await canManagePoc(user, pocId)) return null

  return new Response(
    JSON.stringify({ ok: false, error: 'Você só pode editar os seus próprios projetos.' }),
    { status: 403, headers: { 'Content-Type': 'application/json' } }
  )
}
