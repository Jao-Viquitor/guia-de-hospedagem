# Helen's Guidebook - Guia de Hospedagem

Um guia digital interativo e personalizável para hóspedes do Airbnb, com exportação para PDF com navegação clicável.

## 🌟 Características

- **Interface multilíngue** (Português/Espanhol)
- **Exportação para PDF** com índice navegável
- **Integração com Google Maps** para imagens de locais
- **QR Code WiFi** gerado automaticamente
- **Design responsivo** e otimizado para impressão
- **Seções organizadas:**
  - Boas-vindas
  - Direções e acesso
  - Check-in
  - WiFi
  - Regras da casa
  - Links úteis (restaurantes, mercados, postos, cafés)
  - Contato

## 🚀 Executar Localmente

**Pré-requisitos:** Node.js 18+

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure a API do Google Maps** (opcional, para imagens de locais):
   - Crie uma chave de API no [Google Cloud Console](https://console.cloud.google.com/)
   - Ative as APIs: Maps JavaScript API e Places API
   - Defina a variável de ambiente em `.env.local`:
     ```
     VITE_GOOGLE_MAPS_API_KEY=sua_chave_aqui
     ```

3. **Execute o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse:** O servidor estará rodando em `http://localhost:4200` (ou outra porta disponível)

## 📦 Build para Produção

```bash
npm run build
npm run preview
```

## 📄 Exportação para PDF

1. Clique no botão "Exportar PDF" no topo da página
2. O sistema carrega todas as imagens dos locais automaticamente
3. Aguarde a janela de impressão aparecer
4. Selecione "Salvar como PDF" como destino
5. O PDF gerado terá:
   - Índice com links clicáveis na primeira página
   - Todas as seções em páginas separadas
   - Grid de 3 colunas para restaurantes/mercados
   - Formatação otimizada para impressão

## 🎨 Personalização

### Conteúdo

Edite o arquivo `src/services/content.data.ts` para:
- Alterar textos em português e espanhol
- Adicionar/remover links úteis
- Modificar informações de WiFi, check-in, etc.

### Estilos

Os estilos estão divididos em:
- **Site:** Classes Tailwind CSS no HTML
- **PDF:** Estilos `@media print` em `index.html`

### Cores do tema

Principais cores definidas em `index.html`:
- **Primary:** `#799F0C` (verde oliva)
- **Secondary:** `#FFE000` (amarelo)

## 🛠️ Tecnologias

- **Angular 21** - Framework
- **TypeScript** - Linguagem
- **Tailwind CSS** - Estilos
- **Google Maps API** - Imagens de locais
- **Vite** - Build tool

## 📝 Estrutura do Projeto

```
guia-de-hospedagem/
├── src/
│   ├── app.component.html      # Template principal
│   ├── app.component.ts        # Lógica principal
│   ├── components/             # Componentes reutilizáveis
│   │   ├── menu-grid.component.ts
│   │   └── icon.component.ts
│   └── services/
│       ├── content.data.ts     # Conteúdo multilíngue
│       └── places.service.ts   # Integração Google Maps
├── index.html                  # HTML base + estilos PDF
└── package.json
```

## 🌐 Deploy

O projeto pode ser hospedado em qualquer serviço de hospedagem estática:
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.
