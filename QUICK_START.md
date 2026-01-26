# 🚀 GUIA RÁPIDO - PRÓXIMOS PASSOS

## ✅ JÁ FEITO
- ✅ Chave comprometida removida do histórico do Git
- ✅ Código atualizado para usar variáveis de ambiente
- ✅ `.gitignore` configurado para proteger arquivos sensíveis

## 🔴 FAZER AGORA (EM ORDEM)

### 1. Deletar a Chave Antiga no Google Cloud
📍 **Link direto**: https://console.cloud.google.com/apis/credentials?project=odssey-980024

- Encontre: `AIzaSyBuYH5rmbVBgjJlrggNXjJTZ6bwhqm7KCk`
- Clique em **EXCLUIR** (🗑️ ícone de lixeira)
- Confirme a exclusão

### 2. Criar Nova Chave API (COM RESTRIÇÕES!)
No mesmo painel:
- Clique: **"+ CRIAR CREDENCIAIS"** → **"Chave de API"**
- **IMEDIATAMENTE** clique em **"RESTRINGIR CHAVE"**

**Configurações obrigatórias:**

**a) Restrições de aplicativo:**
```
Tipo: Referenciadores HTTP (sites)

Sites permitidos:
- *.vercel.app/*
- http://localhost:*/*
```

**b) Restrições de API:**
```
✅ Maps JavaScript API
✅ Places API
```

- Clique **SALVAR**
- **COPIE A NOVA CHAVE** (você vai precisar!)

### 3. Configurar no Vercel
📍 Acesse: https://vercel.com → Seu projeto → Settings → Environment Variables

**Adicione:**
- **Key**: `VITE_GOOGLE_MAPS_API_KEY`
- **Value**: `[COLE A NOVA CHAVE AQUI]`
- **Environments**: Marque **TODOS** (Production + Preview + Development)
- Clique **Save**

### 4. Configurar Localmente
No arquivo `.env` do projeto:

```env
VITE_GOOGLE_MAPS_API_KEY=SUA_NOVA_CHAVE_AQUI
```

⚠️ **NUNCA** faça commit deste arquivo!

### 5. Fazer Deploy
```powershell
# Comitar o guia de segurança
git add SECURITY_GUIDE.md clean-git-history.ps1 QUICK_START.md
git commit -m "docs: add security guides for API key management"

# Push para GitHub
git push origin main
```

O Vercel vai fazer deploy automaticamente e usar a chave configurada nas variáveis de ambiente.

### 6. Verificar se Funcionou
Após o deploy:
1. Acesse seu site no Vercel
2. Abra o Console do navegador (F12)
3. Procure por erros relacionados ao Google Maps
4. O mapa deve carregar normalmente

## 🧪 Testar Localmente (Opcional)
```powershell
npm run dev
```

Abra http://localhost:4200 e verifique se o mapa funciona.

## 📝 Checklist Final
- [ ] Chave antiga deletada no Google Cloud Console
- [ ] Nova chave criada COM restrições
- [ ] Variável `VITE_GOOGLE_MAPS_API_KEY` adicionada no Vercel
- [ ] Arquivo `.env` local atualizado com a nova chave
- [ ] Push feito para GitHub
- [ ] Deploy verificado no Vercel
- [ ] Site funcionando corretamente

## ❓ Se Algo Der Errado

**Erro: "Google Maps API error: InvalidKeyMapError"**
- ✅ Verifique se a chave está configurada no Vercel
- ✅ Verifique as restrições da chave (domínio Vercel deve estar permitido)
- ✅ Aguarde alguns minutos (propagação de alterações)

**Erro: "This API project is not authorized to use this API"**
- ✅ Ative as APIs necessárias no Google Cloud Console
- ✅ Maps JavaScript API
- ✅ Places API

**Build falha no Vercel**
- ✅ Verifique se a variável de ambiente está configurada
- ✅ Force um novo deploy: Vercel → Deployments → ⋯ → Redeploy

## 📞 Suporte
Para mais detalhes, veja `SECURITY_GUIDE.md`
