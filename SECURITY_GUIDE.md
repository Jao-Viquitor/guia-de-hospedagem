# 🔒 GUIA COMPLETO - SEGURANÇA DA CHAVE API

## ⚠️ PASSO 1: DELETAR A CHAVE ANTIGA (FAZER IMEDIATAMENTE!)

1. Acesse: https://console.cloud.google.com/apis/credentials?project=odssey-980024
2. Encontre a chave: `AIzaSyBuYH5rmbVBgjJlrggNXjJTZ6bwhqm7KCk`
3. **CLIQUE EM "EXCLUIR"** (não regenerar!)
4. Confirme a exclusão

## 🔑 PASSO 2: CRIAR NOVA CHAVE COM SEGURANÇA

1. No mesmo painel, clique em "CRIAR CREDENCIAIS" > "Chave de API"
2. **IMEDIATAMENTE** após criar, clique em "RESTRINGIR CHAVE"
3. Configure as restrições:

   **Restrições de aplicativo:**
   - Selecione: "Referenciadores HTTP (sites)"
   - Adicione:
     - `*.vercel.app/*`
     - `https://seu-dominio.vercel.app/*` (substitua pelo seu domínio)
     - `http://localhost:*/*` (para desenvolvimento local)

   **Restrições de API:**
   - Selecione: "Restringir chave"
   - Marque APENAS:
     - ✅ Maps JavaScript API
     - ✅ Places API
     - ✅ Geocoding API (se necessário)

4. Clique em "SALVAR"
5. **COPIE A NOVA CHAVE** (você vai precisar nos próximos passos)

## 🔧 PASSO 3: CONFIGURAR VARIÁVEIS NO VERCEL

1. Acesse: https://vercel.com/seu-usuario/guia-de-hospedagem/settings/environment-variables
2. Adicione uma nova variável:
   - **Nome**: `VITE_GOOGLE_MAPS_API_KEY`
   - **Valor**: Cole a NOVA chave que você criou
   - **Ambientes**: Marque TODOS (Production, Preview, Development)
3. Clique em "Save"

## 💻 PASSO 4: ATUALIZAR .ENV LOCAL

1. No arquivo `.env` do seu projeto, substitua:
   ```
   VITE_GOOGLE_MAPS_API_KEY=YOUR_NEW_API_KEY_HERE
   ```
   
   Por:
   ```
   VITE_GOOGLE_MAPS_API_KEY=sua_nova_chave_aqui
   ```

2. **IMPORTANTE**: Nunca faça commit do arquivo `.env`! Ele já está no .gitignore

## 🧹 PASSO 5: LIMPAR HISTÓRICO DO GIT (OBRIGATÓRIO!)

A chave antiga ainda está no histórico do Git. Para removê-la completamente:

```powershell
# OPÇÃO 1: Usando BFG Repo-Cleaner (RECOMENDADO)
# Instale o BFG: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --replace-text passwords.txt guia-de-hospedagem

# passwords.txt deve conter:
# AIzaSyBuYH5rmbVBgjJlrggNXjJTZ6bwhqm7KCk

# OPÇÃO 2: Método manual (mais complexo)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch src/environments/environment.ts" \
  --prune-empty --tag-name-filter cat -- --all

# Depois de qualquer opção, force push:
git push origin --force --all
git push origin --force --tags
```

⚠️ **ATENÇÃO**: Force push vai reescrever o histórico. Avise colaboradores!

## ✅ PASSO 6: VERIFICAR SE FUNCIONOU

1. Faça push do código:
   ```powershell
   git push origin main
   ```

2. No Vercel, a build será acionada automaticamente
3. Verifique os logs de build no Vercel
4. Teste o site publicado

## 🧪 PASSO 7: TESTAR LOCALMENTE

```powershell
# Execute local para testar:
npm run dev
```

Abra o console do navegador e verifique se não há erros de API key.

## 📝 RESUMO DO QUE FOI FEITO

✅ Criado `src/environments/environment.ts` que lê de variáveis de ambiente
✅ Atualizado `.gitignore` para ignorar arquivos environment.ts
✅ Atualizado `.env` para usar placeholder (você vai substituir pela nova chave)
✅ Commit das mudanças de segurança

## ❌ O QUE NUNCA FAZER

- ❌ Nunca faça commit de `.env` ou `.env.local`
- ❌ Nunca coloque chaves diretamente no código
- ❌ Nunca compartilhe chaves em issues, PRs ou mensagens
- ❌ Nunca use a mesma chave em múltiplos projetos

## 🆘 SE ALGO DER ERRADO

1. Verifique se a variável `VITE_GOOGLE_MAPS_API_KEY` está configurada no Vercel
2. Force um novo deploy no Vercel (Settings > Redeploy)
3. Verifique os logs de build do Vercel
4. Confirme que a chave antiga foi deletada no Google Cloud

---

**PRÓXIMOS PASSOS IMEDIATOS:**
1. ✅ Já fizemos: Atualizar código para usar variáveis de ambiente
2. 🔴 VOCÊ DEVE FAZER AGORA: Deletar chave antiga no Google Cloud
3. 🔴 VOCÊ DEVE FAZER AGORA: Criar nova chave com restrições
4. 🔴 VOCÊ DEVE FAZER AGORA: Adicionar nova chave no Vercel
5. 🔴 VOCÊ DEVE FAZER AGORA: Limpar histórico do Git
6. 🔴 VOCÊ DEVE FAZER AGORA: Force push para GitHub
