import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { getAuthUser, requireAuth } from '@/lib/auth'

type Params = { params: { id: string } }

const ShareSchema = z.object({
  // Array de { user_name, user_email } — substitui completamente a lista
  shares: z.array(z.object({
    user_name: z.string().min(1),
    user_email: z.string().email(),
  }))
})

// PUT /api/pocs/[id]/share — substitui lista de compartilhamento
export async function PUT(req: NextRequest, { params }: Params) {
  const user = await getAuthUser(req)
  const authErr = requireAuth(user)
  if (authErr) return authErr

  const body = await req.json().catch(() => null)
  const parsed = ShareSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0].message }, { status: 400 })
  }

  // Deleta todos e recria
  await supabase.from('poc_shares').delete().eq('poc_id', params.id)

  if (parsed.data.shares.length > 0) {
    const rows = parsed.data.shares.map(s => ({ poc_id: params.id, ...s }))
    const { error } = await supabase.from('poc_shares').insert(rows)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  await supabase.from('poc_history').insert({
    poc_id: params.id,
    emoji: '🔗',
    event: 'Compartilhamento atualizado',
    detail: parsed.data.shares.map(s => `${s.user_name} (${s.user_email})`).join(', ') || 'Sem compartilhamentos',
    by_name: user!.name,
    by_email: user!.email,
  })

  return NextResponse.json({ ok: true, data: parsed.data.shares })
}
