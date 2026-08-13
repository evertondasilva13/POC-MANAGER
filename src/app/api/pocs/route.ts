import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { getAuthUser, requireAuth } from '@/lib/auth'

const CreateSchema = z.object({
  nome: z.string().min(1),
  descricao: z.string().min(1),
  kpi_chave: z.string().min(1),
  resultado: z.string().optional(),
  link_apresentacao: z.string().url().optional().or(z.literal('')),
  arquivo_apresentacao_url: z.string().optional(),
  arquivo_apresentacao_name: z.string().optional(),
  desenho_tecnico_url: z.string().optional(),
  desenho_tecnico_name: z.string().optional(),
  advance_to_ready: z.boolean().optional(), // true = já avança para 'ready'
})

// GET /api/pocs — lista POCs visíveis pelo usuário
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  const authErr = requireAuth(user)
  if (authErr) return authErr

  let query = supabase
    .from('pocs')
    .select(`
      *,
      poc_approvers(*),
      poc_shares(*),
      poc_checks(*),
      poc_history(*)
    `)
    .order('created_at', { ascending: false })

  if (!user!.is_admin) {
    // Retorna: minhas POCs + compartilhadas comigo
    const { data: sharedIds } = await supabase
      .from('poc_shares')
      .select('poc_id')
      .eq('user_email', user!.email)

    const sharedPocIds = (sharedIds || []).map((s) => s.poc_id)

    if (sharedPocIds.length > 0) {
      query = query.or(`created_by_id.eq.${user!.sub},id.in.(${sharedPocIds.join(',')})`)
    } else {
      query = query.eq('created_by_id', user!.sub)
    }
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, data })
}

// POST /api/pocs — cria novo POC
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  const authErr = requireAuth(user)
  if (authErr) return authErr

  const body = await req.json().catch(() => null)
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { advance_to_ready, ...fields } = parsed.data
  const now = new Date().toISOString()
  const status = advance_to_ready ? 'ready' : 'draft'

  const statusDates: Record<string, string> = { draft: now }
  if (advance_to_ready) statusDates.ready = now

  const { data: poc, error } = await supabase
    .from('pocs')
    .insert({
      ...fields,
      status,
      status_dates: statusDates,
      created_by_id: user!.sub,
      created_by_name: user!.name,
      created_by_email: user!.email,
    })
    .select()
    .single()

  if (error || !poc) {
    return NextResponse.json({ ok: false, error: error?.message }, { status: 500 })
  }

  // Inicializa os 4 checks em branco
  await supabase.from('poc_checks').insert([
    { poc_id: poc.id, key: 'checklist' },
    { poc_id: poc.id, key: 'playbook' },
    { poc_id: poc.id, key: 'catalogo' },
    { poc_id: poc.id, key: 'paginaMTM' },
  ])

  // Registra no histórico
  await supabase.from('poc_history').insert({
    poc_id: poc.id,
    emoji: '📝',
    event: 'Card criado',
    detail: `${user!.name} · ${user!.email}`,
    by_name: user!.name,
    by_email: user!.email,
  })

  return NextResponse.json({ ok: true, data: poc }, { status: 201 })
}
