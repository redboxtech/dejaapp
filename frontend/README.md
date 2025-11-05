# Deja App - Frontend

## Visão Geral

Frontend do Deja App desenvolvido em **React 18** com **TypeScript** e **Vite**. A aplicação utiliza uma arquitetura baseada em componentes reutilizáveis, gerenciamento de estado com Context API, e uma interface moderna construída com Radix UI e Tailwind CSS.

## Tecnologias Principais

- **React 18.3.1** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Tipagem estática para JavaScript
- **Vite 6.3.5** - Build tool e dev server moderno
- **Radix UI** - Componentes acessíveis e customizáveis
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Roteamento (implícito via state management)
- **Sonner** - Sistema de notificações (toast)
- **Lucide React** - Biblioteca de ícones

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/              # Componentes UI base (Radix UI)
│   │   ├── AuthContext.tsx  # Context de autenticação
│   │   ├── DataContext.tsx # Context de dados (pacientes, medicamentos, etc.)
│   │   ├── Dashboard.tsx   # Página principal
│   │   ├── PatientsPage.tsx # Gestão de pacientes
│   │   ├── MedicationsPage.tsx # Gestão de medicamentos
│   │   ├── PrescriptionsPage.tsx # Gestão de receitas
│   │   ├── StockPage.tsx   # Controle de estoque
│   │   ├── AlertsPage.tsx  # Configurações de alertas
│   │   ├── ReplenishmentPage.tsx # Solicitações de reposição
│   │   ├── CaregiverSchedulesPage.tsx # Escalas de cuidadores
│   │   └── ProfilePage.tsx # Perfil do usuário
│   ├── lib/
│   │   ├── api.ts          # Utilitários para chamadas API (apiFetch)
│   │   └── utils.ts        # Funções utilitárias
│   ├── img/                # Imagens e assets
│   ├── styles/             # Estilos globais
│   ├── App.tsx             # Componente raiz e roteamento
│   └── main.tsx            # Entry point
├── package.json
├── vite.config.ts          # Configuração do Vite
└── index.html
```

## Configuração e Instalação

### Pré-requisitos

- **Node.js** 18+ (recomendado: 20+)
- **npm** ou **yarn**

### Instalação

```bash
# Instalar dependências
npm install

# Ou com yarn
yarn install
```

### Variáveis de Ambiente

O frontend não requer variáveis de ambiente no momento, mas a configuração do proxy para o backend está em `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5101',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

## Executando o Projeto

### Modo Desenvolvimento

```bash
npm run dev
```

O servidor de desenvolvimento será iniciado em `http://localhost:3000` com hot-reload habilitado.

### Build de Produção

```bash
npm run build
```

O build será gerado na pasta `build/`, pronta para ser servida pelo backend ou por um servidor web estático.

## Arquitetura

### Gerenciamento de Estado

#### AuthContext
Gerencia o estado de autenticação do usuário:
- Login/Logout
- Registro de novos usuários
- Token JWT armazenado em `localStorage`
- Chamadas para `/api/auth/login`, `/api/auth/register`, `/api/auth/me`

#### DataContext
Gerencia todos os dados da aplicação:
- Pacientes (`/api/patients`)
- Medicamentos (`/api/medications`)
- Estoque (`/api/stock`)
- Solicitações de reposição (`/api/replenishment`)
- Configurações de alertas (`/api/alerts/settings`)
- Gastos mensais (`/api/stock/monthly-expenses`)

### Comunicação com Backend

O arquivo `src/lib/api.ts` contém a função `apiFetch` que:
- Adiciona automaticamente o token JWT no header `Authorization`
- Trata erros de autenticação
- Formata requisições e respostas

**Exemplo de uso:**
```typescript
import { apiFetch } from '@/lib/api';

// GET request
const patients = await apiFetch<Patient[]>('/patients');

// POST request
await apiFetch('/patients', {
  method: 'POST',
  body: JSON.stringify(patientData),
});
```

### Componentes UI

Os componentes em `src/components/ui/` são baseados em **Radix UI** e seguem o padrão shadcn/ui:
- `Button`, `Input`, `Select`, `Dialog`, `Card`, `Badge`, etc.
- Totalmente customizáveis via Tailwind CSS
- Acessíveis e seguem padrões ARIA

### Roteamento

O roteamento é gerenciado via estado no `App.tsx`:
- `currentPage` state controla qual página exibir
- `DashboardLayout` renderiza o layout comum
- Cada página é um componente importado dinamicamente

**Páginas disponíveis:**
- `dashboard` - Dashboard principal
- `patients` - Gestão de pacientes
- `medications` - Gestão de medicamentos
- `prescriptions` - Gestão de receitas
- `stock` - Controle de estoque
- `replenishment` - Solicitações de reposição
- `caregiver-schedules` - Escalas de cuidadores
- `alerts` - Configurações de alertas
- `profile` - Perfil do usuário

## Funcionalidades Principais

### 1. Dashboard
- Cards de estatísticas (pacientes, medicamentos, estoques críticos, etc.)
- Próximas medicações agrupadas por paciente
- Visualização do cuidador responsável por período
- Estoques críticos com badges de status

### 2. Gestão de Pacientes
- CRUD completo de pacientes
- Visualização de medicações do paciente
- Compartilhamento com outros representantes
- Modal com lista de medicações por horário

### 3. Gestão de Medicamentos
- Wizard multi-step para cadastro
- Campos: dosagem, unidade, forma de apresentação, horários, tratamento, estoque
- Suporte a meia dose, frequência personalizada, medicações extras
- Edição e exclusão de medicamentos

### 4. Gestão de Receitas
- Upload de receitas (imagens e PDFs)
- Processamento de receitas para criar medicamentos
- Associação de medicamentos existentes a receitas
- Visualização e exclusão de receitas

### 5. Controle de Estoque
- Visualização de estoque atual e dias restantes
- Registro de entradas com origem e preço
- Suporte a compras parceladas
- Cálculo de consumo mensal
- Alertas baseados em thresholds configuráveis

### 6. Escalas de Cuidadores
- CRUD de escalas de trabalho
- Seleção de dias da semana
- Definição de horários de início e fim
- Associação de cuidador a paciente

### 7. Configurações de Alertas
- Thresholds configuráveis para estoque baixo e crítico
- Canais de notificação
- Configurações personalizadas por usuário

## Padrões de Código

### Convenções de Nomenclatura

- **Componentes**: PascalCase (`MedicationsPage.tsx`)
- **Arquivos**: PascalCase para componentes, camelCase para utilitários
- **Variáveis e funções**: camelCase
- **Tipos/Interfaces**: PascalCase com prefixo `I` opcional

### Estrutura de Componentes

```typescript
// Exemplo de componente
import { useState, useEffect } from 'react';
import { useData } from './DataContext';
import { apiFetch } from '@/lib/api';

export function ComponentName() {
  const { data } = useData();
  const [state, setState] = useState();
  
  useEffect(() => {
    // Efeitos
  }, []);
  
  const handleAction = async () => {
    // Lógica
  };
  
  return (
    // JSX
  );
}
```

### Tipos TypeScript

Os tipos principais estão definidos em `DataContext.tsx`:
- `Patient`, `Medication`, `StockItem`, `ReplenishmentRequest`
- `DosageUnit`, `PresentationForm`, `TreatmentType`

## Integração com Backend

### Endpoints Utilizados

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/auth/login` | POST | Autenticação |
| `/api/auth/register` | POST | Registro |
| `/api/auth/me` | GET | Dados do usuário atual |
| `/api/patients` | GET, POST, PUT, DELETE | CRUD de pacientes |
| `/api/medications` | GET, POST, PUT, DELETE | CRUD de medicamentos |
| `/api/prescriptions` | GET, POST, DELETE | Gestão de receitas |
| `/api/stock` | GET | Consulta de estoque |
| `/api/stock/entry` | POST | Registro de entrada |
| `/api/stock/monthly-expenses` | GET | Gastos mensais |
| `/api/replenishment` | GET, POST | Solicitações |
| `/api/caregivers` | GET, POST, DELETE | Cuidadores |
| `/api/caregiver-schedules` | GET, POST, PUT, DELETE | Escalas |
| `/api/alerts/settings` | GET, PUT | Configurações de alertas |

### Formato de Dados

- **IDs**: Strings (UUIDs convertidos do backend)
- **Datas**: Strings no formato `YYYY-MM-DD` ou ISO 8601
- **Horários**: Strings no formato `HH:mm`
- **Enums**: Convertidos entre números (backend) e strings (frontend)

## Desenvolvimento

### Adicionando Novos Componentes

1. Criar arquivo em `src/components/`
2. Importar dependências necessárias
3. Usar hooks do Context (`useAuth`, `useData`)
4. Seguir padrões de UI existentes

### Adicionando Novas Páginas

1. Criar componente da página
2. Importar em `App.tsx`
3. Adicionar case no `renderDashboardContent`
4. Adicionar item no menu em `DashboardLayout.tsx`

### Estilização

- Use **Tailwind CSS** classes utility-first
- Cores principais: `#16808c` (verde), `#a61f43` (vermelho)
- Siga o design system existente
- Use componentes UI de `src/components/ui/`

## Build e Deploy

### Build de Produção

```bash
npm run build
```

O build gera:
- `build/index.html`
- `build/assets/` (JS, CSS, imagens)

### Deploy

O frontend é servido pelo backend em produção:
- Backend serve arquivos estáticos de `frontend/build`
- Configuração em `DejaBackend.Api/Program.cs`

## Troubleshooting

### Erro de CORS
- Verifique se o backend está rodando em `http://localhost:5101`
- Confirme configuração CORS no backend

### Erro de Autenticação
- Verifique se o token JWT está sendo salvo em `localStorage`
- Confirme que o backend está retornando o token corretamente

### Erro de Build
- Limpe node_modules: `rm -rf node_modules && npm install`
- Verifique versões do Node.js e npm

## Dependências Principais

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "typescript": "^5.x",
  "vite": "6.3.5",
  "@radix-ui/*": "varias versões",
  "tailwindcss": "^3.x",
  "sonner": "^2.0.3",
  "lucide-react": "^0.487.0"
}
```

## Contribuindo

1. Siga os padrões de código existentes
2. Use TypeScript para tipagem
3. Mantenha componentes pequenos e focados
4. Adicione comentários quando necessário
5. Teste localmente antes de commitar

---

**Desenvolvido com ❤️ para simplificar o cuidado de pacientes**
