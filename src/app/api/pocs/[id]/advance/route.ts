import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { getAuthUser, requireAuth } from '@/lib/auth'
import type { PocStatus } from '@/types'

type Params = { params: { id: string } }

const AdvanceSchema = z.object({
  to: z.enum(['ready', 'approval', 'homologacao', 'checks', 'finished']),
})

const STATUS_EMOJI: Record<string, string> = {
  ready: '✅',
  approval: '📧',
  homologacao: '🟣',
  checks: '🩵',
  finished: '🏆',
}

const STATUS_LABEL_PT: Record<string, string> = {
  ready: 'Pronto para Aprovação',
  approval: 'Em Aprovação',
  homologacao: 'Homologação',
  checks: 'Pós-Homologação',
  finished: 'Finalizado',
}

// POST /api/pocs/[id]/advance — avança o status da POC
export async function POST(req: NextRequest, { params }: Params) {
  const user = await getAuthUser(req)
  const authErr = requireAuth(user)
  if (authErr) return authErr

  const body = await req.json().catch(() => null)
  const parsed = AdvanceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { to } = parsed.data
  const now = new Date().toISOString()

  // Busca POC atual para validações
  const { data: poc, error: fetchErr } = await supabase
    .from('pocs')
    .select('*, poc_approvers(*), poc_checks(*)')
    .eq('id', params.id)
    .single()

  if (fetchErr || !poc) {
    return NextResponse.json({ ok: false, error: 'POC não encontrada.' }, { status: 404 })
  }

  // Validações por status destino
  if (to === 'finished') {
    const checks = poc.poc_checks || []
    const allDone = ['checklist', 'playbook', 'catalogo', 'paginaMTM'].every(
      (k) => checks.find((c: { key: string; done: boolean }) => c.key === k)?.done
    )
    if (!allDone) {
      return NextResponse.json(
        { ok: false, error: 'Conclua todos os checks antes de finalizar.' },
        { status: 400 }
      )
    }
  }

  if (to === 'homologacao') {
    const approvers = poc.poc_approvers || []
    if (approvers.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Adicione aprovadores antes de avançar para Homologação.' },
        { status: 400 }
      )
    }
    const allApproved = approvers.every((a: { aprovado: boolean }) => a.aprovado)
    if (!allApproved) {
      return NextResponse.json(
        { ok: false, error: 'Todos os aprovadores precisam aprovar antes de avançar.' },
        { status: 400 }
      )
    }
  }

  const newStatusDates = {
    ...(poc.status_dates || {}),
    [to]: now,
  }

  const { data: updated, error } = await supabase
    .from('pocs')
    .update({ status: to as PocStatus, status_dates: newStatusDates })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  await supabase.from('poc_history').insert({
    poc_id: params.id,
    emoji: STATUS_EMOJI[to] || '➡️',
    event: `Status avançado para: ${STATUS_LABEL_PT[to] || to}`,
    by_name: user!.name,
    by_email: user!.email,
  })

  return NextResponse.json({ ok: true, data: updated })
}
