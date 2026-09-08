import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { getAuthUser, requireAuth } from '@/lib/auth'

type Params = { params: { id: string } }

const CheckSchema = z.object({
  key: z.enum(['checklist', 'playbook', 'catalogo', 'paginaMTMChecklist', 'paginaMTMPlaybook']),
  done: z.boolean(),
  link: z.string().optional(),
  arquivo_url: z.string().optional(),
  arquivo_name: z.string().optional(),
})

// PATCH /api/pocs/[id]/checks — atualiza um item do checklist
export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getAuthUser(req)
  const authErr = requireAuth(user)
  if (authErr) return authErr

  const body = await req.json().catch(() => null)
  const parsed = CheckSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { key, ...update } = parsed.data

  const { data, error } = await supabase
    .from('poc_checks')
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq('poc_id', params.id)
    .eq('key', key)
    .select()
    .single()

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  const labels: Record<string, string> = {
    checklist: 'Checklist',
    playbook: 'Playbook',
    catalogo: 'Catálogo',
    paginaMTMChecklist: 'Página MTM — Checklist',
    paginaMTMPlaybook: 'Página MTM — Playbook',
  }

  await supabase.from('poc_history').insert({
    poc_id: params.id,
    emoji: '☑️',
    event: `Check concluído: ${labels[key]}`,
    by_name: user!.name,
    by_email: user!.email,
  })

  return NextResponse.json({ ok: true, data })
}
