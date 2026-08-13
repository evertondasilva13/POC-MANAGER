import { NextResponse } from 'next/server'

export async function GET() {
  const key = process.env.BREVO_API_KEY
  const from = process.env.EMAIL_FROM

  if (!key) return NextResponse.json({ ok: false, error: 'BREVO_API_KEY não definida' })
  if (!from) return NextResponse.json({ ok: false, error: 'EMAIL_FROM não definida' })

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': key,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'POC Manager MTM', email: from },
        to: [{ name: 'Teste', email: from }],
        subject: '[TESTE] POC Manager — diagnóstico',
        htmlContent: '<p>Teste de conectividade Brevo.</p>',
      }),
    })

    const body = await res.text()
    return NextResponse.json({ ok: res.ok, status: res.status, brevo_response: body, key_preview: key.slice(-6), from })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message, key_preview: key.slice(-6), from })
  }
}
