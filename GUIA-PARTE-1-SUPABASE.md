# 🗄️ Parte 1 — Supabase (Banco de Dados)

> **O que é?** O Supabase é o nosso banco de dados PostgreSQL na nuvem.
> Aqui vamos criar o projeto e as tabelas do POC Manager.

---

## Passo 1 — Criar conta no Supabase

1. Acesse **https://supabase.com**
2. Clique em **"Start your project"** (botão verde no centro)
3. Clique em **"Sign up with GitHub"** — é a forma mais fácil
   - Se não tiver GitHub, clique em **"Sign up with email"** e crie uma conta
4. Autorize o acesso e você cairá no **dashboard**

---

## Passo 2 — Criar o projeto

1. No dashboard, clique em **"New project"**
2. Preencha os campos:

   | Campo | O que colocar |
   |-------|--------------|
   | **Organization** | Selecione sua org (ou crie uma com seu nome) |
   | **Name** | `poc-manager` |
   | **Database Password** | Clique em "Generate a password" e **salve essa senha em algum lugar seguro** |
   | **Region** | `South America (São Paulo)` — escolha a mais próxima |

3. Clique em **"Create new project"**
4. Aguarde cerca de **1-2 minutos** enquanto o banco é criado (você verá uma barra de progresso)

---

## Passo 3 — Rodar o SQL (criar as tabelas)

1. No menu lateral esquerdo, clique em **"SQL Editor"** (ícone de terminal `>_`)
2. Clique em **"+ New query"** no canto superior esquerdo
3. Você verá uma área de texto em branco

4. Agora abra o arquivo `supabase/migrations/001_initial_schema.sql` que geramos
5. **Selecione todo o conteúdo** do arquivo (Ctrl+A) e **cole** na área do SQL Editor
6. Clique no botão **"Run"** (▶️ verde, canto superior direito) — ou pressione `Ctrl + Enter`

7. Você verá a mensagem:
   ```
   Success. No rows returned
   ```
   Isso é correto! Significa que as tabelas foram criadas com sucesso.

8. Para confirmar, clique em **"Table Editor"** no menu lateral — você deve ver as 7 tabelas:
   - `users`
   - `pocs`
   - `poc_approvers`
   - `poc_shares`
   - `poc_responsaveis`
   - `poc_checks`
   - `poc_history`

---

## Passo 4 — Copiar as credenciais

Agora precisamos de 2 chaves do Supabase.

1. No menu lateral, clique em **"Project Settings"** (ícone de engrenagem ⚙️, no fundo do menu)
2. Clique em **"API"** no submenu que aparece

Você verá uma página com várias chaves. Precisamos de:

### 🔑 Chave 1 — Project URL
- Seção: **"Project URL"**
- É algo como: `https://abcdefghijklmnop.supabase.co`
- **Copie esse valor** → vai para `NEXT_PUBLIC_SUPABASE_URL` no seu `.env.local`

### 🔑 Chave 2 — Service Role Key
- Seção: **"Project API Keys"**
- Procure a linha que diz **`service_role`** (não a `anon`!)
- Clique em **"Reveal"** para mostrar a chave completa
- **Copie esse valor** → vai para `SUPABASE_SERVICE_ROLE_KEY` no seu `.env.local`

> ⚠️ **Atenção:** A `service_role` key dá acesso total ao banco.
> Nunca coloque ela em código que roda no browser. No nosso projeto ela fica
> apenas em variáveis de ambiente do servidor (Next.js server-side).

---

## Passo 5 — (Opcional) Definir o primeiro Admin

Se quiser que sua conta já seja admin desde o início:

1. Vá no **SQL Editor** novamente
2. Cole e rode o comando abaixo, trocando pelo seu e-mail:
   ```sql
   UPDATE users SET is_admin = true WHERE email = 'seu@email.com';
   ```
   > Obs: você precisa fazer login no app pelo menos uma vez antes para que o usuário exista na tabela.

---

## ✅ Checklist — Supabase concluído

- [ ] Conta criada no Supabase
- [ ] Projeto `poc-manager` criado (região São Paulo)
- [ ] SQL rodado com sucesso (7 tabelas criadas)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` copiado
- [ ] `SUPABASE_SERVICE_ROLE_KEY` copiado

**Quando tiver as 2 chaves em mãos, pode seguir para a Parte 2 — Brevo. →**
