import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { getAuthUser, requireAuth } from '@/lib/auth'

type Params = { params: { id: string } }

const AddApproverSchema = z.object({
  type: z.enum(['op', 'she']),
  nome: z.string().min(1),
  email: z.string().email(),
})

// POST /api/pocs/[id]/approvers — adiciona aprovador
export async function POST(req: NextRequest, { params }: Params) {
  const user = await getAuthUser(req)
  const authErr = requireAuth(user)
  if (authErr) return authErr

  const body = await req.json().catch(() => null)
  const parsed = AddApproverSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { type, nome, email } = parsed.data

  // Verifica limite de 3 por tipo
  const { count } = await supabase
    .from('poc_approvers')
    .select('*', { count: 'exact', head: true })
    .eq('poc_id', params.id)
    .eq('type', type)

  if ((count ?? 0) >= 3) {
    return NextResponse.json({ ok: false, error: 'Máximo de 3 aprovadores por área.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('poc_approvers')
    .insert({ poc_id: params.id, type, nome, email })
    .select()
    .single()

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, data }, { status: 201 })
}
