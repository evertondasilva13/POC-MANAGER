import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { signToken } from '@/lib/jwt'

const LoginSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
})

// POST /api/auth
// Body: { name: string, email: string }
// Cria o usuário se não existir, retorna JWT
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = LoginSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { name, email } = parsed.data

  // Upsert: cria ou retorna usuário existente
  const { data: user, error } = await supabase
    .from('users')
    .upsert({ name, email }, { onConflict: 'email', ignoreDuplicates: false })
    .select()
    .single()

  if (error || !user) {
    console.error('[auth] supabase error:', error)
    return NextResponse.json(
      { ok: false, error: 'Erro ao criar usuário.' },
      { status: 500 }
    )
  }

  const token = await signToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    is_admin: user.is_admin,
  })

  return NextResponse.json({
    ok: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_admin: user.is_admin,
      },
    },
  })
}
