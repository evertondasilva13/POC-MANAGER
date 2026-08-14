'use client'
import './globals.css'
import { useEffect } from 'react'

export default function PocManagerApp() {
  useEffect(() => {
    const TOKEN_KEY = 'mtm_poc_token_v3'
    const USER_KEY_ST = 'mtm_poc_user_v3'

    // ── STATE
    let lang = 'pt'
    let currentUser: any = null
    let token: string | null = null
    let cards: any[] = []
    let currentView = 'dashboard'
    let editingCardId: string | null = null
    let deletingCardId: string | null = null
    let shareCardId: string | null = null
    let tempShareList: any[] = []
    let isAdmin = false
    let pendingEmailOnSend: (() => void) | null = null

    // ── i18n
    const T: any = {
      pt: {
        header_sub:'Gestão de POCs', nav_dashboard:'Dashboard',
        login_title:'Identificação', login_sub:'Para acessar o POC Manager',
        login_name:'Seu nome', login_email:'Seu e-mail corporativo', login_btn:'Entrar →',
        hero_eyebrow:'🧪 Gestão de Projetos', hero_title:'POCs <span>MTM</span>',
        hero_sub:'Gerencie o ciclo de vida de Provas de Conceito, da criação à homologação.',
        btn_new:'+ Nova POC', btn_close:'Fechar', btn_cancel:'Cancelar',
        btn_save:'Salvar', btn_delete:'Excluir', btn_edit:'Editar',
        share_title:'Compartilhar acesso', share_sub:'Adicione pessoas que podem ver e editar este card',
        share_name:'Nome', share_email:'E-mail', share_add:'+ Adicionar',
        confirm_title:'Confirmar exclusão', confirm_sub:'Essa ação não pode ser desfeita',
        confirm_msg:'Tem certeza que deseja excluir este card de POC?',
        email_preview_sub:'Assim chegará para o destinatário',
        stat_total:'Total', stat_approval:'Em Aprovação', stat_finished:'Finalizados',
        section_my:'Minhas POCs', section_shared:'Compartilhadas comigo',
        empty_title:'Nenhuma POC ainda', empty_msg:'Crie sua primeira Prova de Conceito para começar o processo de homologação.',
        status_draft:'Rascunho', status_ready:'Pronto para Aprovação',
        status_approval:'Em Aprovação', status_homologacao:'Homologação',
        status_checks:'Pós-Homologação', status_finished:'Finalizado',
        step_data:'Dados da POC', step_approval:'Aprovação', step_homolog:'Homologação',
        step_checks:'Pós-Homologação', step_done:'Finalizado',
        form_title_new:'Nova POC', form_title_edit:'Editar POC',
        f_nome:'Nome da POC', f_desc:'Descrição da POC', f_kpi:'KPI Chave',
        f_resultado:'Resultado', f_link:'Link da Apresentação',
        f_drawing:'Desenho Técnico', f_drawing_opt:'(opcional)',
        ph_nome:'Ex: POC Baker Modular — CD São Paulo',
        ph_desc:'Descreva o objetivo e contexto da POC...',
        ph_kpi:'Ex: Redução de 15% no tempo de ciclo',
        ph_resultado:'Descreva os resultados obtidos...',
        ph_link:'https://...',
        save_draft:'Salvar Rascunho', advance_approval:'Avançar para Aprovação →',
        save_ok:'Card salvo com sucesso!',
        missing_fields:'Preencha Resultado e Link da Apresentação antes de avançar.',
        section_approvers_op:'Aprovadores da Operação',
        section_approvers_she:'Aprovadores de SHE',
        approver_name:'Nome do aprovador', approver_email:'E-mail',
        btn_add_approver:'+ Adicionar aprovador',
        btn_send_approval:'Enviar para Aprovação',
        btn_preview_email:'Ver preview do e-mail',
        approval_info:'Após enviar, os e-mails são disparados automaticamente pelo sistema.',
        approval_status_title:'Status de Aprovação',
        mark_approved:'✓ Marcar como aprovado',
        btn_resend:'Reenviar reminder',
        all_approved:'✅ Todos aprovaram! Avance para a Homologação.',
        btn_next_homolog:'Avançar para Homologação →',
        section_responsaveis:'Responsáveis pela Homologação',
        roles_she:'SHE', roles_compras:'Compras', roles_op:'Operação',
        roles_lean:'Lean', roles_mtm:'MTM',
        btn_send_homolog:'Enviar E-mail de Homologação',
        homolog_info:'Será enviado um e-mail informativo com o link da apresentação e resultado da POC.',
        homolog_sent:'E-mail de homologação enviado! Avance para o checklist pós-homologação.',
        btn_next_checks:'Avançar para Pós-Homologação →',
        section_checks:'Checklist Pós-Homologação',
        check_checklist:'Criação de Checklist', check_checklist_desc:'Adicione o link do checklist criado',
        check_playbook:'Playbook', check_playbook_desc:'Adicione o link do playbook',
        check_catalogo:'Catálogo', check_catalogo_desc:'Adicione o link do catálogo',
        check_pagina:'Página MTM', check_pagina_desc:'Adicione o link da página MTM',
        check_ph_link:'https://',
        btn_check_save:'Salvar',
        section_supervisor:'Supervisor e Gerente MTM',
        sup_name:'Nome', sup_email:'E-mail',
        sup_label:'Supervisor MTM', ger_label:'Gerente MTM',
        btn_send_reminder:'Enviar reminder pós-homologação',
        reminder_info:'Reminders serão enviados a cada 5 dias até todos os checks serem concluídos.',
        all_checks_done:'✅ Todos os checks concluídos! Finalize a POC.',
        btn_finalize:'Finalizar POC ✓',
        finalized_title:'POC Finalizada!', finalized_msg:'Parabéns! Essa POC foi homologada com sucesso.',
        days_ago:'há {n} dias', days_pending:'{n} dias pendente',
        email_subject_approval:'[POC MTM] Solicitação de Aprovação — {poc}',
        email_subject_homolog:'[POC MTM] Equipamento Validado — {poc}',
        email_subject_checks_reminder:'[REMINDER] Pendências Pós-Homologação — {poc} ({days} dias)',
      },
      es: {
        header_sub:'Gestión de POCs', nav_dashboard:'Dashboard',
        login_title:'Identificación', login_sub:'Para acceder al POC Manager',
        login_name:'Tu nombre', login_email:'Tu e-mail corporativo', login_btn:'Entrar →',
        hero_eyebrow:'🧪 Gestión de Proyectos', hero_title:'POCs <span>MTM</span>',
        hero_sub:'Gestiona el ciclo de vida de las Pruebas de Concepto.',
        btn_new:'+ Nueva POC', btn_close:'Cerrar', btn_cancel:'Cancelar',
        btn_save:'Guardar', btn_delete:'Eliminar', btn_edit:'Editar',
        share_title:'Compartir acceso', share_sub:'Agrega personas que pueden ver y editar este card',
        share_name:'Nombre', share_email:'E-mail', share_add:'+ Agregar',
        confirm_title:'Confirmar eliminación', confirm_sub:'Esta acción no puede deshacerse',
        confirm_msg:'¿Estás seguro de que deseas eliminar este card de POC?',
        email_preview_sub:'Así llegará al destinatario',
        stat_total:'Total', stat_approval:'En Aprobación', stat_finished:'Finalizados',
        section_my:'Mis POCs', section_shared:'Compartidas conmigo',
        empty_title:'Ninguna POC aún', empty_msg:'Crea tu primera Prueba de Concepto para iniciar el proceso de homologación.',
        status_draft:'Borrador', status_ready:'Listo para Aprobación',
        status_approval:'En Aprobación', status_homologacao:'Homologación',
        status_checks:'Post-Homologación', status_finished:'Finalizado',
        step_data:'Datos del POC', step_approval:'Aprobación', step_homolog:'Homologación',
        step_checks:'Post-Homologación', step_done:'Finalizado',
        form_title_new:'Nuevo POC', form_title_edit:'Editar POC',
        f_nome:'Nombre del POC', f_desc:'Descripción del POC', f_kpi:'KPI Clave',
        f_resultado:'Resultado', f_link:'Link de la Presentación',
        f_drawing:'Diseño Técnico', f_drawing_opt:'(opcional)',
        ph_nome:'Ej: POC Baker Modular — CD São Paulo',
        ph_desc:'Describe el objetivo y contexto del POC...',
        ph_kpi:'Ej: Reducción del 15% en el tiempo de ciclo',
        ph_resultado:'Describe los resultados obtenidos...',
        ph_link:'https://...',
        save_draft:'Guardar Borrador', advance_approval:'Avanzar a Aprobación →',
        save_ok:'¡Card guardado con éxito!',
        missing_fields:'Completa Resultado y Link de Presentación antes de avanzar.',
        section_approvers_op:'Aprobadores de Operación',
        section_approvers_she:'Aprobadores de SHE',
        approver_name:'Nombre del aprobador', approver_email:'E-mail',
        btn_add_approver:'+ Agregar aprobador',
        btn_send_approval:'Enviar para Aprobación',
        btn_preview_email:'Ver preview del e-mail',
        approval_info:'Al enviar, los e-mails son disparados automáticamente por el sistema.',
        approval_status_title:'Estado de Aprobación',
        mark_approved:'✓ Marcar como aprobado',
        btn_resend:'Reenviar reminder',
        all_approved:'✅ ¡Todos aprobaron! Avanza a la Homologación.',
        btn_next_homolog:'Avanzar a Homologación →',
        section_responsaveis:'Responsables de Homologación',
        roles_she:'SHE', roles_compras:'Compras', roles_op:'Operación',
        roles_lean:'Lean', roles_mtm:'MTM',
        btn_send_homolog:'Enviar E-mail de Homologación',
        homolog_info:'Se enviará un e-mail informativo con el link de presentación y resultado del POC.',
        homolog_sent:'¡E-mail de homologación enviado! Avanza al checklist post-homologación.',
        btn_next_checks:'Avanzar a Post-Homologación →',
        section_checks:'Checklist Post-Homologación',
        check_checklist:'Creación de Checklist', check_checklist_desc:'Agrega el link del checklist creado',
        check_playbook:'Playbook', check_playbook_desc:'Agrega el link del playbook',
        check_catalogo:'Catálogo', check_catalogo_desc:'Agrega el link del catálogo',
        check_pagina:'Página MTM', check_pagina_desc:'Agrega el link de la página MTM',
        check_ph_link:'https://',
        btn_check_save:'Guardar',
        section_supervisor:'Supervisor y Gerente MTM',
        sup_name:'Nombre', sup_email:'E-mail',
        sup_label:'Supervisor MTM', ger_label:'Gerente MTM',
        btn_send_reminder:'Enviar reminder post-homologación',
        reminder_info:'Los reminders se enviarán cada 5 días hasta completar todos los checks.',
        all_checks_done:'✅ ¡Todos los checks completados! Finaliza el POC.',
        btn_finalize:'Finalizar POC ✓',
        finalized_title:'¡POC Finalizado!', finalized_msg:'¡Felicitaciones! Este POC fue homologado con éxito.',
        days_ago:'hace {n} días', days_pending:'{n} días pendiente',
        email_subject_approval:'[POC MTM] Solicitud de Aprobación — {poc}',
        email_subject_homolog:'[POC MTM] Equipo Validado — {poc}',
        email_subject_checks_reminder:'[REMINDER] Pendencias Post-Homologación — {poc} ({days} días)',
      }
    }

    // ── UTILS
    function t(key: string, vars?: any) {
      let s = (T[lang] || T.pt)[key] || key
      if (vars) Object.keys(vars).forEach(k => { s = s.replace('{' + k + '}', vars[k]) })
      return s
    }
    function esc(s: any) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }
    function daysSince(iso: string) { if (!iso) return 0; return Math.floor((Date.now() - new Date(iso).getTime()) / (1000*60*60*24)) }
    function formatDate(iso: string) { if (!iso) return '—'; return new Date(iso).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'es-MX') }
    function formatDateTime(iso: string) {
      if (!iso) return '—'
      const d = new Date(iso)
      return d.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'es-MX', {day:'2-digit',month:'2-digit',year:'numeric'}) + ' às ' + d.toLocaleTimeString(lang === 'pt' ? 'pt-BR' : 'es-MX', {hour:'2-digit',minute:'2-digit'})
    }
    function slaDays(from: string, to?: string) {
      if (!from) return null
      return Math.floor(((to ? new Date(to) : new Date()).getTime() - new Date(from).getTime()) / (1000*60*60*24))
    }
    function getCard(id: string) { return cards.find((c: any) => c.id === id) }
    function myCards() { return cards.filter((c: any) => c.createdById === currentUser?.id) }
    function sharedCards() { return cards.filter((c: any) => c.createdById !== currentUser?.id && (c.sharedWith||[]).some((s: any) => s.email === currentUser?.email)) }
    function allApproved(card: any) {
      const all = [...(card.aprovadoresOperacao||[]), ...(card.aprovadoresSHE||[])]
      if (all.length === 0) return false
      return all.every((a: any) => a.aprovado)
    }
    function allChecksDone(card: any) {
      const ch = card.checks || {}
      return ['checklist','playbook','catalogo','paginaMTM'].every(k => ch[k] && ch[k].done)
    }
    function statusLabel(s: string) { return t('status_' + s) || s }
    function statusDot(s: string) {
      const m: any = {draft:'⬜',ready:'🔵',approval:'🟡',homologacao:'🟣',checks:'🩵',finished:'✅'}
      return m[s] || '⬜'
    }
    function toast(msg: string, type = '') {
      const tc = document.getElementById('toast-container')
      if (!tc) return
      const el = document.createElement('div')
      el.className = 'toast' + (type ? ' ' + type : '')
      el.innerHTML = (type === 'success' ? '✅ ' : type === 'error' ? '❌ ' : '') + msg
      tc.appendChild(el)
      setTimeout(() => el.remove(), 3500)
    }
    function openModal(id: string) { document.getElementById(id)?.classList.add('active') }
    function closeModal(id: string) { document.getElementById(id)?.classList.remove('active') }
    function showLoading() {
      let el = document.getElementById('loading-overlay')
      if (!el) { el = document.createElement('div'); el.id = 'loading-overlay'; el.className = 'loading-overlay'; el.innerHTML = '<div class="loading-spinner"></div>'; document.body.appendChild(el) }
      el.style.display = 'flex'
    }
    function hideLoading() { const el = document.getElementById('loading-overlay'); if (el) el.style.display = 'none' }

    // ── API
    async function api(method: string, path: string, body?: any) {
      const opts: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } as any
      }
      if (body) opts.body = JSON.stringify(body)
      try {
        const r = await fetch(path, opts)
        return r.json()
      } catch { return { ok: false, error: 'Erro de conexão' } }
    }

    // ── DATA NORMALIZER
    function norm(c: any) {
      const opsApprovers = (c.poc_approvers || []).filter((a: any) => a.type === 'op').map((a: any) => ({
        id: a.id, nome: a.nome, email: a.email,
        aprovado: a.aprovado, reprovado: a.reprovado,
        motivoReprovacao: a.motivo_reprovacao,
        enviadoEm: a.enviado_em, aprovadoEm: a.aprovado_em,
      }))
      const sheApprovers = (c.poc_approvers || []).filter((a: any) => a.type === 'she').map((a: any) => ({
        id: a.id, nome: a.nome, email: a.email,
        aprovado: a.aprovado, reprovado: a.reprovado,
        motivoReprovacao: a.motivo_reprovacao,
        enviadoEm: a.enviado_em, aprovadoEm: a.aprovado_em,
      }))
      const sharedWith = (c.poc_shares || []).map((s: any) => ({ name: s.user_name, email: s.user_email }))
      const respHomolog: any = {}
      ;(c.poc_responsaveis || []).forEach((r: any) => { respHomolog[r.role] = { nome: r.nome || '', email: r.email || '' } })
      const checksMap: any = {}
      ;(c.poc_checks || []).forEach((ch: any) => {
        checksMap[ch.key] = { done: ch.done, link: ch.link, arquivo: ch.arquivo_url, arquivoName: ch.arquivo_name }
      })
      const history = (c.poc_history || [])
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map((h: any) => ({ ts: h.created_at, by: `${h.by_name} (${h.by_email})`, emoji: h.emoji, event: h.event, detail: h.detail }))
      return {
        id: c.id, nome: c.nome, descricao: c.descricao,
        kpiChave: c.kpi_chave, resultado: c.resultado,
        linkApresentacao: c.link_apresentacao,
        arquivoApresentacaoName: c.arquivo_apresentacao_name,
        desenhoTecnicoName: c.desenho_tecnico_name,
        status: c.status,
        createdAt: c.created_at, updatedAt: c.updated_at,
        createdById: c.created_by_id,
        createdBy: { name: c.created_by_name, email: c.created_by_email },
        sharedWith, aprovadoresOperacao: opsApprovers, aprovadoresSHE: sheApprovers,
        responsaveisHomologacao: respHomolog,
        emailHomologacaoEnviado: c.email_homologacao_enviado,
        checks: {
          checklist: checksMap.checklist || { done: false, link: '' },
          playbook: checksMap.playbook || { done: false, link: '' },
          catalogo: checksMap.catalogo || { done: false, link: '' },
          paginaMTM: checksMap.paginaMTM || { done: false, link: '' },
        },
        supervisorMTM: { nome: c.supervisor_mtm_nome || '', email: c.supervisor_mtm_email || '' },
        gerenteMTM: { nome: c.gerente_mtm_nome || '', email: c.gerente_mtm_email || '' },
        checksEmailSentAt: c.checks_email_sent_at,
        history, statusDates: c.status_dates || {},
        aprovacaoEnviadaEm: c.aprovacao_enviada_em,
      }
    }

    // ── LANGUAGE
    const INICIO_URLS: any = { pt: 'https://mtmtransportes-paginainicialpt.vercel.app/', es: 'https://mtmtransportes-paginainiciales.vercel.app/' }
    function detectLang() { return localStorage.getItem('mtm_poc_lang') || 'pt' }
    function updateInicioBtn() {
      const btn = document.getElementById('btn-inicio') as HTMLAnchorElement
      if (!btn) return
      btn.href = INICIO_URLS[lang] || INICIO_URLS.pt
      btn.textContent = lang === 'pt' ? '🏠 Início' : '🏠 Inicio'
    }
    function toggleLang() {
      lang = lang === 'pt' ? 'es' : 'pt'
      localStorage.setItem('mtm_poc_lang', lang)
      const btn = document.getElementById('lang-btn')
      if (btn) btn.textContent = lang === 'pt' ? '🇧🇷 PT' : '🇪🇸 ES'
      document.documentElement.lang = lang
      updateInicioBtn()
      updateAdminChip()
      applyI18nStatic()
      renderCurrent()
    }
    function applyI18nStatic() {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = el.getAttribute('data-i18n')
        if (k && T[lang]?.[k]) el.innerHTML = T[lang][k]
      })
      const sub = document.getElementById('header-sub')
      if (sub) sub.textContent = t('header_sub')
    }

    // ── ADMIN
    function updateAdminChip() {
      const chip = document.getElementById('admin-chip')
      if (!chip) return
      if (isAdmin) { chip.classList.add('active'); chip.innerHTML = '🔑 Admin ✓' }
      else { chip.classList.remove('active'); chip.innerHTML = '🔑 Admin' }
    }
    function toggleAdmin() {
      isAdmin = !isAdmin
      updateAdminChip()
      toast(isAdmin ? '🔑 Modo administrador ativado!' : 'Modo admin desativado.', isAdmin ? 'success' : '')
      renderCurrent()
    }
    function updateUserUI() {
      const chip = document.getElementById('user-chip')
      const nameEl = document.getElementById('user-name-display')
      const dashBtn = document.getElementById('btn-nav-dashboard')
      const adminChip = document.getElementById('admin-chip')
      if (chip) chip.style.display = 'flex'
      if (nameEl) nameEl.textContent = currentUser?.name || ''
      if (dashBtn) dashBtn.style.display = 'inline-flex'
      if (adminChip) adminChip.style.display = currentUser?.is_admin ? 'flex' : 'none'
    }

    // ── AUTH
    async function doLogin() {
      const nameEl = document.getElementById('login-name') as HTMLInputElement
      const emailEl = document.getElementById('login-email') as HTMLInputElement
      const name = nameEl?.value.trim() || ''
      const email = emailEl?.value.trim() || ''
      if (!name || !email) { toast('Preencha nome e e-mail.', 'error'); return }
      if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) { toast('E-mail inválido.', 'error'); return }
      showLoading()
      const res = await api('POST', '/api/auth', { name, email })
      hideLoading()
      if (!res.ok) { toast(res.error || 'Erro ao fazer login.', 'error'); return }
      token = res.data.token
      currentUser = res.data.user
      localStorage.setItem(TOKEN_KEY, token!)
      localStorage.setItem(USER_KEY_ST, JSON.stringify(currentUser))
      closeModal('modal-login')
      isAdmin = currentUser.is_admin
      updateUserUI()
      await navigate('dashboard')
    }

    // ── ROUTER
    async function navigate(view: string, cardId?: string) {
      currentView = view
      editingCardId = cardId || null
      // Lock page scroll only on dashboard (kanban), free it on all other views
      if (view === 'dashboard') {
        document.body.classList.add('dashboard-open')
      } else {
        document.body.classList.remove('dashboard-open')
        window.scrollTo(0, 0)
      }
      showLoading()
      if (view === 'dashboard') {
        await loadCardsFromAPI()
      } else if (cardId) {
        await loadCardFromAPI(cardId)
      }
      hideLoading()
      renderCurrent()
    }

    async function loadCardsFromAPI() {
      const res = await api('GET', '/api/pocs')
      if (res.ok) cards = (res.data || []).map(norm)
    }

    async function loadCardFromAPI(cardId: string) {
      const res = await api('GET', `/api/pocs/${cardId}`)
      if (res.ok) {
        const normalized = norm(res.data)
        const idx = cards.findIndex((c: any) => c.id === cardId)
        if (idx >= 0) cards[idx] = normalized
        else cards.push(normalized)
      }
    }

    function renderCurrent() {
      const app = document.getElementById('app')
      if (!app) return
      applyI18nStatic()
      // Sync body class with current view
      if (currentView === 'dashboard') {
        document.body.classList.add('dashboard-open')
      } else {
        document.body.classList.remove('dashboard-open')
      }
      if (currentView === 'dashboard') app.innerHTML = renderDashboard()
      else if (currentView === 'create') app.innerHTML = renderCreateEdit(null)
      else if (currentView === 'edit') app.innerHTML = renderCreateEdit(editingCardId)
      else if (currentView === 'detail') app.innerHTML = renderDetail(editingCardId!)
      else if (currentView === 'approval') app.innerHTML = renderApproval(editingCardId!)
      else if (currentView === 'homologacao') app.innerHTML = renderHomologacao(editingCardId!)
      else if (currentView === 'checks') app.innerHTML = renderChecks(editingCardId!)
    }

    // ── STEPPER
    function stepperHTML(currentStatus: string) {
      const steps = [
        {key:'data',label:t('step_data')}, {key:'approval',label:t('step_approval')},
        {key:'homolog',label:t('step_homolog')}, {key:'checks',label:t('step_checks')},
        {key:'done',label:t('step_done')},
      ]
      const statusMap: any = {draft:0,ready:0,approval:1,homologacao:2,checks:3,finished:4}
      const activeIdx = statusMap[currentStatus] || 0
      let html = '<div class="stepper">'
      steps.forEach((s, i) => {
        const state = i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'pending'
        if (i > 0) html += `<div class="step-connector ${i <= activeIdx ? 'done' : ''}"></div>`
        html += `<div class="step"><div class="step-dot ${state}">${state === 'done' ? '✓' : i + 1}</div><span class="step-label ${state}">${s.label}</span></div>`
      })
      return html + '</div>'
    }

    // ── DASHBOARD
    function renderDashboard() {
      const mine = myCards()
      const shared = sharedCards()
      const adminExtra = isAdmin ? cards.filter((c: any) => c.createdById !== currentUser?.id && !(c.sharedWith||[]).some((s: any) => s.email === currentUser?.email)) : []
      const allVisible = [...mine, ...shared, ...(isAdmin ? adminExtra : [])]
      const total = allVisible.length
      const inApproval = allVisible.filter((c: any) => c.status === 'approval').length
      const finished = allVisible.filter((c: any) => c.status === 'finished').length
      const COLS = [
        {key:'draft', label:lang==='pt'?'Rascunho':'Borrador', emoji:'⬜'},
        {key:'ready', label:lang==='pt'?'Pronto p/ Aprovação':'Listo p/ Aprobación', emoji:'🔵'},
        {key:'approval', label:lang==='pt'?'Em Aprovação':'En Aprobación', emoji:'🟡'},
        {key:'homologacao', label:lang==='pt'?'Homologação':'Homologación', emoji:'🟣'},
        {key:'checks', label:lang==='pt'?'Pós-Homologação':'Post-Homologación', emoji:'🩵'},
        {key:'finished', label:lang==='pt'?'Finalizado':'Finalizado', emoji:'✅'},
      ]
      let html = `
      <div class="hero hero-sticky"><div class="hero-inner">
        <div>
          <div class="hero-eyebrow">${t('hero_eyebrow')}</div>
          <h1>${t('hero_title')}</h1>
          <p class="hero-sub">${t('hero_sub')}</p>
        </div>
        <div class="hero-stats">
          <div class="stat-chip"><div class="stat-num">${total}</div><div class="stat-label">${t('stat_total')}</div></div>
          <div class="stat-chip"><div class="stat-num">${inApproval}</div><div class="stat-label">${t('stat_approval')}</div></div>
          <div class="stat-chip"><div class="stat-num">${finished}</div><div class="stat-label">${t('stat_finished')}</div></div>
        </div>
      </div></div>
      <div class="kanban-toolbar">
        <div class="section-title" style="margin-bottom:0;flex:1">${lang==='pt'?'Quadro de POCs':'Tablero de POCs'}</div>
        <button class="btn btn-primary" onclick="window._poc.navigate('create')">${t('btn_new')}</button>
      </div>
      <div class="kanban-wrapper">`
      if (allVisible.length === 0) {
        html += `<div class="empty-state"><div class="empty-icon">🧪</div><h3>${t('empty_title')}</h3><p>${t('empty_msg')}</p><button class="btn btn-primary" onclick="window._poc.navigate('create')">${t('btn_new')}</button></div>`
      } else {
        html += `<div class="kanban-board">`
        COLS.forEach(col => {
          const colCards = allVisible.filter((c: any) => (c.status || 'draft') === col.key)
          html += `<div class="kanban-col ${col.key}"><div class="kanban-col-header"><span class="col-title">${col.emoji} ${col.label}</span><span class="col-count">${colCards.length}</span></div><div class="kanban-cards">`
          if (colCards.length === 0) html += `<div class="kanban-empty">${lang==='pt'?'Nenhuma POC':'Ningún POC'}</div>`
          else colCards.forEach((c: any) => { html += kanbanCardHTML(c) })
          html += `</div></div>`
        })
        html += `</div>`
      }
      return html + `</div>`
    }

    function kanbanCardHTML(card: any) {
      const canEdit = card.createdById === currentUser?.id || isAdmin
      const days = daysSince(card.createdAt)
      const daysLabel = days === 0 ? (lang==='pt'?'hoje':'hoy') : t('days_ago', {n: days})
      return `<div class="kanban-card" onclick="window._poc.navigate('detail','${card.id}')">
        <div class="kanban-card-name">${esc(card.nome)}</div>
        <div class="kanban-card-kpi">🎯 ${esc(card.kpiChave)}</div>
        <div style="font-size:10px;color:var(--gray);margin-bottom:8px">📅 ${lang==='pt'?'Criado':'Creado'}: ${formatDate(card.createdAt)}</div>
        <div class="kanban-card-footer">
          <span class="kanban-card-date">${daysLabel}</span>
          <div class="kanban-card-actions" onclick="event.stopPropagation()">
            ${canEdit ? `<button class="icon-btn" title="${t('share_title')}" onclick="window._poc.openShareModal('${card.id}')">🔗</button>` : ''}
            ${canEdit ? `<button class="icon-btn" title="${t('btn_edit')}" onclick="window._poc.navigate('edit','${card.id}')">✏️</button>` : ''}
            ${canEdit ? `<button class="icon-btn danger" title="${t('btn_delete')}" onclick="window._poc.openDeleteModal('${card.id}')">🗑️</button>` : ''}
          </div>
        </div>
      </div>`
    }

    // ── CREATE / EDIT FORM
    function renderCreateEdit(cardId: string | null) {
      const card = cardId ? getCard(cardId) : null
      const val = (f: string) => card ? esc((card as any)[f] || '') : ''
      return `
      <div class="container">
        <div class="detail-back" onclick="window._poc.navigate('${cardId ? 'detail' : 'dashboard'}','${cardId || ''}')">&larr; ${cardId ? t('step_data') : t('nav_dashboard')}</div>
        ${card ? stepperHTML(card.status) : ''}
        <div class="panel">
          <div class="panel-header"><h3>📝 ${cardId ? t('form_title_edit') : t('form_title_new')}</h3></div>
          <div class="panel-body">
            <div style="display:flex;flex-direction:column;gap:1.1rem">
              <div class="form-group"><label>${t('f_nome')} <span class="req">*</span></label><input type="text" id="f-nome" value="${val('nome')}" placeholder="${t('ph_nome')}"></div>
              <div class="form-group"><label>${t('f_desc')} <span class="req">*</span></label><textarea id="f-desc" placeholder="${t('ph_desc')}">${card ? esc(card.descricao || '') : ''}</textarea></div>
              <div class="form-group"><label>${t('f_kpi')} <span class="req">*</span></label><input type="text" id="f-kpi" value="${val('kpiChave')}" placeholder="${t('ph_kpi')}"></div>
              <hr style="border:none;border-top:1px solid var(--border)">
              <div class="form-group"><label>${t('f_resultado')}</label><textarea id="f-resultado" placeholder="${t('ph_resultado')}">${card ? esc(card.resultado || '') : ''}</textarea></div>
              <div class="form-group"><label>${t('f_link')}</label><input type="url" id="f-link" value="${val('linkApresentacao')}" placeholder="${t('ph_link')}"></div>
              <div class="form-group"><label>${t('f_drawing')} <span style="color:var(--gray);font-weight:400">${t('f_drawing_opt')}</span></label><input type="url" id="f-draw-link" value="${val('desenhoTecnicoName')}" placeholder="https:// (link para o desenho)"></div>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:1.5rem;flex-wrap:wrap">
              <button class="btn btn-secondary" onclick="window._poc.navigate('${cardId ? 'detail' : 'dashboard'}','${cardId || ''}')">${t('btn_cancel')}</button>
              <button class="btn btn-primary" onclick="window._poc.saveCard('${cardId || ''}')">${t('save_draft')}</button>
              <button class="btn btn-green" onclick="window._poc.advanceToApproval('${cardId || ''}')">${t('advance_approval')}</button>
            </div>
          </div>
        </div>
      </div>`
    }

    function gatherFormData() {
      const nome = (document.getElementById('f-nome') as HTMLInputElement)?.value.trim() || ''
      const descricao = (document.getElementById('f-desc') as HTMLTextAreaElement)?.value.trim() || ''
      const kpiChave = (document.getElementById('f-kpi') as HTMLInputElement)?.value.trim() || ''
      const resultado = (document.getElementById('f-resultado') as HTMLTextAreaElement)?.value.trim() || ''
      const linkApresentacao = (document.getElementById('f-link') as HTMLInputElement)?.value.trim() || ''
      const desenhoTecnicoName = (document.getElementById('f-draw-link') as HTMLInputElement)?.value.trim() || ''
      return { nome, descricao, kpi_chave: kpiChave, resultado, link_apresentacao: linkApresentacao, desenho_tecnico_name: desenhoTecnicoName }
    }

    async function saveCard(cardId: string) {
      const d = gatherFormData()
      if (!d.nome || !d.descricao || !d.kpi_chave) { toast(lang==='pt'?'Preencha Nome, Descrição e KPI.':'Completa Nombre, Descripción y KPI.', 'error'); return }
      showLoading()
      let res
      if (cardId) {
        res = await api('PUT', `/api/pocs/${cardId}`, d)
      } else {
        res = await api('POST', '/api/pocs', d)
      }
      hideLoading()
      if (!res.ok) { toast(res.error || 'Erro ao salvar.', 'error'); return }
      const savedId = res.data?.id || cardId
      toast(t('save_ok'), 'success')
      await navigate('edit', savedId)
    }

    async function advanceToApproval(cardId: string) {
      const d = gatherFormData()
      if (!d.nome || !d.descricao || !d.kpi_chave) { toast(lang==='pt'?'Preencha Nome, Descrição e KPI.':'Completa Nombre, Descripción y KPI.', 'error'); return }
      if (!d.resultado || !d.link_apresentacao) { toast(t('missing_fields'), 'error'); return }
      showLoading()
      let savedId = cardId
      if (cardId) {
        const res = await api('PUT', `/api/pocs/${cardId}`, d)
        if (!res.ok) { hideLoading(); toast(res.error || 'Erro ao salvar.', 'error'); return }
      } else {
        const res = await api('POST', '/api/pocs', d)
        if (!res.ok) { hideLoading(); toast(res.error || 'Erro ao criar.', 'error'); return }
        savedId = res.data.id
        editingCardId = savedId  // evita duplicatas se o usuário clicar novamente
      }
      const advRes = await api('POST', `/api/pocs/${savedId}/advance`, { to: 'ready' })
      hideLoading()
      if (!advRes.ok) {
        toast(advRes.error || 'Erro ao avançar status.', 'error')
        await navigate('edit', savedId)  // vai para edição (não cria novo card se clicar de novo)
        return
      }
      await navigate('approval', savedId)
    }

    // ── DETAIL VIEW
    function renderDetail(cardId: string) {
      const card = getCard(cardId)
      if (!card) return '<div class="container"><p>POC não encontrada.</p></div>'
      const canEdit = card.createdById === currentUser?.id || isAdmin
      let nextBtn = ''
      if (canEdit) {
        if (card.status === 'draft' || card.status === 'ready') nextBtn = `<button class="btn btn-primary" onclick="window._poc.navigate('edit','${card.id}')">${t('btn_edit')}</button> <button class="btn btn-green" onclick="window._poc.navigate('approval','${card.id}')">${t('advance_approval')}</button>`
        else if (card.status === 'approval') nextBtn = `<button class="btn btn-primary" onclick="window._poc.navigate('approval','${card.id}')">${lang==='pt'?'Gerenciar Aprovação':'Gestionar Aprobación'} →</button>`
        else if (card.status === 'homologacao') nextBtn = `<button class="btn btn-primary" onclick="window._poc.navigate('homologacao','${card.id}')">${lang==='pt'?'Gerenciar Homologação':'Gestionar Homologación'} →</button>`
        else if (card.status === 'checks') nextBtn = `<button class="btn btn-primary" onclick="window._poc.navigate('checks','${card.id}')">${lang==='pt'?'Gerenciar Pós-Homologação':'Gestionar Post-Homologación'} →</button>`
      }
      return `
      <div class="container">
        <div class="detail-back" onclick="window._poc.navigate('dashboard')">&larr; ${t('nav_dashboard')}</div>
        ${stepperHTML(card.status)}
        <div class="detail-header">
          <div class="detail-header-top">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
              <div class="poc-status-badge ${card.status}" style="margin-bottom:6px">${statusDot(card.status)} ${statusLabel(card.status)}</div>
              <div style="display:flex;gap:8px">${nextBtn}</div>
            </div>
            <h2>${esc(card.nome)}</h2>
            <div class="detail-kpi">🎯 ${esc(card.kpiChave)}</div>
          </div>
          <div class="detail-header-body">
            <div class="detail-field"><label>${t('f_desc')}</label><p>${esc(card.descricao || '')}</p></div>
            <div class="detail-field"><label>${t('f_resultado')}</label>${card.resultado ? `<p>${esc(card.resultado)}</p>` : `<p class="no-data">—</p>`}</div>
            <div class="detail-field"><label>${t('f_link')}</label>${card.linkApresentacao ? `<a href="${esc(card.linkApresentacao)}" target="_blank">🔗 ${esc(card.linkApresentacao)}</a>` : `<p class="no-data">—</p>`}</div>
            <div class="detail-field"><label>${t('f_drawing')}</label>${card.desenhoTecnicoName ? `<p>📐 ${esc(card.desenhoTecnicoName)}</p>` : `<p class="no-data">—</p>`}</div>
            <div class="detail-field"><label>${lang==='pt'?'Criado por':'Creado por'}</label><p>${esc(card.createdBy?.name)} · ${esc(card.createdBy?.email)}</p></div>
            <div class="detail-field"><label>${lang==='pt'?'Atualizado':'Actualizado'}</label><p>${formatDate(card.updatedAt)}</p></div>
          </div>
        </div>
        ${card.status === 'finished' ? `<div class="panel"><div class="panel-body" style="text-align:center;padding:2rem"><div style="font-size:48px;margin-bottom:10px">🏆</div><h3 style="font-family:Raleway,sans-serif;font-size:20px;font-weight:900;color:var(--green-dark);margin-bottom:8px">${t('finalized_title')}</h3><p style="font-size:13px;color:var(--gray)">${t('finalized_msg')}</p></div></div>` : ''}
        ${renderSLAPanel(card)}
        ${renderHistoryPanel(card)}
      </div>`
    }

    function renderSLAPanel(card: any) {
      const sd = card.statusDates || {}
      const STAGES = [
        {key:'draft', label:lang==='pt'?'Criado':'Creado', emoji:'📝'},
        {key:'ready', label:lang==='pt'?'Pronto p/ Aprovação':'Listo p/ Aprobación', emoji:'✅'},
        {key:'approval', label:lang==='pt'?'Em Aprovação':'En Aprobación', emoji:'📧'},
        {key:'homologacao', label:lang==='pt'?'Homologação':'Homologación', emoji:'🟣'},
        {key:'checks', label:lang==='pt'?'Pós-Homologação':'Post-Homologación', emoji:'🩵'},
        {key:'finished', label:lang==='pt'?'Finalizado':'Finalizado', emoji:'🏆'},
      ]
      const getDate = (key: string) => key === 'draft' ? (sd.draft || card.createdAt) : (sd[key] || null)
      let rows = ''
      STAGES.forEach((s, i) => {
        const dt = getDate(s.key)
        if (!dt) return
        const next = STAGES[i + 1]
        const nextDt = next ? getDate(next.key) : null
        const sla = nextDt ? slaDays(dt, nextDt) : slaDays(dt)
        const isActive = card.status === s.key
        rows += `<div style="display:flex;align-items:center;gap:10px;padding:.6rem 0;border-bottom:1px solid var(--border)">
          <span style="font-size:16px;width:24px;text-align:center">${s.emoji}</span>
          <div style="flex:1"><div style="font-size:12px;font-weight:600;color:${isActive?'var(--blue-deeper)':'var(--text)'}">${s.label}</div><div style="font-size:11px;color:var(--gray)">${formatDateTime(dt)}</div></div>
          ${sla !== null ? `<div style="font-size:11px;font-weight:700;color:${nextDt?'var(--gray)':'var(--orange)'};background:${nextDt?'var(--gray-light)':'var(--orange-light)'};padding:2px 8px;border-radius:20px">${sla}d${isActive&&!nextDt?' ▶':''}</div>` : ''}
        </div>`
      })
      if (!rows) return ''
      return `<div class="panel" style="margin-top:1rem"><div class="panel-header"><h3>⏱️ SLA por Etapa</h3></div><div class="panel-body">${rows}</div></div>`
    }

    function renderHistoryPanel(card: any) {
      const hist = card.history || []
      if (hist.length === 0) return ''
      let items = ''
      hist.forEach((h: any) => {
        items += `<div class="timeline-item"><div class="timeline-dot">${h.emoji || '•'}</div><div class="timeline-content"><div class="timeline-event">${esc(h.event)}</div>${h.detail ? `<div class="timeline-detail">${esc(h.detail)}</div>` : ''}<div class="timeline-time">🕐 ${formatDateTime(h.ts)} · ${esc(h.by)}</div></div></div>`
      })
      return `<div class="panel" style="margin-top:1rem"><div class="panel-header"><h3>📋 ${lang==='pt'?'Histórico de Atividades':'Historial de Actividades'}</h3></div><div class="panel-body"><div class="timeline">${items}</div></div></div>`
    }

    // ── APPROVAL VIEW
    function renderApproval(cardId: string) {
      const card = getCard(cardId)
      if (!card) return '<div class="container"><p>POC não encontrada.</p></div>'
      const sent = card.aprovacaoEnviadaEm
      const approved = allApproved(card)
      const allApprovers = [...(card.aprovadoresOperacao||[]), ...(card.aprovadoresSHE||[])]
      const hasRejection = allApprovers.some((a: any) => a.reprovado)
      // Mostra botão de envio se nunca enviou OU se há aprovadores cujo enviado_em foi resetado
      const hasUnsent = allApprovers.some((a: any) => !a.enviado_em && !a.aprovado)
      const canSend = !sent || hasUnsent

      const renderApproverRows = (type: string) => {
        const list = type === 'op' ? card.aprovadoresOperacao : card.aprovadoresSHE
        const max = 3
        let html = ''
        ;(list || []).forEach((a: any) => {
          const stClass = a.aprovado ? 'approved' : a.reprovado ? 'rejected' : 'pending'
          const stLabel = a.aprovado ? (lang==='pt'?'Aprovado':'Aprobado') : a.reprovado ? (lang==='pt'?'Reprovado':'Reprobado') : (lang==='pt'?'Pendente':'Pendiente')
          const daysPend = (a.aprovado || a.reprovado) ? 0 : daysSince(a.enviadoEm || sent || card.createdAt)
          html += `<div class="approver-status-row ${stClass}" style="${a.reprovado?'background:var(--red-light);border-color:rgba(192,57,43,0.25)':''}">
            <div>
              <div class="approver-info">${esc(a.nome)}</div>
              <div class="approver-email">${esc(a.email)}</div>
              ${!a.aprovado && !a.reprovado && daysPend > 0 ? `<div class="days-pending">${t('days_pending', {n: daysPend})}</div>` : ''}
              ${a.reprovado && a.motivoReprovacao ? `<div style="font-size:11px;color:var(--red);margin-top:3px;font-style:italic">"${esc(a.motivoReprovacao)}"</div>` : ''}
            </div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
              <span class="status-pill ${stClass}" style="${a.reprovado?'background:var(--red-light);color:var(--red);border-color:rgba(192,57,43,0.2)':''}">${stLabel}</span>
              ${!a.aprovado && !a.reprovado && isAdmin ? `
                <button class="btn btn-sm btn-green" onclick="window._poc.markApproved('${cardId}','${a.id}')">${t('mark_approved')}</button>
                <button class="btn btn-sm btn-red" onclick="window._poc.markRejected('${cardId}','${a.id}')">${lang==='pt'?'✗ Reprovar':'✗ Reprobar'}</button>` : ''}
            </div>
          </div>`
        })
        if ((list || []).length < max) {
          html += `<div id="add-approver-form-${type}" style="display:none;margin-top:8px">
            <div style="background:var(--blue-light);border:1px solid rgba(44,62,107,0.15);border-radius:12px;padding:1rem;display:flex;flex-direction:column;gap:10px">
              <div class="form-row">
                <div class="form-group"><label>${t('approver_name')} <span class="req">*</span></label><input type="text" id="ap-name-${type}" placeholder="${t('approver_name')}"></div>
                <div class="form-group"><label>${t('approver_email')} <span class="req">*</span></label><input type="email" id="ap-email-${type}" placeholder="email@mercadolivre.com"></div>
              </div>
              <div style="display:flex;gap:8px">
                <button class="btn btn-primary btn-sm" onclick="window._poc.addApprover('${cardId}','${type}')">${lang==='pt'?'Adicionar':'Agregar'}</button>
                <button class="btn btn-secondary btn-sm" onclick="window._poc.toggleApproverForm('${type}')">${t('btn_cancel')}</button>
              </div>
            </div>
          </div>
          <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="window._poc.toggleApproverForm('${type}')">${t('btn_add_approver')}</button>`
        }
        return html
      }

      return `
      <div class="container">
        <div class="detail-back" onclick="window._poc.navigate('detail','${cardId}')">&larr; ${t('step_data')}</div>
        ${stepperHTML(card.status === 'ready' ? 'approval' : card.status)}
        ${hasRejection ? `<div class="warn-bar">⚠️ ${lang==='pt'?'Um ou mais aprovadores reprovaram esta POC.':'Uno o más aprobadores reprobaron este POC.'} <button class="btn btn-orange btn-sm" style="margin-left:auto" onclick="window._poc.resetAndResubmit('${cardId}')">${lang==='pt'?'↩ Reenviar':'↩ Reenviar'}</button></div>` : ''}
        <div class="info-bar"><span class="info-icon">ℹ️</span>${t('approval_info')}</div>
        <div class="panel"><div class="panel-header"><h3>👷 ${t('section_approvers_op')}</h3></div><div class="panel-body">${renderApproverRows('op')}</div></div>
        <div class="panel"><div class="panel-header"><h3>🦺 ${t('section_approvers_she')}</h3></div><div class="panel-body">${renderApproverRows('she')}</div></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          ${canSend && !hasRejection ? `<button class="btn btn-primary" onclick="window._poc.sendApprovalEmails('${cardId}')">${t('btn_send_approval')}</button>` : ''}
          ${sent && approved ? `<div class="info-bar" style="margin-bottom:0;flex:1">${t('all_approved')}</div><button class="btn btn-green" onclick="window._poc.advanceToHomologacao('${cardId}')">${t('btn_next_homolog')}</button>` : ''}
        </div>
      </div>`
    }

    function toggleApproverForm(type: string) {
      const el = document.getElementById('add-approver-form-' + type)
      if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none'
    }

    async function addApprover(cardId: string, type: string) {
      const nome = (document.getElementById('ap-name-' + type) as HTMLInputElement)?.value.trim() || ''
      const email = (document.getElementById('ap-email-' + type) as HTMLInputElement)?.value.trim() || ''
      if (!nome || !email) { toast(lang==='pt'?'Preencha nome e e-mail.':'Completa nombre y e-mail.', 'error'); return }
      showLoading()
      const res = await api('POST', `/api/pocs/${cardId}/approvers`, { type, nome, email })
      hideLoading()
      if (!res.ok) { toast(res.error || 'Erro ao adicionar aprovador.', 'error'); return }
      await navigate('approval', cardId)
    }

    async function markApproved(cardId: string, approverId: string) {
      showLoading()
      const res = await api('PATCH', `/api/pocs/${cardId}/approvers/${approverId}`, { action: 'approve' })
      hideLoading()
      if (!res.ok) { toast(res.error || 'Erro.', 'error'); return }
      toast(lang==='pt'?'Aprovação registrada!':'¡Aprobación registrada!', 'success')
      await navigate('approval', cardId)
    }

    async function markRejected(cardId: string, approverId: string) {
      const motivo = prompt(lang==='pt'?'Motivo da reprovação (opcional):':'Motivo del rechazo (opcional):', '') || ''
      showLoading()
      const res = await api('PATCH', `/api/pocs/${cardId}/approvers/${approverId}`, { action: 'reject', rejection_reason: motivo })
      hideLoading()
      if (!res.ok) { toast(res.error || 'Erro.', 'error'); return }
      toast(lang==='pt'?'Reprovação registrada.':'Reprobación registrada.', 'error')
      await navigate('approval', cardId)
    }

    async function resetAndResubmit(cardId: string) {
      const card = getCard(cardId)
      if (!card) return
      const allApprovers = [...(card.aprovadoresOperacao || []), ...(card.aprovadoresSHE || [])]
      showLoading()
      await Promise.all(allApprovers.map((a: any) => api('PATCH', `/api/pocs/${cardId}/approvers/${a.id}`, { action: 'reset' })))
      hideLoading()
      toast(lang==='pt'?'Aprovações resetadas.':'Aprobaciones reiniciadas.', 'success')
      await navigate('approval', cardId)
    }

    async function sendApprovalEmails(cardId: string) {
      const card = getCard(cardId)
      if (!card) return
      const allApprovers = [...(card.aprovadoresOperacao || []), ...(card.aprovadoresSHE || [])]
      if (allApprovers.length === 0) { toast(lang==='pt'?'Adicione pelo menos um aprovador.':'Agrega al menos un aprobador.', 'error'); return }
      showLoading()
      const res = await api('POST', `/api/pocs/${cardId}/send-approval`, {})
      hideLoading()
      if (!res.ok) { toast(res.error || 'Erro ao enviar e-mails.', 'error'); return }
      toast(lang==='pt'?`E-mails de aprovação enviados com sucesso!`:`¡E-mails de aprobación enviados!`, 'success')
      await navigate('approval', cardId)
    }

    async function advanceToHomologacao(cardId: string) {
      showLoading()
      const res = await api('POST', `/api/pocs/${cardId}/advance`, { to: 'homologacao' })
      hideLoading()
      if (!res.ok) { toast(res.error || 'Erro ao avançar.', 'error'); return }
      await navigate('homologacao', cardId)
    }

    // ── HOMOLOGAÇÃO VIEW
    function renderHomologacao(cardId: string) {
      const card = getCard(cardId)
      if (!card) return '<div class="container"><p>POC não encontrada.</p></div>'
      const roles = ['SHE','Compras','Operacao','Lean','MTM']
      const roleLabelKey: any = {SHE:'roles_she',Compras:'roles_compras',Operacao:'roles_op',Lean:'roles_lean',MTM:'roles_mtm'}
      const resp = card.responsaveisHomologacao || {}
      let rolesHtml = ''
      roles.forEach(role => {
        const r = resp[role] || {}
        rolesHtml += `<div style="background:var(--gray-light);border:1px solid var(--border);border-radius:12px;padding:1rem;margin-bottom:10px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--blue-deeper);margin-bottom:8px">${t(roleLabelKey[role])}</div>
          <div class="form-row">
            <div class="form-group"><label>${t('sup_name')}</label><input type="text" id="h-name-${role}" value="${esc(r.nome||'')}" placeholder="${t('sup_name')}"></div>
            <div class="form-group"><label>${t('sup_email')}</label><input type="email" id="h-email-${role}" value="${esc(r.email||'')}" placeholder="email@..."></div>
          </div>
        </div>`
      })
      return `
      <div class="container">
        <div class="detail-back" onclick="window._poc.navigate('approval','${cardId}')">&larr; ${t('step_approval')}</div>
        ${stepperHTML('homologacao')}
        <div class="info-bar"><span class="info-icon">ℹ️</span>${t('homolog_info')}</div>
        <div class="panel">
          <div class="panel-header"><h3>📬 ${t('section_responsaveis')}</h3></div>
          <div class="panel-body">
            ${rolesHtml}
            <div style="display:flex;gap:10px;margin-top:1rem;flex-wrap:wrap">
              <button class="btn btn-primary" onclick="window._poc.sendHomologEmail('${cardId}')">${t('btn_send_homolog')}</button>
            </div>
            ${card.emailHomologacaoEnviado ? `<div style="margin-top:1rem"><div class="info-bar" style="margin-bottom:10px">${t('homolog_sent')}</div><button class="btn btn-green" onclick="window._poc.advanceToChecks('${cardId}')">${t('btn_next_checks')}</button></div>` : ''}
          </div>
        </div>
      </div>`
    }

    function gatherResponsaveis() {
      const roles = ['SHE','Compras','Operacao','Lean','MTM']
      const resp: any[] = []
      roles.forEach(role => {
        const n = (document.getElementById('h-name-' + role) as HTMLInputElement)?.value.trim() || ''
        const e = (document.getElementById('h-email-' + role) as HTMLInputElement)?.value.trim() || ''
        if (n && e) resp.push({ role, nome: n, email: e })
      })
      return resp
    }

    async function sendHomologEmail(cardId: string) {
      const responsaveis = gatherResponsaveis()
      showLoading()
      const res = await api('POST', `/api/pocs/${cardId}/send-homologacao`, { responsaveis })
      hideLoading()
      if (!res.ok) { toast(res.error || 'Erro ao enviar e-mail.', 'error'); return }
      toast(lang==='pt'?'E-mail de homologação enviado!':'¡E-mail de homologación enviado!', 'success')
      await navigate('homologacao', cardId)
    }

    async function advanceToChecks(cardId: string) {
      showLoading()
      const res = await api('POST', `/api/pocs/${cardId}/advance`, { to: 'checks' })
      hideLoading()
      if (!res.ok) { toast(res.error || 'Erro ao avançar.', 'error'); return }
      await navigate('checks', cardId)
    }

    // ── CHECKS VIEW
    function renderChecks(cardId: string) {
      const card = getCard(cardId)
      if (!card) return '<div class="container"><p>POC não encontrada.</p></div>'
      const ch = card.checks || {}
      const sup = card.supervisorMTM || {}
      const ger = card.gerenteMTM || {}
      const done = allChecksDone(card)
      const daysSent = card.checksEmailSentAt ? daysSince(card.checksEmailSentAt) : 0
      const showReminder = card.checksEmailSentAt && daysSent >= 5

      const checkItem = (key: string, icon: string, label: string, desc: string) => {
        const item = ch[key] || {}
        const isDone = !!item.done
        const editId = `check-editing-${key}`
        return `<div class="check-item ${isDone ? 'done' : ''}">
          <div class="check-box">${isDone ? '✓' : ''}</div>
          <div class="check-label"><strong>${icon} ${label}</strong><p>${desc}</p></div>
          <div class="check-action" style="flex-wrap:wrap;gap:6px">
            <div id="${editId}" style="display:${isDone?'none':'flex'};gap:8px;align-items:flex-end;min-width:220px;flex-wrap:wrap">
              <div class="form-group" style="margin:0;flex:1;min-width:160px">
                <input type="url" id="check-val-${key}" placeholder="${t('check_ph_link')}" value="${esc(item.link||'')}">
              </div>
              <button class="btn btn-green btn-sm" onclick="window._poc.saveCheck('${cardId}','${key}')">${t('btn_check_save')}</button>
            </div>
            ${isDone ? `<div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:20px">✅</span>
              ${item.link ? `<a href="${esc(item.link)}" target="_blank" style="font-size:12px;color:var(--blue);font-weight:600;word-break:break-all">🔗 ${esc(item.link.length>35?item.link.slice(0,35)+'…':item.link)}</a>` : ''}
              <button class="btn btn-ghost btn-sm" onclick="document.getElementById('${editId}').style.display='flex'" style="font-size:11px;padding:5px 10px">✏️ ${lang==='pt'?'Editar':'Editar'}</button>
            </div>` : ''}
          </div>
        </div>`
      }

      return `
      <div class="container">
        <div class="detail-back" onclick="window._poc.navigate('homologacao','${cardId}')">&larr; ${t('step_homolog')}</div>
        ${stepperHTML('checks')}
        <div class="panel">
          <div class="panel-header"><h3>✅ ${t('section_checks')}</h3></div>
          <div class="panel-body">
            ${checkItem('checklist','📋',t('check_checklist'),t('check_checklist_desc'))}
            ${checkItem('playbook','📚',t('check_playbook'),t('check_playbook_desc'))}
            ${checkItem('catalogo','🗂️',t('check_catalogo'),t('check_catalogo_desc'))}
            ${checkItem('paginaMTM','🌐',t('check_pagina'),t('check_pagina_desc'))}
          </div>
        </div>
        <div class="panel">
          <div class="panel-header"><h3>👔 ${t('section_supervisor')}</h3></div>
          <div class="panel-body">
            <div class="form-row">
              <div>
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--gray);margin-bottom:8px">${t('sup_label')}</div>
                <div class="form-row" style="gap:8px">
                  <div class="form-group"><label>${t('sup_name')}</label><input type="text" id="sup-name" value="${esc(sup.nome||'')}" placeholder="${t('sup_name')}"></div>
                  <div class="form-group"><label>${t('sup_email')}</label><input type="email" id="sup-email" value="${esc(sup.email||'')}" placeholder="email@..."></div>
                </div>
              </div>
              <div>
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--gray);margin-bottom:8px">${t('ger_label')}</div>
                <div class="form-row" style="gap:8px">
                  <div class="form-group"><label>${t('sup_name')}</label><input type="text" id="ger-name" value="${esc(ger.nome||'')}" placeholder="${t('sup_name')}"></div>
                  <div class="form-group"><label>${t('sup_email')}</label><input type="email" id="ger-email" value="${esc(ger.email||'')}" placeholder="email@..."></div>
                </div>
              </div>
            </div>
            <div class="info-bar" style="margin-top:1rem">${t('reminder_info')}</div>
            ${showReminder ? `<div class="warn-bar">⚠️ ${lang==='pt'?`Já fazem ${daysSent} dias desde o último envio.`:`Ya han pasado ${daysSent} días desde el último envío.`}</div>` : ''}
            <button class="btn btn-orange" onclick="window._poc.sendChecksReminder('${cardId}')">${t('btn_send_reminder')}</button>
          </div>
        </div>
        ${done ? `<div class="info-bar"><span class="info-icon">🎉</span>${t('all_checks_done')}</div><button class="btn btn-green" style="width:100%;justify-content:center;font-size:15px;padding:14px" onclick="window._poc.finalizeCard('${cardId}')">${t('btn_finalize')}</button>` : ''}
      </div>`
    }

    async function saveCheck(cardId: string, key: string) {
      const val = (document.getElementById('check-val-' + key) as HTMLInputElement)?.value.trim() || ''
      if (!val) { toast(lang==='pt'?'Insira o link.':'Ingresa el link.', 'error'); return }
      showLoading()
      const res = await api('PATCH', `/api/pocs/${cardId}/checks`, { key, link: val, done: true })
      hideLoading()
      if (!res.ok) { toast(res.error || 'Erro ao salvar check.', 'error'); return }
      toast(lang==='pt'?'Check salvo!':'¡Check guardado!', 'success')
      await navigate('checks', cardId)
    }

    async function sendChecksReminder(cardId: string) {
      const supNome = (document.getElementById('sup-name') as HTMLInputElement)?.value.trim() || ''
      const supEmail = (document.getElementById('sup-email') as HTMLInputElement)?.value.trim() || ''
      const gerNome = (document.getElementById('ger-name') as HTMLInputElement)?.value.trim() || ''
      const gerEmail = (document.getElementById('ger-email') as HTMLInputElement)?.value.trim() || ''
      showLoading()
      const res = await api('POST', `/api/pocs/${cardId}/send-checks-reminder`, {
        supervisor: { nome: supNome, email: supEmail },
        gerente: { nome: gerNome, email: gerEmail }
      })
      hideLoading()
      if (!res.ok) { toast(res.error || 'Erro ao enviar reminder.', 'error'); return }
      toast(lang==='pt'?'Reminder enviado!':'¡Reminder enviado!', 'success')
      await navigate('checks', cardId)
    }

    async function finalizeCard(cardId: string) {
      const card = getCard(cardId)
      if (!card || !allChecksDone(card)) { toast(lang==='pt'?'Conclua todos os checks primeiro.':'Completa todos los checks primero.', 'error'); return }
      showLoading()
      const res = await api('POST', `/api/pocs/${cardId}/advance`, { to: 'finished' })
      hideLoading()
      if (!res.ok) { toast(res.error || 'Erro ao finalizar.', 'error'); return }
      toast(lang==='pt'?'🏆 POC finalizada com sucesso!':'🏆 ¡POC finalizado con éxito!', 'success')
      await navigate('detail', cardId)
    }

    // ── SHARE
    function openShareModal(cardId: string) {
      shareCardId = cardId
      const card = getCard(cardId)
      tempShareList = [...(card?.sharedWith || [])]
      renderShareList()
      openModal('modal-share')
    }
    function renderShareList() {
      const ul = document.getElementById('share-list')
      if (!ul) return
      if (tempShareList.length === 0) { ul.innerHTML = `<li style="font-size:12px;color:var(--gray)">${lang==='pt'?'Nenhum compartilhamento ainda.':'Sin compartidos aún.'}</li>`; return }
      ul.innerHTML = tempShareList.map((s: any, i: number) => `<li class="share-item">${esc(s.name)} <span>${esc(s.email)}</span> <button class="btn btn-sm btn-secondary" style="padding:4px 10px" onclick="window._poc.removeShare(${i})">✕</button></li>`).join('')
    }
    function addShareUser() {
      const n = (document.getElementById('share-name') as HTMLInputElement)?.value.trim() || ''
      const e = (document.getElementById('share-email') as HTMLInputElement)?.value.trim() || ''
      if (!n || !e) { toast(lang==='pt'?'Preencha nome e e-mail.':'Completa nombre y e-mail.', 'error'); return }
      if (tempShareList.some((s: any) => s.email === e)) { toast('E-mail já adicionado.', 'error'); return }
      tempShareList.push({ name: n, email: e })
      const nameEl = document.getElementById('share-name') as HTMLInputElement
      const emailEl = document.getElementById('share-email') as HTMLInputElement
      if (nameEl) nameEl.value = ''
      if (emailEl) emailEl.value = ''
      renderShareList()
    }
    function removeShare(i: number) { tempShareList.splice(i, 1); renderShareList() }
    async function saveShare() {
      if (!shareCardId) return
      showLoading()
      const res = await api('PUT', `/api/pocs/${shareCardId}/share`, { shared_with: tempShareList.map((s: any) => ({ name: s.name, email: s.email })) })
      hideLoading()
      closeModal('modal-share')
      if (!res.ok) { toast(res.error || 'Erro ao salvar.', 'error'); return }
      toast(lang==='pt'?'Compartilhamento salvo!':'¡Compartido guardado!', 'success')
      renderCurrent()
    }

    // ── DELETE
    function openDeleteModal(cardId: string) { deletingCardId = cardId; openModal('modal-confirm') }
    async function confirmDelete() {
      if (!deletingCardId) return
      showLoading()
      const res = await api('DELETE', `/api/pocs/${deletingCardId}`)
      hideLoading()
      closeModal('modal-confirm')
      if (!res.ok) { toast(res.error || 'Erro ao excluir.', 'error'); return }
      toast(lang==='pt'?'POC excluída.':'POC eliminado.', 'success')
      await navigate('dashboard')
    }

    // ── EXPOSE GLOBALLY (for onclick handlers)
    ;(window as any)._poc = {
      navigate, doLogin, toggleLang, toggleAdmin, closeModal, openModal,
      saveCard, advanceToApproval, confirmDelete, openDeleteModal,
      openShareModal, addShareUser, removeShare, saveShare,
      addApprover, toggleApproverForm, markApproved, markRejected,
      resetAndResubmit, sendApprovalEmails, advanceToHomologacao,
      sendHomologEmail, advanceToChecks, saveCheck, sendChecksReminder, finalizeCard,
    }

    // ── INIT
    async function init() {
      lang = detectLang()
      const langBtn = document.getElementById('lang-btn')
      if (langBtn) langBtn.textContent = lang === 'pt' ? '🇧🇷 PT' : '🇪🇸 ES'
      document.documentElement.lang = lang
      updateInicioBtn()
      applyI18nStatic()

      token = localStorage.getItem(TOKEN_KEY)
      const storedUser = localStorage.getItem(USER_KEY_ST)
      if (storedUser) { try { currentUser = JSON.parse(storedUser) } catch {} }

      document.querySelectorAll('.overlay').forEach(o => {
        o.addEventListener('click', function(this: Element, e: Event) {
          if (e.target === this && this.id !== 'modal-login') closeModal(this.id)
        })
      })

      const loginNameEl = document.getElementById('login-name')
      if (loginNameEl) loginNameEl.addEventListener('keydown', (e: Event) => { if ((e as KeyboardEvent).key === 'Enter') doLogin() })
      const loginEmailEl = document.getElementById('login-email')
      if (loginEmailEl) loginEmailEl.addEventListener('keydown', (e: Event) => { if ((e as KeyboardEvent).key === 'Enter') doLogin() })

      if (currentUser && token) {
        isAdmin = currentUser.is_admin
        updateUserUI()
        await navigate('dashboard')
      } else {
        const app = document.getElementById('app')
        if (app) app.innerHTML = '<div style="height:60vh;display:flex;align-items:center;justify-content:center"><div style="text-align:center"><div style="font-size:48px;margin-bottom:1rem">🧪</div><p style="font-size:15px;color:var(--gray)">Carregando...</p></div></div>'
        openModal('modal-login')
      }
    }

    init()
  }, [])

  return (
    <>
      <header>
        <div className="logo" onClick={() => (window as any)._poc?.navigate('dashboard')}>
          <div className="logo-mark">
            <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="6.5" r="3.5" fill="#F5E97A"/><path d="M2.5 17.5c0-4.142 3.358-7.5 7.5-7.5s7.5 3.358 7.5 7.5" stroke="#F5E97A" strokeWidth="2.2" strokeLinecap="round"/></svg>
          </div>
          <div>
            <div className="logo-name">Mercado Livre</div>
            <div className="logo-sub" id="header-sub">Gestão de POCs</div>
          </div>
        </div>
        <div className="header-right">
          <a id="btn-inicio" className="btn-header" href="https://mtmtransportes-paginainicialpt.vercel.app/" target="_blank">🏠 Início</a>
          <button className="btn-header" onClick={() => (window as any)._poc?.toggleLang()} id="lang-btn">🇧🇷 PT</button>
          <div className="admin-chip" id="admin-chip" onClick={() => (window as any)._poc?.toggleAdmin()} title="Modo Administrador" style={{display:'none'}}>🔑 Admin</div>
          <div className="user-chip" id="user-chip" style={{display:'none'}}>
            <span>👤</span> <strong id="user-name-display"></strong>
          </div>
          <button className="btn-header primary" onClick={() => (window as any)._poc?.navigate('dashboard')} id="btn-nav-dashboard" style={{display:'none'}} data-i18n="nav_dashboard">Dashboard</button>
          <span className="badge-header">POC</span>
        </div>
      </header>

      <div id="app"></div>
      <div className="toast-container" id="toast-container"></div>

      {/* MODAL: Login */}
      <div className="overlay" id="modal-login">
        <div className="modal">
          <div className="modal-header">
            <div className="modal-icon">🔐</div>
            <div><h2 data-i18n="login_title">Identificação</h2><p data-i18n="login_sub">Para acessar o POC Manager</p></div>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label data-i18n="login_name">Seu nome <span className="req">*</span></label>
              <input type="text" id="login-name" placeholder="Nome completo" />
            </div>
            <div className="form-group">
              <label data-i18n="login_email">Seu e-mail corporativo <span className="req">*</span></label>
              <input type="email" id="login-email" placeholder="nome@mercadolivre.com" />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={() => (window as any)._poc?.doLogin()} data-i18n="login_btn">Entrar →</button>
          </div>
        </div>
      </div>

      {/* MODAL: Share */}
      <div className="overlay" id="modal-share">
        <div className="modal">
          <div className="modal-header">
            <div className="modal-icon">🔗</div>
            <div><h2 data-i18n="share_title">Compartilhar acesso</h2><p data-i18n="share_sub">Adicione pessoas que podem ver e editar este card</p></div>
          </div>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label data-i18n="share_name">Nome</label>
                <input type="text" id="share-name" placeholder="Nome" />
              </div>
              <div className="form-group">
                <label data-i18n="share_email">E-mail</label>
                <input type="email" id="share-email" placeholder="email@mercadolivre.com" />
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => (window as any)._poc?.addShareUser()} data-i18n="share_add">+ Adicionar</button>
            <div style={{marginTop:'1rem'}}>
              <ul className="share-list" id="share-list"></ul>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => (window as any)._poc?.closeModal('modal-share')} data-i18n="btn_close">Fechar</button>
            <button className="btn btn-primary" onClick={() => (window as any)._poc?.saveShare()} data-i18n="btn_save">Salvar</button>
          </div>
        </div>
      </div>

      {/* MODAL: Confirm Delete */}
      <div className="overlay" id="modal-confirm">
        <div className="modal" style={{maxWidth:'420px'}}>
          <div className="modal-header" style={{background:'var(--red)'}}>
            <div className="modal-icon">⚠️</div>
            <div><h2 data-i18n="confirm_title">Confirmar exclusão</h2><p data-i18n="confirm_sub">Essa ação não pode ser desfeita</p></div>
          </div>
          <div className="modal-body">
            <p style={{fontSize:'13px',lineHeight:'1.6'}} data-i18n="confirm_msg">Tem certeza que deseja excluir este card de POC?</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => (window as any)._poc?.closeModal('modal-confirm')} data-i18n="btn_cancel">Cancelar</button>
            <button className="btn btn-red" onClick={() => (window as any)._poc?.confirmDelete()} data-i18n="btn_delete">Excluir</button>
          </div>
        </div>
      </div>
    </>
  )
}
