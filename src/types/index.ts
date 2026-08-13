// ─── Auth ───────────────────────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  is_admin: boolean
  created_at: string
}

export interface JwtPayload {
  sub: string      // user id
  email: string
  name: string
  is_admin: boolean
  iat: number
  exp: number
}

// ─── POC Status ─────────────────────────────────────────────────────────────
export type PocStatus =
  | 'draft'
  | 'ready'
  | 'approval'
  | 'homologacao'
  | 'checks'
  | 'finished'

// ─── POC ────────────────────────────────────────────────────────────────────
export interface Poc {
  id: string
  nome: string
  descricao: string
  kpi_chave: string
  resultado: string | null
  link_apresentacao: string | null
  arquivo_apresentacao_url: string | null
  arquivo_apresentacao_name: string | null
  desenho_tecnico_url: string | null
  desenho_tecnico_name: string | null
  status: PocStatus
  created_by_id: string
  created_by_name: string
  created_by_email: string
  created_at: string
  updated_at: string
  aprovacao_enviada_em: string | null
  email_homologacao_enviado: boolean
  checks_email_sent_at: string | null
  status_dates: Partial<Record<PocStatus, string>>
  // relations (joined)
  approvers?: PocApprover[]
  shared_with?: PocShare[]
  responsaveis?: PocResponsavel[]
  checks?: PocCheck[]
  history?: PocHistory[]
  supervisor_mtm?: { nome: string; email: string } | null
  gerente_mtm?: { nome: string; email: string } | null
}

// ─── Approver ────────────────────────────────────────────────────────────────
export type ApproverType = 'op' | 'she'

export interface PocApprover {
  id: string
  poc_id: string
  type: ApproverType
  nome: string
  email: string
  aprovado: boolean
  reprovado: boolean
  motivo_reprovacao: string | null
  enviado_em: string | null
  aprovado_em: string | null
  reprovado_em: string | null
}

// ─── Share ────────────────────────────────────────────────────────────────────
export interface PocShare {
  id: string
  poc_id: string
  user_name: string
  user_email: string
}

// ─── Responsável Homologação ──────────────────────────────────────────────────
export type HomologRole = 'SHE' | 'Compras' | 'Operacao' | 'Lean' | 'MTM'

export interface PocResponsavel {
  id: string
  poc_id: string
  role: HomologRole
  nome: string | null
  email: string | null
}

// ─── Checks ──────────────────────────────────────────────────────────────────
export type CheckKey = 'checklist' | 'playbook' | 'catalogo' | 'paginaMTM'

export interface PocCheck {
  id: string
  poc_id: string
  key: CheckKey
  done: boolean
  link: string | null
  arquivo_url: string | null
  arquivo_name: string | null
}

// ─── History ─────────────────────────────────────────────────────────────────
export interface PocHistory {
  id: string
  poc_id: string
  emoji: string | null
  event: string
  detail: string | null
  by_name: string | null
  by_email: string | null
  created_at: string
}

// ─── API Responses ────────────────────────────────────────────────────────────
export interface ApiSuccess<T = unknown> {
  ok: true
  data: T
}

export interface ApiError {
  ok: false
  error: string
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError
