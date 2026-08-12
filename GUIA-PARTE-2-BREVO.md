# 📧 Parte 2 — Brevo (Disparo de E-mails)

> **O que é?** O Brevo (antigo Sendinblue) é a plataforma que vai disparar
> os e-mails de aprovação, homologação e reminders de verdade — no lugar dos
> `mailto:` que o HTML atual usava.

---

## Passo 1 — Criar conta no Brevo

1. Acesse **https://app.brevo.com**
2. Clique em **"Sign up for free"**
3. Preencha com seu e-mail corporativo (`@mercadolivre.com`)
4. Confirme o e-mail (vai chegar um link de verificação)
5. Preencha o cadastro básico (nome, empresa: "Mercado Livre")
6. Na pergunta sobre o que você quer fazer, selecione **"Send transactional emails"**
7. Clique em **"Get started"**

---

## Passo 2 — Verificar o e-mail remetente (Sender)

> Este é o passo mais importante. O Brevo só envia e-mails **de** endereços que você verificou.

1. No menu superior, clique em **"Settings"** (engrenagem ⚙️)
2. No menu lateral esquerdo, clique em **"Senders & IPs"**
3. Clique em **"Senders"**
4. Clique em **"+ Add a new sender"**

5. Preencha:
   | Campo | Valor |
   |-------|-------|
   | **Sender Name** | `POC Manager MTM` |
   | **Sender Email** | `poc-manager@mercadolivre.com` |

   > ⚠️ Se você **não tiver acesso** ao e-mail `poc-manager@mercadolivre.com`
   > (ou seja, não consegue receber e-mails nele), use um e-mail pessoal seu
   > do Mercado Livre que você possa verificar, como `everton.dasilva@mercadolivre.com`.

6. Clique em **"Save"**

7. O Brevo vai enviar um e-mail de verificação para esse endereço.
   Abra o e-mail e clique em **"Confirm my email address"**

8. Volte ao Brevo — o sender vai aparecer com status **"Verified"** ✅

---

## Passo 3 — Gerar a API Key

1. Ainda em **"Settings"**, no menu lateral clique em **"SMTP & API"**
2. Clique na aba **"API Keys"**
3. Clique em **"Generate a new API key"**

4. Preencha:
   | Campo | Valor |
   |-------|-------|
   | **API Key name** | `poc-manager-production` |

5. Clique em **"Generate"**

6. Uma janela vai mostrar a chave. Ela começa com `xkeysib-...`

   > ⚠️ **IMPORTANTE:** Essa chave só aparece UMA vez. Copie agora e salve em local seguro.

7. **Copie a chave completa** → vai para `BREVO_API_KEY` no seu `.env.local`

---

## Passo 4 — Verificar o domínio (Recomendado para produção)

> Este passo melhora a entregabilidade dos e-mails (evita cair no spam).
> Pode pular por enquanto e voltar depois que o app estiver funcionando.

1. Em **"Senders & IPs"**, clique em **"Domains"**
2. Clique em **"+ Add a new domain"**
3. Digite `mercadolivre.com`
4. O Brevo vai mostrar registros DNS que precisam ser adicionados no provedor do domínio
5. Encaminhe esses registros para o time de TI/infra que gerencia o DNS do `mercadolivre.com`

---

## Passo 5 — Testar o envio (opcional mas recomendado)

Antes de integrar com o código, você pode testar um envio manual:

1. No menu principal, clique em **"Transactional"**
2. Clique em **"SMTP & API"** → **"Test your SMTP configuration"**
3. Preencha um e-mail de destino e clique em **"Send test email"**
4. Se chegar no e-mail, tudo certo ✅

---

## ✅ Checklist — Brevo concluído

- [ ] Conta criada no Brevo
- [ ] E-mail sender verificado (ex: `poc-manager@mercadolivre.com`)
- [ ] API Key gerada e copiada
- [ ] `BREVO_API_KEY` anotado
- [ ] `EMAIL_FROM` anotado (o e-mail que você verificou como sender)

**Quando tiver a API Key, pode seguir para a Parte 3 — Projeto e Deploy. →**
