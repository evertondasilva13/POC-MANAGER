import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { supabase } from '@/lib/supabase'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://poc-manager-mtm.vercel.app'
const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET!)

// GET /api/approve?token=JWT&action=approve|reject
// Endpoint público — autenticado pelo JWT assinado gerado no envio do e-mail
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  const action = req.nextUrl.searchParams.get('action')

  if (!token || !['approve', 'reject'].includes(action ?? '')) {
    return html(errorPage('Link inválido.'), 400)
  }

  // Verifica e decodifica o JWT
  let approverId: string
  let pocId: string
  try {
    const { payload } = await jwtVerify(token, jwtSecret)
    approverId = payload.approverId as string
    pocId = payload.pocId as string
    if (!approverId || !pocId) throw new Error('payload inválido')
  } catch {
    return html(errorPage('Link inválido ou expirado.'), 400)
  }

  // Busca o aprovador pelo ID
  const { data: approver, error } = await supabase
    .from('poc_approvers')
    .select('*')
    .eq('id', approverId)
    .eq('poc_id', pocId)
    .single()

  if (error || !approver) {
    return html(errorPage('Aprovador não encontrado.'), 404)
  }

  if (approver.aprovado || approver.reprovado) {
    const status = approver.aprovado ? 'aprovado' : 'reprovado'
    return html(errorPage(`Esta resposta já foi registrada (${status}).`), 400)
  }

  // Busca dados da POC
  const { data: poc } = await supabase
    .from('pocs')
    .select('nome, status_dates')
    .eq('id', pocId)
    .single()

  const pocNome = poc?.nome ?? ''
  const now = new Date().toISOString()

  if (action === 'approve') {
    await supabase
      .from('poc_approvers')
      .update({ aprovado: true, reprovado: false, aprovado_em: now })
      .eq('id', approverId)

    await supabase.from('poc_history').insert({
      poc_id: pocId,
      emoji: '✅',
      event: `Aprovado por ${approver.nome}`,
      detail: `${approver.email} · via link de e-mail`,
      by_name: approver.nome,
      by_email: approver.email,
    })

    // Verifica se todos aprovaram → avança para Homologação
    const { data: allApprovers } = await supabase
      .from('poc_approvers')
      .select('aprovado')
      .eq('poc_id', pocId)

    // Conta a aprovação atual (já commitada acima)
    const allApproved = (allApprovers ?? []).every(a => a.aprovado)

    let advanced = false
    if (allApproved) {
      const statusDates = { ...(poc?.status_dates || {}), homologacao: now }
      await supabase
        .from('pocs')
        .update({ status: 'homologacao', status_dates: statusDates })
        .eq('id', pocId)

      await supabase.from('poc_history').insert({
        poc_id: pocId,
        emoji: '🚀',
        event: 'Todos aprovaram — POC avançou para Homologação automaticamente',
        detail: 'Via link de e-mail',
        by_name: 'Sistema',
        by_email: 'sistema',
      })
      advanced = true
    }

    return html(successPage('✅ Aprovado com sucesso!', pocNome, advanced), 200)
  } else {
    await supabase
      .from('poc_approvers')
      .update({ reprovado: true, aprovado: false, reprovado_em: now })
      .eq('id', approverId)

    await supabase.from('poc_history').insert({
      poc_id: pocId,
      emoji: '❌',
      event: `Reprovado por ${approver.nome}`,
      detail: `${approver.email} · via link de e-mail`,
      by_name: approver.nome,
      by_email: approver.email,
    })

    await supabase
      .from('pocs')
      .update({ status: 'ready' })
      .eq('id', pocId)

    return html(successPage('❌ Reprovação registrada.', pocNome, false), 200)
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function html(content: string, status: number) {
  return new NextResponse(content, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function successPage(message: string, pocName: string, allApproved: boolean) {
  const isApprove = message.startsWith('✅')
  const icon = isApprove ? '✅' : '❌'
  const color = isApprove ? '#2E7D5E' : '#C0392B'
  const title = isApprove ? 'Aprovado com sucesso!' : 'Reprovação registrada.'
  const extra = allApproved
    ? `<p style="color:#2E7D5E;font-weight:600;margin-top:12px;font-size:14px">
        🎉 Todos os aprovadores responderam!<br>A POC avançou automaticamente para Homologação.
       </p>`
    : ''

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>POC Manager — Resposta Registrada</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',Arial,sans-serif;background:#F5F5F0;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:1rem}
    .card{background:#fff;border-radius:16px;padding:40px 32px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.10);max-width:440px;width:100%}
    .icon{font-size:56px;margin-bottom:16px;line-height:1}
    h2{font-size:22px;margin-bottom:10px}
    .poc{color:#555;font-size:14px;margin-bottom:4px}
    .cta{display:inline-block;margin-top:28px;background:#2C3E6B;color:#fff !important;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px}
    .footer{margin-top:20px;font-size:11px;color:#aaa}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h2 style="color:${color}">${title}</h2>
    <p class="poc">POC: <strong>${pocName}</strong></p>
    ${extra}
    <a href="${APP_URL}" class="cta">Abrir POC Manager</a>
    <p class="footer">POC Manager MTM — Mercado Livre</p>
  </div>
</body>
</html>`
}

function errorPage(msg: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>POC Manager — Erro</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',Arial,sans-serif;background:#F5F5F0;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:1rem}
    .card{background:#fff;border-radius:16px;padding:40px 32px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.10);max-width:440px;width:100%}
    .icon{font-size:56px;margin-bottom:16px;line-height:1}
    h2{color:#C0392B;font-size:18px;margin-bottom:12px}
    .cta{display:inline-block;margin-top:28px;background:#2C3E6B;color:#fff !important;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px}
    .footer{margin-top:20px;font-size:11px;color:#aaa}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⚠️</div>
    <h2>${msg}</h2>
    <a href="${APP_URL}" class="cta">Abrir POC Manager</a>
    <p class="footer">POC Manager MTM — Mercado Livre</p>
  </div>
</body>
</html>`
}
