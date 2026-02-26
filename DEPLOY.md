# 🚀 BEREIA — Guia de Deploy (Passo a Passo)

Este guia foi feito para quem **não programa**. Siga cada passo na ordem.

---

## O que você vai precisar

1. **Conta no GitHub** (gratuito) — para guardar o código
2. **Conta na Vercel** (gratuito) — para colocar o site no ar
3. **Chave da API OpenAI** — para a IA funcionar

Tempo estimado: **15-20 minutos**

---

## PASSO 1 — Criar conta no GitHub

1. Acesse [github.com](https://github.com)
2. Clique em **"Sign up"**
3. Crie sua conta com email e senha
4. Confirme o email

---

## PASSO 2 — Criar o repositório

1. No GitHub, clique no botão **"+"** (canto superior direito) → **"New repository"**
2. Preencha:
   - **Repository name:** `bereia-app`
   - **Description:** `Estudo bíblico com IA`
   - Marque: **Public**
   - NÃO marque "Add a README file"
3. Clique **"Create repository"**

---

## PASSO 3 — Subir o código para o GitHub

### Opção A: Pelo site do GitHub (mais fácil)

1. Na página do repositório vazio, clique em **"uploading an existing file"**
2. Arraste TODOS os arquivos e pastas do projeto BEREIA para a área de upload
3. Clique **"Commit changes"**

### Opção B: Pelo terminal (se tiver Git instalado)

```bash
cd bereia-app
git init
git add .
git commit -m "BEREIA v1.0"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/bereia-app.git
git push -u origin main
```

---

## PASSO 4 — Obter a chave da API OpenAI

1. Acesse [platform.openai.com](https://platform.openai.com)
2. Crie conta ou faça login
3. Vá em **"API keys"** (menu lateral)
4. Clique **"Create new secret key"**
5. Dê um nome: `bereia`
6. **COPIE A CHAVE** (ela começa com `sk-...`) — você só vê ela uma vez!
7. Adicione crédito: vá em **"Billing"** → **"Add payment method"**
   - Recomendo começar com **$5** (dura meses no GPT-4o Mini)

---

## PASSO 5 — Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique **"Sign up"** → **"Continue with GitHub"**
3. Autorize a Vercel a acessar seu GitHub
4. Na dashboard, clique **"Add New..."** → **"Project"**
5. Encontre o repositório **`bereia-app`** e clique **"Import"**
6. Na tela de configuração:
   - **Framework Preset:** Next.js (detectado automaticamente)
   - **Root Directory:** `./ ` (deixe como está)
   - Clique em **"Environment Variables"** e adicione:
     - **Name:** `OPENAI_API_KEY`
     - **Value:** cole a chave que você copiou no passo 4
7. Clique **"Deploy"**
8. Aguarde 1-2 minutos...
9. 🎉 **Pronto!** Seu site está no ar em `bereia-app.vercel.app`

---

## PASSO 6 — Domínio personalizado (opcional)

Se quiser usar `bereia.com.br` ou similar:

1. Compre o domínio em [registro.br](https://registro.br) ou [Namecheap](https://namecheap.com)
2. Na Vercel, vá em **Settings** → **Domains**
3. Adicione o domínio
4. Configure o DNS conforme instruções da Vercel (ela mostra exatamente o que fazer)

---

## Manutenção e Custos

### Custo mensal estimado:
| Item | Custo |
|------|-------|
| Vercel (hosting) | **Gratuito** (até 100k visitas/mês) |
| OpenAI API | **~$1-5/mês** (com uso moderado) |
| Domínio .com.br | **~R$40/ano** |
| **Total** | **~R$10-30/mês** |

### Monitoramento:
- **Vercel:** Dashboard mostra quantas visitas e erros
- **OpenAI:** Dashboard mostra quantos tokens foram usados e quanto custou
- Se o custo subir: ative o rate limiting em `lib/rate-limit.js` (mude `RATE_LIMIT_ENABLED` para `true`)

---

## Atualizando o site

Quando quiser fazer mudanças:

1. Edite os arquivos no GitHub (clique no arquivo → lápis de edição)
2. Ou suba novos arquivos
3. A Vercel **detecta automaticamente** e faz deploy em ~1 minuto

---

## Estrutura de Arquivos

```
bereia-app/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.js      ← Rota da API (fala com OpenAI)
│   ├── globals.css            ← Estilos globais
│   ├── layout.js              ← Layout raiz
│   └── page.js                ← Página principal (toda a interface)
├── lib/
│   ├── cache.js               ← Cache de respostas
│   ├── curiosities.js         ← Banco de curiosidades PT/EN
│   ├── i18n.js                ← Traduções PT/EN
│   ├── prompt.js              ← System prompt para a IA
│   ├── quiz-data.js           ← Dados do vocacional bíblico
│   └── rate-limit.js          ← Rate limiter (desativado)
├── .env.example               ← Modelo de variáveis de ambiente
├── .gitignore
├── jsconfig.json
├── next.config.js
├── package.json
├── postcss.config.js
└── tailwind.config.js
```

---

## Problemas Comuns

### "O site dá erro 500"
- Verifique se a variável `OPENAI_API_KEY` está configurada na Vercel
- Vá em Vercel → Settings → Environment Variables → confira

### "A IA não responde"
- Verifique se tem crédito na conta OpenAI (platform.openai.com → Billing)
- O GPT-4o Mini é muito barato, mas precisa de crédito

### "O site carrega mas não aparece nada"
- Verifique o console do navegador (F12 → Console) por erros
- Pode ser problema de build — veja os logs na dashboard da Vercel

### Quer ativar o rate limiting?
- Abra `lib/rate-limit.js`
- Mude `RATE_LIMIT_ENABLED` de `false` para `true`
- Ajuste `MAX_REQUESTS_PER_DAY` conforme necessário
- Faça commit e a Vercel atualiza automaticamente

---

## Próximos Passos Sugeridos

1. ✅ Deploy feito
2. 🔄 Compartilhe com amigos para testar
3. 📊 Monitore custos na OpenAI por 1 semana
4. 🎨 Personalize cores/textos editando os arquivos
5. 📱 Adicione como PWA (Progressive Web App) para mobile
6. 💰 Se quiser monetizar: ative rate limit + crie plano Pro

---

*Dúvidas? Abra uma issue no GitHub ou me pergunte aqui.*
