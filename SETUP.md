# POC Manager — Setup de Infraestrutura

Stack: Next.js 14 + Supabase (PostgreSQL) + Brevo (e-mail) + Vercel (deploy)

---

## 1. Supabase

1. Crie um projeto em https://app.supabase.com
2. Vá em **SQL Editor** e rode o arquivo `supabase/migrations/001_initial_schema.sql` inteiro
3. Vá em **Settings → API** e copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY`
4. (Opcional) Para adicionar o primeiro admin, rode no SQL Editor:
   ```sql
   UPDATE users SET is_admin = true WHERE email = 'seu@email.com';
   ```
   (O usuário precisa ter feito login ao menos uma vez para existir na tabela)

---

## 2. Brevo

1. Crie conta em https://app.brevo.com
2. Vá em **Settings → Senders & IPs → Senders** e verifique o e-mail remetente (ex: `poc-manager@mercadolivre.com`)
3. Vá em **Settings → SMTP & API → API Keys**, crie uma chave e copie para `BREVO_API_KEY`

---

## 3. JWT Secret

Gere uma chave segura (mínimo 64 chars):
```bash
openssl rand -base64 64
```
Cole o resultado em `JWT_SECRET`.

---

## 4. Rodar localmente

```bash
# Clone e instale dependências
npm install

# Copie o .env.example
cp .env.example .env.local
# Preencha as variáveis no .env.local

# Rode o servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

---

## 5. Deploy na Vercel

```bash
# Instale a CLI da Vercel se não tiver
npm i -g vercel

# Deploy
vercel deploy --prod
```

Ou conecte o repositório GitHub diretamente no painel da Vercel.

**Variáveis de ambiente na Vercel:**
Vá em seu projeto → **Settings → Environment Variables** e adicione todas as variáveis do `.env.example`.

---

## 6. Estrutura de rotas da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/auth` | Login (cria ou recupera usuário, retorna JWT) |
| `GET` | `/api/pocs` | Lista POCs do usuário |
| `POST` | `/api/pocs` | Cria nova POC |
| `GET` | `/api/pocs/[id]` | Detalhes de uma POC |
| `PUT` | `/api/pocs/[id]` | Edita uma POC |
| `DELETE` | `/api/pocs/[id]` | Exclui uma POC |
| `POST` | `/api/pocs/[id]/approvers` | Adiciona aprovador |
| `PATCH` | `/api/pocs/[id]/approvers/[approverId]` | Aprova/reprova/reseta aprovador |
| `DELETE` | `/api/pocs/[id]/approvers/[approverId]` | Remove aprovador |
| `PUT` | `/api/pocs/[id]/share` | Atualiza compartilhamento |
| `PATCH` | `/api/pocs/[id]/checks` | Atualiza item do checklist |
| `POST` | `/api/pocs/[id]/advance` | Avança status (`ready` / `homologacao` / `checks` / `finished`) |
| `POST` | `/api/pocs/[id]/send-approval` | Dispara e-mails de aprovação via Brevo |
| `POST` | `/api/pocs/[id]/send-homologacao` | Dispara e-mail de homologação via Brevo |
| `POST` | `/api/pocs/[id]/send-checks-reminder` | Dispara reminder pós-homologação via Brevo |

**Autenticação:** todas as rotas (exceto `/api/auth`) exigem o header:
```
Authorization: Bearer <token>
```

---

## 7. Próximos passos sugeridos

- [ ] Migrar o frontend HTML atual para Next.js (App Router + React)
- [ ] Upload de arquivos via Supabase Storage (apresentações e desenhos técnicos)
- [ ] Página de admin para gerenciar todos os cards
- [ ] Notificações em tempo real via Supabase Realtime
- [ ] Webhook do Brevo para rastrear bounces e aberturas de e-mail
