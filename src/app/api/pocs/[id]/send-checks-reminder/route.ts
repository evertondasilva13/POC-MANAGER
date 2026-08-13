import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { getAuthUser, requireAuth } from '@/lib/auth'
import { sendEmail, buildChecksReminderEmail } from '@/lib/email'

type Params = { params: { id: string } }

const SendSchema = z.object({
  supervisor_mtm: z.object({ nome: z.string(), email: z.string().email() }).optional(),
  gerente_mtm: z.object({ nome: z.string(), email: z.string().email() }).optional(),
})

const CHECK_LABELS: Record<string, string> = {
  checklist: 'Criação de Checklist',
  playbook: 'Playbook',
  catalogo: 'Catálogo',
  paginaMTM: 'Página MTM',
}

// POST /api/pocs/[id]/send-checks-reminder
export async function POST(req: NextRequest, { params }: Params) {
  const user = await getAuthUser(req)
  const authErr = requireAuth(user)
  if (authErr) return authErr

  const body = await req.json().catch(() => ({}))
  const parsed = SendSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { supervisor_mtm, gerente_mtm } = parsed.data

  const { data: poc, error: pocErr } = await supabase
    .from('pocs')
    .select('*, poc_checks(*)')
    .eq('id', params.id)
    .single()

  if (pocErr || !poc) {
    return NextResponse.json({ ok: false, error: 'POC não encontrada.' }, { status: 404 })
  }

  const checks = poc.poc_checks || []
  const pendingKeys = ['checklist', 'playbook', 'catalogo', 'paginaMTM'].filter(
    (k) => !checks.find((c: { key: string; done: boolean }) => c.key === k)?.done
  )

  if (pendingKeys.length === 0) {
    return NextResponse.json({ ok: false, error: 'Todos os checks já foram concluídos.' }, { status: 400 })
  }

  // Salva supervisor/gerente se informados
  const updateFields: Record<string, unknown> = { checks_email_sent_at: new Date().toISOString() }
  if (supervisor_mtm) {
    updateFields.supervisor_mtm_nome = supervisor_mtm.nome
    updateFields.supervisor_mtm_email = supervisor_mtm.email
  }
  if (gerente_mtm) {
    updateFields.gerente_mtm_nome = gerente_mtm.nome
    updateFields.gerente_mtm_email = gerente_mtm.email
  }
  await supabase.from('pocs').update(updateFields).eq('id', params.id)

  const daysPending = poc.checks_email_sent_at
    ? Math.floor((Date.now() - new Date(poc.checks_email_sent_at).getTime()) / 86400000)
    : 0

  const pendingLabels = pendingKeys.map(k => CHECK_LABELS[k] || k)

  // Destinatários: o próprio usuário (remetente) + supervisor + gerente em CC
  const cc: { name: string; email: string }[] = []
  if (supervisor_mtm?.email) cc.push({ name: supervisor_mtm.nome, email: supervisor_mtm.email })
  if (gerente_mtm?.email) cc.push({ name: gerente_mtm.nome, email: gerente_mtm.email })

  await sendEmail({
    to: [{ name: user!.name, email: user!.email }],
    cc,
    subject: `[REMINDER] Pendências Pós-Homologação — ${poc.nome} (${daysPending}d)`,
    htmlContent: buildChecksReminderEmail(poc, pendingLabels, daysPending),
  })

  await supabase.from('poc_history').insert({
    poc_id: params.id,
    emoji: '⏰',
    event: 'Reminder pós-homologação enviado',
    detail: `Pendentes: ${pendingLabels.join(', ')}`,
    by_name: user!.name,
    by_email: user!.email,
  })

  return NextResponse.json({ ok: true, data: { sent: 1, pending: pendingKeys } })
}
