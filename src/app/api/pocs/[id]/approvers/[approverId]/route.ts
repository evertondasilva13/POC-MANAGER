import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { getAuthUser, requireAuth } from '@/lib/auth'

type Params = { params: { id: string; approverId: string } }

const ActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'reset']),
  motivo_reprovacao: z.string().optional(),
})

// PATCH /api/pocs/[id]/approvers/[approverId]
// body: { action: 'approve' | 'reject' | 'reset', motivo_reprovacao?: string }
export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getAuthUser(req)
  const authErr = requireAuth(user)
  if (authErr) return authErr

  const body = await req.json().catch(() => null)
  const parsed = ActionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { action, motivo_reprovacao } = parsed.data
  const now = new Date().toISOString()

  let update: Record<string, unknown> = {}
  let historyEmoji = ''
  let historyEvent = ''

  if (action === 'approve') {
    update = { aprovado: true, reprovado: false, aprovado_em: now, motivo_reprovacao: null }
    historyEmoji = '✅'
    historyEvent = 'Aprovado'
  } else if (action === 'reject') {
    update = { reprovado: true, aprovado: false, reprovado_em: now, motivo_reprovacao: motivo_reprovacao || null }
    historyEmoji = '❌'
    historyEvent = `Reprovado${motivo_reprovacao ? ` — ${motivo_reprovacao}` : ''}`
  } else {
    update = { aprovado: false, reprovado: false, aprovado_em: null, reprovado_em: null, motivo_reprovacao: null, enviado_em: null }
    historyEmoji = '↩'
    historyEvent = 'Aprovação resetada'
  }

  const { data: approver, error } = await supabase
    .from('poc_approvers')
    .update(update)
    .eq('id', params.approverId)
    .eq('poc_id', params.id)
    .select()
    .single()

  if (error || !approver) {
    return NextResponse.json({ ok: false, error: 'Aprovador não encontrado.' }, { status: 404 })
  }

  await supabase.from('poc_history').insert({
    poc_id: params.id,
    emoji: historyEmoji,
    event: `${historyEvent} por ${approver.nome}`,
    detail: `${approver.email} · ${approver.type === 'op' ? 'Operação' : 'SHE'}`,
    by_name: user!.name,
    by_email: user!.email,
  })

  return NextResponse.json({ ok: true, data: approver })
}

// DELETE /api/pocs/[id]/approvers/[approverId]
export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await getAuthUser(req)
  const authErr = requireAuth(user)
  if (authErr) return authErr

  const { error } = await supabase
    .from('poc_approvers')
    .delete()
    .eq('id', params.approverId)
    .eq('poc_id', params.id)

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, data: null })
}
