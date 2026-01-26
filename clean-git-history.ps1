# Script para remover a chave API do histórico do Git
# ATENÇÃO: Este script reescreve o histórico! Faça backup primeiro.

Write-Host "================================================" -ForegroundColor Yellow
Write-Host "  REMOÇÃO DE CHAVE API DO HISTÓRICO DO GIT" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  ATENÇÃO: Este script vai reescrever o histórico do Git!" -ForegroundColor Red
Write-Host "⚠️  Certifique-se de que todos os colaboradores estão cientes!" -ForegroundColor Red
Write-Host ""

$confirm = Read-Host "Deseja continuar? (digite SIM para confirmar)"

if ($confirm -ne "SIM") {
    Write-Host "❌ Operação cancelada." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🔍 Verificando se há commits com a chave vazada..." -ForegroundColor Cyan

# Procura pela chave no histórico
$found = git log --all --full-history -p -S "AIzaSyBuYH5rmbVBgjJlrggNXjJTZ6bwhqm7KCk" --pretty=format:"%h %s" 2>&1

if ($found) {
    Write-Host "✅ Commits encontrados com a chave:" -ForegroundColor Green
    Write-Host $found
    Write-Host ""
} else {
    Write-Host "ℹ️  Nenhum commit encontrado com a chave específica." -ForegroundColor Yellow
    Write-Host "   Isso pode significar que ela já foi removida ou nunca foi commitada." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Criando arquivo de substituição..." -ForegroundColor Cyan

# Cria arquivo temporário com a chave a ser removida
$replacementFile = "git-secrets-replace.txt"
"AIzaSyBuYH5rmbVBgjJlrggNXjJTZ6bwhqm7KCk===>***REMOVED***" | Out-File -FilePath $replacementFile -Encoding UTF8

Write-Host "✅ Arquivo criado: $replacementFile" -ForegroundColor Green
Write-Host ""
Write-Host "📝 PRÓXIMOS PASSOS MANUAIS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Baixe o BFG Repo-Cleaner:" -ForegroundColor White
Write-Host "   https://rtyley.github.io/bfg-repo-cleaner/" -ForegroundColor Cyan
Write-Host ""
Write-Host "2️⃣  Execute o comando:" -ForegroundColor White
Write-Host "   java -jar bfg.jar --replace-text $replacementFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "3️⃣  Limpe o repositório:" -ForegroundColor White
Write-Host "   git reflog expire --expire=now --all" -ForegroundColor Cyan
Write-Host "   git gc --prune=now --aggressive" -ForegroundColor Cyan
Write-Host ""
Write-Host "4️⃣  Force push (CUIDADO!):" -ForegroundColor White
Write-Host "   git push origin --force --all" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 ALTERNATIVA (sem BFG):" -ForegroundColor Yellow
Write-Host "   Se preferir não usar BFG, delete o repositório GitHub e crie um novo:" -ForegroundColor White
Write-Host "   1. Faça backup local do código atual" -ForegroundColor White
Write-Host "   2. Delete o repositório no GitHub" -ForegroundColor White
Write-Host "   3. Crie um novo repositório" -ForegroundColor White
Write-Host "   4. Faça git init, add, commit e push do código limpo" -ForegroundColor White
Write-Host ""
Write-Host "================================================" -ForegroundColor Yellow
