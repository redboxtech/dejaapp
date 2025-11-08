# DejaApp Mobile

Aplicativo React Native (Expo) direcionado ao representante legal de pacientes para acompanhamento de medicações, agenda de cuidados e notificações inteligentes. Este projeto compartilha o mesmo backend `.NET` já utilizado pelo frontend web e foca em oferecer uma experiência extremamente simples, acessível e leve para idosos e cuidadores com pouca familiaridade tecnológica.

## Visão Geral

- **Plataformas:** Android e iOS (Expo Managed Workflow).
- **Motivação:** Adaptação mobile do fluxo do portal web para representantes legais, com ênfase em acessibilidade, clareza e segurança.
- **SDK:** Expo 54 (React Native 0.81, React 19).
- **Estado atual:** Estrutura base e telas iniciais estáticas. Nenhuma integração com backend implementada ainda.

## Pré-requisitos

- Node.js LTS (18+)
- npm ou pnpm (recomendado) ou yarn
- Expo CLI (`npm install --global expo-cli`)

## Primeiros Passos

```bash
cd app
npm install   # ou pnpm install / yarn install
npm start     # inicia Expo Dev Tools
```

- Use `npm run android` ou `npm run ios` para abrir o emulador apropriado.
- Leia o QR Code no Expo Go para testar em um dispositivo físico.
- Por padrão o aplicativo carrega dados locais mockados. Para utilizar apenas a API real, defina `EXPO_PUBLIC_USE_MOCKS=false` em um arquivo `.env`.

## Estrutura de Pastas

```
app
├── App.tsx                    # Entrada principal Expo
├── app.json                   # Configuração Expo
├── babel.config.js            # Configuração Babel
├── metro.config.js            # Configuração Metro bundler
├── package.json               # Dependências e scripts
├── tsconfig.json              # Configuração TypeScript
├── README.md                  # Este arquivo
└── src
    ├── App.tsx                # Setup principal da aplicação
    ├── assets                 # Fonts, imagens e ícones
    │   ├── fonts/.gitkeep
    │   └── images/.gitkeep
    ├── components             # Componentes reutilizáveis
    │   ├── ActionCard.tsx
    │   ├── InfoCard.tsx
    │   └── layout
    │       └── ScreenContainer.tsx
    ├── config                 # Configurações e conexão com backend
    │   ├── api.ts
    │   ├── environment.ts
    │   └── security
    │       └── authConfig.ts
    ├── mocks                  # Dados locais para prototipagem
    │   ├── homeSummary.ts
    │   └── index.ts
    ├── hooks                  # Hooks customizados (ex: autenticação)
    │   ├── useAuth.ts
    │   └── useSecureStorage.ts
    ├── navigation             # Rotas e navegação principal
    │   ├── AppNavigator.tsx
    │   └── types.ts
    ├── screens                # Telas e stacks
    │   ├── Agenda
    │   │   └── AgendaScreen.tsx
    │   ├── Home
    │   │   └── HomeScreen.tsx
    │   └── Medications
    │       └── MedicationsScreen.tsx
    ├── services               # Comunicação com backend e serviços auxiliares
    │   ├── apiClient.ts
    │   ├── authService.ts
    │   ├── dashboardService.ts
    │   ├── secureStorage.ts
    │   └── notificationService.ts
    ├── store                  # Estado global (ex: Zustand ou Context API)
    │   └── index.ts
    ├── theme                  # Tokens de design, paleta e provider
    │   ├── ThemeProvider.tsx
    │   ├── colors.ts
    │   ├── index.ts
    │   ├── spacing.ts
    │   └── typography.ts
    ├── types                  # Tipagens compartilhadas
    │   └── index.ts
    └── utils                  # Helpers e formatadores
        ├── accessibility.ts
        ├── date.ts
        └── logger.ts
```

## Telas Iniciais

- **Menu inferior:** Ícones `Início`, `Agenda` e `Medicamentos` para acesso rápido.
- **Tela `Início`:** quatro ações de destaque (`Confirmar medicação`, `Agendar vacina`, `Agendar consulta`, `Registrar compra`) com botões grandes, tipografia legível e contraste alto.
- **Modo Acessível:** Layout centrado, espaçamento generoso, textos curtos e linguagem simples.

## Segurança & Autenticação

- O login usa as mesmas credenciais do representante legal do portal web.
- Tokens de acesso devem ser armazenados em `SecureStore` (ou similar) com refresh token seguro.
- A camada `services/authService.ts` centralizará o fluxo de autenticação.
- O `useAuth` será responsável por guardar o estado local e expor métodos `signIn`, `signOut` etc.

## Comunicação com Backend

- `services/apiClient.ts` prepara um cliente Axios com interceptors para anexar JWT, lidar com expirados e tratar erros comuns.
- Todas as rotas devem derivar dos endpoints expostos pela API `.NET`.
- `config/api.ts` concentrará base URL, timeouts e chaves de configuração.

## Próximos Passos Recomendados

1. Implementar fluxo de autenticação (login + refresh).
2. Validar UX com os dados mockados e ajustar fluxos críticos.
3. Integrar agenda, estoque e medicações com a API.
4. Adicionar notificações locais e integração WhatsApp para lembretes.
5. Configurar testes (`jest`, `react-native-testing-library`) e pipeline CI/CD.

---

Para dúvidas ou sugestões sobre a arquitetura mobile, entre em contato com a equipe responsável pelo frontend mobile.

