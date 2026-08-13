import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { getAuthUser, requireAuth } from '@/lib/auth'

type Params = { params: { id: string } }

async function canEdit(userId: string, isAdmin: boolean, pocId: string) {
  if (isAdmin) return true
  const { data } = await supabase
    .from('pocs')
    .select('created_by_id')
    .eq('id', pocId)
    .single()
  return data?.created_by_id === userId
}

// GET /api/pocs/[id]
export async function GET(req: NextRequest, { params }: Params) {
  const user = await getAuthUser(req)
  const authErr = requireAuth(user)
  if (authErr) return authErr

  const { data: poc, error } = await supabase
    .from('pocs')
    .select(`
      *,
      poc_approvers(*),
      poc_shares(*),
      poc_responsaveis(*),
      poc_checks(*),
      poc_history(*)
    `)
    .eq('id', params.id)
    .single()

  if (error || !poc) {
    return NextResponse.json({ ok: false, error: 'POC não encontrada.' }, { status: 404 })
  }

  // Verifica acesso
  const isMine = poc.created_by_id === user!.sub
  const isShared = poc.poc_shares?.some((s: { user_email: string }) => s.user_email === user!.email)
  if (!isMine && !isShared && !user!.is_admin) {
    return NextResponse.json({ ok: false, error: 'Acesso negado.' }, { status: 403 })
  }

  return NextResponse.json({ ok: true, data: poc })
}

const UpdateSchema = z.object({
  nome: z.string().min(1).optional(),
  descricao: z.string().min(1).optional(),
  kpi_chave: z.string().min(1).optional(),
  resultado: z.string().optional(),
  link_apresentacao: z.string().optional(),
  arquivo_apresentacao_url: z.string().optional(),
  arquivo_apresentacao_name: z.string().optional(),
  desenho_tecnico_url: z.string().optional(),
  desenho_tecnico_name: z.string().optional(),
})

// PUT /api/pocs/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  const user = await getAuthUser(req)
  const authErr = requireAuth(user)
  if (authErr) return authErr

  if (!(await canEdit(user!.sub, user!.is_admin, params.id))) {
    return NextResponse.json({ ok: false, error: 'Acesso negado.' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('pocs')
    .update(parsed.data)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  await supabase.from('poc_history').insert({
    poc_id: params.id,
    emoji: '✏️',
    event: 'Card editado',
    by_name: user!.name,
    by_email: user!.email,
  })

  return NextResponse.json({ ok: true, data })
}

// DELETE /api/pocs/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await getAuthUser(req)
  const authErr = requireAuth(user)
  if (authErr) return authErr

  if (!(await canEdit(user!.sub, user!.is_admin, params.id))) {
    return NextResponse.json({ ok: false, error: 'Acesso negado.' }, { status: 403 })
  }

  const { error } = await supabase.from('pocs').delete().eq('id', params.id)
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, data: null })
}
