/**
 * Serviço de e-mail via Brevo (antigo Sendinblue)
 * Usa a API transacional REST diretamente (sem SDK para manter bundle pequeno)
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'
const BREVO_API_KEY = process.env.BREVO_API_KEY!
const FROM_EMAIL = process.env.EMAIL_FROM ?? 'poc-manager@mercadolivre.com'
const FROM_NAME = process.env.EMAIL_FROM_NAME ?? 'POC Manager MTM'

export interface EmailRecipient {
  name: string
  email: string
}

export interface SendEmailParams {
  to: EmailRecipient[]
  cc?: EmailRecipient[]
  subject: string
  htmlContent: string
  textContent?: string
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const body = {
    sender: { name: FROM_NAME, email: FROM_EMAIL },
    to: params.to,
    cc: params.cc ?? [],
    subject: params.subject,
    htmlContent: params.htmlContent,
    textContent: params.textContent ?? params.htmlContent.replace(/<[^>]+>/g, ''),
  }

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Brevo error ${res.status}: ${err}`)
  }
}

// ─── TEMPLATES HTML ──────────────────────────────────────────────────────────

const baseStyle = `
  font-family: 'Inter', Arial, sans-serif;
  color: #333;
  max-width: 600px;
  margin: 0 auto;
`

const headerStyle = `
  background: #2C3E6B;
  padding: 24px 28px;
  border-radius: 12px 12px 0 0;
`

const bodyStyle = `
  background: #fff;
  padding: 24px 28px;
  border: 1px solid #EBEBEB;
  border-top: none;
`

const footerStyle = `
  background: #F5F5F5;
  padding: 16px 28px;
  border-radius: 0 0 12px 12px;
  font-size: 12px;
  color: #717171;
  border: 1px solid #EBEBEB;
  border-top: none;
`

const btnStyle = (color = '#2C3E6B') => `
  display: inline-block;
  background: ${color};
  color: #fff !important;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  margin: 6px 4px;
`

function pocInfoBlock(poc: PocEmailData): string {
  return `
  <div style="background:#EEF2FF;border:1px solid rgba(44,62,107,0.18);border-radius:10px;padding:16px 20px;margin:16px 0">
    <div style="font-size:15px;font-weight:700;color:#1E2D52;margin-bottom:10px">📌 ${poc.nome}</div>
    <div style="font-size:13px;line-height:1.7;color:#333">
      <b>Descrição:</b> ${poc.descricao}<br>
      <b>KPI Chave:</b> ${poc.kpi_chave}<br>
      ${poc.resultado ? `<b>Resultado:</b> ${poc.resultado}<br>` : ''}
      ${poc.link_apresentacao ? `<b>Apresentação:</b> <a href="${poc.link_apresentacao}" style="color:#2C3E6B">${poc.link_apresentacao}</a><br>` : ''}
      ${poc.arquivo_apresentacao_name ? `<b>Arquivo:</b> ${poc.arquivo_apresentacao_name}<br>` : ''}
    </div>
  </div>`
}

export interface PocEmailData {
  nome: string
  descricao: string
  kpi_chave: string
  resultado?: string | null
  link_apresentacao?: string | null
  arquivo_apresentacao_name?: string | null
  desenho_tecnico_name?: string | null
}

// ─── 1. E-mail de Aprovação ────────────────────────────────────────────────
export function buildApprovalEmail(
  poc: PocEmailData,
  recipientName: string,
  creatorEmail: string,
  isReminder = false,
  daysPending = 0
): string {
  const approveSubject = encodeURIComponent(`✅ APROVADO — ${poc.nome}`)
  const approveBody = encodeURIComponent(`Aprovo a POC "${poc.nome}".\n\n— ${recipientName}`)
  const rejectSubject = encodeURIComponent(`❌ REPROVADO — ${poc.nome}`)
  const rejectBody = encodeURIComponent(`Não aprovo a POC "${poc.nome}".\n\nMotivo: [descreva aqui]\n\n— ${recipientName}`)

  const approveLink = `mailto:${creatorEmail}?subject=${approveSubject}&body=${approveBody}`
  const rejectLink = `mailto:${creatorEmail}?subject=${rejectSubject}&body=${rejectBody}`

  return `
  <div style="${baseStyle}">
    <div style="${headerStyle}">
      ${isReminder
        ? `<div style="background:#C4631A;color:#fff;font-size:11px;font-weight:700;letter-spacing:1px;padding:4px 12px;border-radius:20px;display:inline-block;margin-bottom:10px">⏰ REMINDER — ${daysPending} dia(s) pendente</div>`
        : ''}
      <div style="font-size:20px;font-weight:900;color:#F5E97A;font-family:Raleway,Arial,sans-serif">
        ${isReminder ? 'Aprovação Pendente' : 'Solicitação de Aprovação'}
      </div>
      <div style="font-size:12px;color:rgba(255,255,255,0.65);margin-top:4px">POC Manager MTM — Mercado Livre</div>
    </div>
    <div style="${bodyStyle}">
      <p style="font-size:14px;margin-top:0">Olá <b>${recipientName}</b>,</p>
      <p style="font-size:13px;color:#555;line-height:1.6">
        ${isReminder
          ? `Gostaríamos de lembrar que a POC abaixo ainda aguarda sua aprovação há <b>${daysPending} dia(s)</b>.`
          : 'Você foi indicado(a) como aprovador(a) da seguinte Prova de Conceito:'}
      </p>
      ${pocInfoBlock(poc)}
      <p style="font-size:13px;margin-bottom:8px"><b>Para responder, clique em uma das opções:</b></p>
      <a href="${approveLink}" style="${btnStyle('#2E7D5E')}">✅ Aprovar</a>
      <a href="${rejectLink}" style="${btnStyle('#C0392B')}">❌ Reprovar</a>
      <p style="font-size:11px;color:#717171;margin-top:16px;line-height:1.5">
        Ao clicar, seu cliente de e-mail abrirá com uma resposta pré-preenchida. Basta enviar.<br>
        Esta solicitação é exclusiva para <b>${recipientName}</b>.
      </p>
    </div>
    <div style="${footerStyle}">
      POC Manager MTM — Mercado Livre &bull; Este e-mail foi gerado automaticamente.
    </div>
  </div>`
}

// ─── 2. E-mail de Homologação ──────────────────────────────────────────────
export function buildHomologacaoEmail(poc: PocEmailData): string {
  return `
  <div style="${baseStyle}">
    <div style="${headerStyle}">
      <div style="font-size:20px;font-weight:900;color:#F5E97A;font-family:Raleway,Arial,sans-serif">
        Equipamento Validado para Homologação
      </div>
      <div style="font-size:12px;color:rgba(255,255,255,0.65);margin-top:4px">POC Manager MTM — Mercado Livre</div>
    </div>
    <div style="${bodyStyle}">
      <p style="font-size:14px;margin-top:0">Olá,</p>
      <p style="font-size:13px;color:#555;line-height:1.6">
        Informamos que o equipamento da POC abaixo foi <b>validado e aprovado</b> para seguir para a etapa de homologação.
      </p>
      ${pocInfoBlock(poc)}
      ${poc.desenho_tecnico_name
        ? `<div style="background:#E0F5F7;border:1px solid rgba(11,126,138,0.2);border-radius:8px;padding:12px 16px;font-size:12px;color:#0B7E8A;margin-bottom:12px">
            📐 <b>Desenho Técnico:</b> ${poc.desenho_tecnico_name} (em anexo ao e-mail original)
           </div>`
        : ''}
      <p style="font-size:13px;color:#555;line-height:1.6">
        Por favor, siga com o processo de homologação conforme os procedimentos internos do time MTM.
      </p>
    </div>
    <div style="${footerStyle}">
      POC Manager MTM — Mercado Livre &bull; Este e-mail foi gerado automaticamente.
    </div>
  </div>`
}

// ─── 3. Reminder pós-homologação ──────────────────────────────────────────
export function buildChecksReminderEmail(
  poc: PocEmailData,
  pendingItems: string[],
  daysPending = 0
): string {
  const itemList = pendingItems.map(item => `<li style="margin-bottom:6px">❌ ${item}</li>`).join('')

  return `
  <div style="${baseStyle}">
    <div style="${headerStyle}">
      <div style="background:#C4631A;color:#fff;font-size:11px;font-weight:700;letter-spacing:1px;padding:4px 12px;border-radius:20px;display:inline-block;margin-bottom:10px">
        ⏰ REMINDER${daysPending > 0 ? ` — ${daysPending} dias pendente` : ''}
      </div>
      <div style="font-size:20px;font-weight:900;color:#F5E97A;font-family:Raleway,Arial,sans-serif">
        Pendências Pós-Homologação
      </div>
      <div style="font-size:12px;color:rgba(255,255,255,0.65);margin-top:4px">POC Manager MTM — Mercado Livre</div>
    </div>
    <div style="${bodyStyle}">
      <p style="font-size:14px;margin-top:0">Olá,</p>
      <p style="font-size:13px;color:#555;line-height:1.6">
        As seguintes pendências pós-homologação ainda precisam ser concluídas para finalizar a POC <b>"${poc.nome}"</b>:
      </p>
      <ul style="font-size:13px;color:#333;line-height:1.8;padding-left:20px">
        ${itemList}
      </ul>
      <p style="font-size:13px;color:#555;line-height:1.6;margin-top:12px">
        Por favor, acesse o POC Manager e conclua as pendências o quanto antes.
      </p>
      ${poc.link_apresentacao
        ? `<p style="font-size:12px;color:#717171">Referência: <a href="${poc.link_apresentacao}" style="color:#2C3E6B">${poc.link_apresentacao}</a></p>`
        : ''}
    </div>
    <div style="${footerStyle}">
      POC Manager MTM — Mercado Livre &bull; Reminders são enviados a cada 5 dias até a conclusão.
    </div>
  </div>`
}
