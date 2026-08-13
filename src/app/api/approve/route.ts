import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://poc-manager-mtm.vercel.app'

// GET /api/approve?token=UUID&action=approve|reject
// Endpoint público — autenticado apenas pelo token único do aprovador
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  const action = req.nextUrl.searchParams.get('action')

  if (!token || !['approve', 'reject'].includes(action ?? '')) {
    return html(errorPage('Link inválido.'), 400)
  }

  // Busca aprovador pelo token
  const { data: approver, error } = await supabase
    .from('poc_approvers')
    .select('*')
    .eq('approval_token', token)
    .single()

  if (error || !approver) {
    return html(errorPage('Link não encontrado ou já utilizado.'), 404)
  }

  if (approver.aprovado || approver.reprovado) {
    const status = approver.aprovado ? 'aprovado' : 'reprovado'
    return html(errorPage(`Esta resposta já foi registrada (${status}).`), 400)
  }

  // Busca nome da POC
  const { data: poc } = await supabase
    .from('pocs')
    .select('nome, status_dates')
    .eq('id', approver.poc_id)
    .single()

  const pocNome = poc?.nome ?? ''
  const now = new Date().toISOString()

  if (action === 'approve') {
    // Registra aprovação e invalida o token
    await supabase
      .from('poc_approvers')
      .update({ aprovado: true, reprovado: false, aprovado_em: now, approval_token: null })
      .eq('id', approver.id)

    await supabase.from('poc_history').insert({
      poc_id: approver.poc_id,
      emoji: '✅',
      event: `Aprovado por ${approver.nome}`,
      detail: `${approver.email} · via link de e-mail`,
      by_name: approver.nome,
      by_email: approver.email,
    })

    // Verifica se todos aprovaram → avança automaticamente para Homologação
    // (o SELECT roda após o UPDATE, então já reflete a aprovação atual)
    const { data: allApprovers } = await supabase
      .from('poc_approvers')
      .select('aprovado')
      .eq('poc_id', approver.poc_id)

    const allApproved = (allApprovers ?? []).every(a => a.aprovado)

    let advanced = false
    if (allApproved) {
      const statusDates = { ...(poc?.status_dates || {}), homologacao: now }
      await supabase
        .from('pocs')
        .update({ status: 'homologacao', status_dates: statusDates })
        .eq('id', approver.poc_id)

      await supabase.from('poc_history').insert({
        poc_id: approver.poc_id,
        emoji: '🚀',
        event: 'Todos aprovaram — POC avançou para Homologação automaticamente',
        detail: 'Aprovação via link de e-mail',
        by_name: 'Sistema',
        by_email: 'sistema',
      })
      advanced = true
    }

    return html(successPage('✅ Aprovado com sucesso!', pocNome, advanced), 200)
  } else {
    // Registra reprovação e invalida o token
    await supabase
      .from('poc_approvers')
      .update({ reprovado: true, aprovado: false, reprovado_em: now, approval_token: null })
      .eq('id', approver.id)

    await supabase.from('poc_history').insert({
      poc_id: approver.poc_id,
      emoji: '❌',
      event: `Reprovado por ${approver.nome}`,
      detail: `${approver.email} · via link de e-mail`,
      by_name: approver.nome,
      by_email: approver.email,
    })

    // Volta o card para 'ready' para permitir reenvio
    await supabase
      .from('pocs')
      .update({ status: 'ready' })
      .eq('id', approver.poc_id)

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
