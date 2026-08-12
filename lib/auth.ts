import { NextRequest } from 'next/server'
import { verifyToken } from './jwt'
import type { JwtPayload } from '@/types'

export async function getAuthUser(req: NextRequest): Promise<JwtPayload | null> {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) return null

  try {
    return await verifyToken(token)
  } catch {
    return null
  }
}

export function requireAuth(user: JwtPayload | null): Response | null {
  if (!user) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Não autorizado.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }
  return null
}

export function requireAdmin(user: JwtPayload | null): Response | null {
  const authError = requireAuth(user)
  if (authError) return authError
  if (!user!.is_admin) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Acesso restrito a administradores.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }
  return null
}
