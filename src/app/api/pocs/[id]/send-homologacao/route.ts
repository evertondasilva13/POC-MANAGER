import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { getAuthUser, requireAuth } from '@/lib/auth'
import { sendEmail, buildHomologacaoEmail } from '@/lib/email'

type Params = { params: { id: string } }

const ResponsavelSchema = z.object({
  role: z.enum(['SHE', 'Compras', 'Operacao', 'Lean', 'MTM']),
  nome: z.string().min(1),
  email: z.string().email(),
})

const SendSchema = z.object({
  responsaveis: z.array(ResponsavelSchema).min(1, 'Adicione ao menos um responsável.'),
})

// POST /api/pocs/[id]/send-homologacao
export async function POST(req: NextRequest, { params }: Params) {
  const user = await getAuthUser(req)
  const authErr = requireAuth(user)
  if (authErr) return authErr

  const body = await req.json().catch(() => null)
  const parsed = SendSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { responsaveis } = parsed.data

  const { data: poc, error: pocErr } = await supabase
    .from('pocs')
    .select('*')
    .eq('id', params.id)
    .single()

  if (pocErr || !poc) {
    return NextResponse.json({ ok: false, error: 'POC não encontrada.' }, { status: 404 })
  }

  // Salva/atualiza responsáveis no banco
  for (const resp of responsaveis) {
    await supabase
      .from('poc_responsaveis')
      .upsert({ poc_id: params.id, ...resp }, { onConflict: 'poc_id,role' })
  }

  // Envia e-mail único para todos os responsáveis
  const to = responsaveis.map(r => ({ name: r.nome, email: r.email }))

  await sendEmail({
    to,
    subject: `[POC MTM] Equipamento Validado — ${poc.nome}`,
    htmlContent: buildHomologacaoEmail(poc),
  })

  // Marca e-mail enviado e atualiza status
  const now = new Date().toISOString()
  const newStatusDates = { ...(poc.status_dates || {}), homologacao: now }

  await supabase
    .from('pocs')
    .update({
      email_homologacao_enviado: true,
      status: 'homologacao',
      status_dates: newStatusDates,
    })
    .eq('id', params.id)

  await supabase.from('poc_history').insert({
    poc_id: params.id,
    emoji: '📬',
    event: 'E-mail de homologação enviado',
    detail: responsaveis.map(r => `${r.role}: ${r.nome} (${r.email})`).join(', '),
    by_name: user!.name,
    by_email: user!.email,
  })

  return NextResponse.json({ ok: true, data: { sent: to.length } })
}
