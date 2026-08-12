# 🚀 Parte 3 — Projeto Local e Deploy na Vercel

> Nesta parte vamos: montar o projeto no seu computador, configurar as variáveis,
> rodar localmente para testar, e depois publicar na Vercel.

---

## Pré-requisitos

Antes de começar, confirme que você tem instalado:

- **Node.js** versão 18 ou superior
  - Verifique: abra o terminal e rode `node --version`
  - Se não tiver: baixe em https://nodejs.org (clique em "LTS")

- **Git**
  - Verifique: `git --version`
  - Se não tiver: baixe em https://git-scm.com

- Um editor de código — recomendamos o **VS Code** (https://code.visualstudio.com)

---

## Passo 1 — Organizar a pasta do projeto

1. A pasta `poc-manager` já foi gerada com toda a estrutura de backend.
   Salve ela em um lugar do seu computador (ex: `Documentos/poc-manager`)

2. Abra o **terminal** (no Windows: PowerShell ou Terminal; no Mac: Terminal)

3. Navegue até a pasta do projeto:
   ```bash
   cd caminho/para/poc-manager
   # Exemplo Windows:
   cd C:\Users\everton\Documents\poc-manager
   # Exemplo Mac:
   cd ~/Documents/poc-manager
   ```

4. Instale as dependências do projeto:
   ```bash
   npm install
   ```
   Aguarde alguns minutos. Você verá muitos pacotes sendo baixados — isso é normal.

---

## Passo 2 — Criar o arquivo de variáveis de ambiente

1. Na pasta `poc-manager`, crie um arquivo chamado **`.env.local`**
   (com ponto na frente e sem extensão `.txt`)

   No terminal:
   ```bash
   # Windows (PowerShell):
   copy .env.example .env.local

   # Mac/Linux:
   cp .env.example .env.local
   ```

2. Abra o arquivo `.env.local` no VS Code e preencha com os valores das partes anteriores:

   ```env
   # Do Supabase (Parte 1)
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...sua-chave-aqui...

   # JWT — gere uma chave aleatória
   JWT_SECRET=cole-aqui-uma-string-longa-e-aleatoria

   # Do Brevo (Parte 2)
   BREVO_API_KEY=xkeysib-sua-chave-aqui
   EMAIL_FROM=poc-manager@mercadolivre.com
   EMAIL_FROM_NAME=POC Manager MTM

   # URL do app (por enquanto deixe assim)
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Para gerar o JWT_SECRET**, rode no terminal:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
   ```
   Copie o resultado e cole no `.env.local`.

> ⚠️ O arquivo `.env.local` **nunca** deve ser enviado para o GitHub.
> Ele já está no `.gitignore` por padrão no Next.js.

---

## Passo 3 — Rodar o projeto localmente

1. No terminal (dentro da pasta `poc-manager`), rode:
   ```bash
   npm run dev
   ```

2. Você verá algo assim:
   ```
   ▲ Next.js 14.x.x
   - Local:  http://localhost:3000
   - Ready in 2.5s
   ```

3. Abra o navegador e acesse **http://localhost:3000**

4. Para testar a API, abra outro terminal e rode:
   ```bash
   # Teste de login
   curl -X POST http://localhost:3000/api/auth \
     -H "Content-Type: application/json" \
     -d '{"name":"Everton Silva","email":"everton.dasilva@mercadolivre.com"}'
   ```

   Você deve receber um JSON com `ok: true` e um `token`. Se isso funcionar, o backend está operacional! ✅

---

## Passo 4 — Publicar no GitHub

Antes de ir para a Vercel, precisamos do código no GitHub.

1. Acesse **https://github.com** e faça login (ou crie uma conta)

2. Clique em **"+"** no canto superior direito → **"New repository"**

3. Preencha:
   | Campo | Valor |
   |-------|-------|
   | **Repository name** | `poc-manager` |
   | **Visibility** | `Private` (recomendado) |

4. Clique em **"Create repository"**

5. De volta ao terminal, dentro da pasta `poc-manager`:
   ```bash
   git init
   git add .
   git commit -m "feat: backend inicial — Supabase + Brevo + Next.js"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/poc-manager.git
   git push -u origin main
   ```

   > Substitua `SEU-USUARIO` pelo seu usuário do GitHub.

---

## Passo 5 — Deploy na Vercel

1. Acesse **https://vercel.com** e faça login com sua conta do GitHub

2. Clique em **"Add New..."** → **"Project"**

3. Clique em **"Import"** ao lado do repositório `poc-manager`

4. Na tela de configuração:
   - **Framework Preset**: Next.js (detectado automaticamente)
   - **Root Directory**: deixe como está (`.`)
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `.next` (padrão)

5. Clique em **"Environment Variables"** (seção expansível)
   e adicione **uma por uma** as mesmas variáveis do seu `.env.local`:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | sua URL do Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | sua service role key |
   | `JWT_SECRET` | sua string gerada |
   | `BREVO_API_KEY` | sua API key do Brevo |
   | `EMAIL_FROM` | o e-mail sender verificado |
   | `EMAIL_FROM_NAME` | `POC Manager MTM` |
   | `NEXT_PUBLIC_APP_URL` | deixe em branco por ora |

6. Clique em **"Deploy"** e aguarde (1-3 minutos)

7. Quando terminar, você verá a URL do seu projeto:
   `https://poc-manager-xxxx.vercel.app`

8. Volte nas variáveis de ambiente da Vercel e atualize `NEXT_PUBLIC_APP_URL`
   com essa URL. Depois clique em **"Redeploy"** → **"Redeploy"** (sem cache).

---

## Passo 6 — Testar o deploy em produção

Com a URL da Vercel em mãos, teste:

```bash
curl -X POST https://poc-manager-xxxx.vercel.app/api/auth \
  -H "Content-Type: application/json" \
  -d '{"name":"Everton Silva","email":"everton.dasilva@mercadolivre.com"}'
```

Resposta esperada:
```json
{
  "ok": true,
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": "uuid-aqui",
      "name": "Everton Silva",
      "email": "everton.dasilva@mercadolivre.com",
      "is_admin": false
    }
  }
}
```

Se chegou até aqui, **o backend está no ar!** 🎉

---

## ✅ Checklist — Projeto e Deploy concluído

- [ ] Node.js instalado (`node --version` ≥ 18)
- [ ] `npm install` rodou sem erros
- [ ] `.env.local` criado e preenchido com as 6 variáveis
- [ ] `npm run dev` rodando em localhost:3000
- [ ] Teste de `/api/auth` funcionou localmente
- [ ] Código enviado para o GitHub
- [ ] Deploy na Vercel concluído
- [ ] Variáveis de ambiente adicionadas na Vercel
- [ ] Teste de `/api/auth` funcionou em produção

---

## ❓ Problemas comuns

**"Cannot find module" no npm install**
→ Apague a pasta `node_modules` e o arquivo `package-lock.json`, depois rode `npm install` novamente.

**"Invalid API Key" no Brevo**
→ Verifique se copiou a chave completa, incluindo o prefixo `xkeysib-`.

**"Error connecting to Supabase"**
→ Verifique se a `NEXT_PUBLIC_SUPABASE_URL` não tem barra no final e se a `SUPABASE_SERVICE_ROLE_KEY` foi copiada completa.

**Build falhou na Vercel**
→ Verifique na aba "Build Logs" da Vercel qual linha deu erro e me mande — resolvo junto com você.

---

## 📋 Resumo das variáveis de ambiente

| Variável | Onde pegar |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role |
| `JWT_SECRET` | Gerado no terminal com Node.js |
| `BREVO_API_KEY` | Brevo → Settings → SMTP & API → API Keys |
| `EMAIL_FROM` | O e-mail sender verificado no Brevo |
| `EMAIL_FROM_NAME` | `POC Manager MTM` (pode customizar) |
| `NEXT_PUBLIC_APP_URL` | URL gerada pela Vercel após o deploy |
