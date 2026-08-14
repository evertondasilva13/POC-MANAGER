import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { supabase } from '@/lib/supabase'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://poc-manager-mtm.vercel.app'
const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET!)

// ─── GET — mostra página de confirmação (sem alterar banco)
// Clientes de e-mail fazem pre-fetch de links: o GET só exibe a tela, nunca grava.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  const action = req.nextUrl.searchParams.get('action')

  if (!token || !['approve', 'reject'].includes(action ?? '')) {
    return html(errorPage('Link inválido.'), 400)
  }

  // Verifica JWT (sem tocar no banco)
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

  // Busca dados apenas para exibir na tela de confirmação
  const { data: approver, error } = await supabase
    .from('poc_approvers')
    .select('nome, aprovado, reprovado')
    .eq('id', approverId)
    .eq('poc_id', pocId)
    .single()

  if (error || !approver) {
    return html(errorPage('Aprovador não encontrado.'), 404)
  }

  if (approver.aprovado || approver.reprovado) {
    const status = approver.aprovado ? 'aprovado ✅' : 'reprovado ❌'
    return html(successPage(`Sua resposta já foi registrada como ${status}.`, '', false, true), 200)
  }

  const { data: poc } = await supabase
    .from('pocs')
    .select('nome')
    .eq('id', pocId)
    .single()

  const pocNome = poc?.nome ?? ''
  const isApprove = action === 'approve'

  // Retorna página de confirmação — nenhum dado é gravado aqui
  return html(confirmPage(token, action!, pocNome, approver.nome, isApprove), 200)
}

// ─── POST — processa a aprovação/reprovação real (disparado pelo botão da página)
export async function POST(req: NextRequest) {
  let token: string
  let action: string

  try {
    const body = await req.json()
    token = body.token
    action = body.action
  } catch {
    return NextResponse.json({ ok: false, error: 'Payload inválido.' }, { status: 400 })
  }

  if (!token || !['approve', 'reject'].includes(action)) {
    return html(errorPage('Requisição inválida.'), 400)
  }

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
    const status = approver.aprovado ? 'aprovado ✅' : 'reprovado ❌'
    return html(successPage(`Sua resposta já foi registrada como ${status}.`, '', false, true), 200)
  }

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

    const { data: allApprovers } = await supabase
      .from('poc_approvers')
      .select('aprovado')
      .eq('poc_id', pocId)

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

    return html(successPage('✅ Aprovado com sucesso!', pocNome, advanced, false), 200)
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

    return html(successPage('❌ Reprovação registrada.', pocNome, false, false), 200)
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function html(content: string, status: number) {
  return new NextResponse(content, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function confirmPage(token: string, action: string, pocName: string, approverName: string, isApprove: boolean) {
  const icon = isApprove ? '🤔' : '🤔'
  const color = isApprove ? '#2E7D5E' : '#C0392B'
  const label = isApprove ? 'Confirmar Aprovação ✅' : 'Confirmar Reprovação ❌'
  const title = isApprove ? 'Aprovar esta POC?' : 'Reprovar esta POC?'
  const btnColor = isApprove ? '#2E7D5E' : '#C0392B'
  const apiUrl = `${APP_URL}/api/approve`

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>POC Manager — Confirmar Resposta</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',Arial,sans-serif;background:#F5F5F0;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:1rem}
    .card{background:#fff;border-radius:16px;padding:40px 32px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.10);max-width:440px;width:100%}
    .icon{font-size:56px;margin-bottom:16px;line-height:1}
    h2{font-size:20px;margin-bottom:8px;color:#1A1A2E}
    .poc{color:#555;font-size:14px;margin-bottom:4px}
    .approver{color:#888;font-size:12px;margin-bottom:24px}
    .btn-confirm{display:inline-block;margin-top:8px;background:${btnColor};color:#fff;border:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;cursor:pointer;width:100%;font-family:'Inter',Arial,sans-serif}
    .btn-confirm:hover{opacity:.9}
    .btn-cancel{display:inline-block;margin-top:10px;background:#f0f0f0;color:#555;border:none;padding:11px 32px;border-radius:10px;font-weight:600;font-size:13px;cursor:pointer;width:100%;font-family:'Inter',Arial,sans-serif;text-decoration:none}
    .msg{display:none;margin-top:16px;font-size:13px;color:#555}
    .footer{margin-top:24px;font-size:11px;color:#aaa}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h2 style="color:${color}">${title}</h2>
    <p class="poc">POC: <strong>${pocName}</strong></p>
    <p class="approver">Olá, <strong>${approverName}</strong>. Confirme sua resposta abaixo.</p>
    <button class="btn-confirm" onclick="confirm()">
      ${label}
    </button>
    <a href="${APP_URL}" class="btn-cancel">Cancelar</a>
    <p class="msg" id="msg">Processando...</p>
    <p class="footer">POC Manager MTM — Mercado Livre</p>
  </div>
  <script>
    async function confirm() {
      document.querySelector('.btn-confirm').disabled = true
      document.querySelector('.btn-confirm').textContent = 'Processando...'
      document.getElementById('msg').style.display = 'block'
      try {
        const res = await fetch('${apiUrl}', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: '${token.replace(/'/g, "\\'")}', action: '${action}' })
        })
        const html = await res.text()
        document.open(); document.write(html); document.close()
      } catch(e) {
        document.getElementById('msg').textContent = 'Erro ao processar. Tente novamente.'
        document.querySelector('.btn-confirm').disabled = false
        document.querySelector('.btn-confirm').textContent = '${label}'
      }
    }
  </script>
</body>
</html>`
}

function successPage(message: string, pocName: string, allApproved: boolean, alreadyDone: boolean) {
  const isApprove = message.startsWith('✅')
  const icon = alreadyDone ? 'ℹ️' : (isApprove ? '✅' : '❌')
  const color = alreadyDone ? '#2C3E6B' : (isApprove ? '#2E7D5E' : '#C0392B')
  const title = alreadyDone ? message : (isApprove ? 'Aprovado com sucesso!' : 'Reprovação registrada.')
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
    ${pocName ? `<p class="poc">POC: <strong>${pocName}</strong></p>` : ''}
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
