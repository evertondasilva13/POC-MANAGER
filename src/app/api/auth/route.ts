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

  // Tenta buscar usuário existente pelo e-mail
  const { data: existing } = await supabase
    .from('users')
    .select()
    .eq('email', email)
    .single()

  let user: any
  let error: any

  if (existing) {
    // Atualiza apenas o nome, preserva is_admin
    const { data: updated, error: updateErr } = await supabase
      .from('users')
      .update({ name })
      .eq('email', email)
      .select()
      .single()
    user = updated
    error = updateErr
  } else {
    // Cria novo usuário (is_admin padrão = false)
    const { data: created, error: insertErr } = await supabase
      .from('users')
      .insert({ name, email, is_admin: false })
      .select()
      .single()
    user = created
    error = insertErr
  }

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
