import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { SignJWT } from 'jose'
import { supabase } from '@/lib/supabase'
import { getAuthUser, requireAuth } from '@/lib/auth'
import { sendEmail, buildApprovalEmail } from '@/lib/email'

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET!)

type Params = { params: { id: string } }

const SendSchema = z.object({
  is_reminder: z.boolean().optional(),
  approver_id: z.string().uuid().optional(), // se omitido, envia para todos
})

// POST /api/pocs/[id]/send-approval
export async function POST(req: NextRequest, { params }: Params) {
  const user = await getAuthUser(req)
  const authErr = requireAuth(user)
  if (authErr) return authErr

  const body = await req.json().catch(() => ({}))
  const parsed = SendSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { is_reminder = false, approver_id } = parsed.data

  const { data: poc, error: pocErr } = await supabase
    .from('pocs')
    .select('*, poc_approvers(*)')
    .eq('id', params.id)
    .single()

  if (pocErr || !poc) {
    return NextResponse.json({ ok: false, error: 'POC não encontrada.' }, { status: 404 })
  }

  let approvers = poc.poc_approvers || []
  if (approver_id) {
    approvers = approvers.filter((a: { id: string }) => a.id === approver_id)
  }
  if (!is_reminder) {
    // no envio inicial, filtra apenas os não enviados ainda
    approvers = approvers.filter((a: { enviado_em: string | null; aprovado: boolean }) => !a.enviado_em && !a.aprovado)
  }

  if (approvers.length === 0) {
    return NextResponse.json({ ok: false, error: 'Nenhum aprovador para notificar.' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const errors: string[] = []
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://poc-manager-mtm.vercel.app'

  for (const approver of approvers) {
    const daysPending = approver.enviado_em
      ? Math.floor((Date.now() - new Date(approver.enviado_em).getTime()) / 86400000)
      : 0

    try {
      // Gera JWT assinado com o ID do aprovador (válido por 30 dias)
      const approvalToken = await new SignJWT({ approverId: approver.id, pocId: params.id })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(jwtSecret)

      // Atualiza apenas enviado_em (token fica no JWT, não precisa salvar no banco)
      await supabase
        .from('poc_approvers')
        .update({ enviado_em: now })
        .eq('id', approver.id)

      const approveUrl = `${baseUrl}/api/approve?token=${encodeURIComponent(approvalToken)}&action=approve`
      const rejectUrl = `${baseUrl}/api/approve?token=${encodeURIComponent(approvalToken)}&action=reject`

      await sendEmail({
        to: [{ name: approver.nome, email: approver.email }],
        subject: is_reminder
          ? `[REMINDER] Aprovação Pendente — ${poc.nome} (${daysPending}d)`
          : `[POC MTM] Solicitação de Aprovação — ${poc.nome}`,
        htmlContent: buildApprovalEmail(
          poc,
          approver.nome,
          approveUrl,
          rejectUrl,
          is_reminder,
          daysPending
        ),
      })
    } catch (e) {
      errors.push(`${approver.email}: ${(e as Error).message}`)
    }
  }

  // Primeira vez: avança status para 'approval'
  if (!is_reminder && poc.status === 'ready') {
    const newStatusDates = { ...(poc.status_dates || {}), approval: now }
    await supabase
      .from('pocs')
      .update({ status: 'approval', aprovacao_enviada_em: now, status_dates: newStatusDates })
      .eq('id', params.id)
  }

  await supabase.from('poc_history').insert({
    poc_id: params.id,
    emoji: is_reminder ? '⏰' : '📧',
    event: is_reminder ? 'Reminder de aprovação enviado' : 'E-mails de aprovação enviados',
    detail: approvers.map((a: { nome: string; email: string }) => `${a.nome} (${a.email})`).join(', '),
    by_name: user!.name,
    by_email: user!.email,
  })

  if (errors.length > 0) {
    return NextResponse.json({ ok: false, error: `Alguns e-mails falharam: ${errors.join('; ')}` }, { status: 207 })
  }

  return NextResponse.json({ ok: true, data: { sent: approvers.length } })
}
