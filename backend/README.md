# DejaBackend - .NET 8 Web API

## Visão Geral

Backend do Deja App desenvolvido em **.NET 8** seguindo os princípios de **Clean Architecture** (Onion/Hexagonal). A aplicação fornece funcionalidades completas para autenticação de usuários, gestão de pacientes, rastreamento de medicamentos, controle de estoque, gestão de receitas médicas, escalas de cuidadores e solicitações de reposição.

## Arquitetura

O projeto está estruturado em **quatro camadas** para garantir separação de responsabilidades, manutenibilidade e testabilidade:

| Camada | Responsabilidade | Componentes Principais |
|--------|------------------|------------------------|
| **DejaBackend.Api** | Camada de Apresentação (Entry Point) | Controllers ASP.NET Core, Configuração de DI, CORS, JWT, Swagger, Servir arquivos estáticos do frontend |
| **DejaBackend.Application** | Lógica de Negócio | MediatR (CQRS), Commands/Queries/Handlers, Interfaces (`IApplicationDbContext`, `ICurrentUserService`, `IJwtService`, `IFileStorageService`), DTOs |
| **DejaBackend.Domain** | Regras de Negócio Core | Entidades (`User`, `Patient`, `Medication`, `Prescription`, `CaregiverSchedule`, etc.), Enums, Value Objects. **Sem dependências externas** |
| **DejaBackend.Infrastructure** | Acesso a Dados e Serviços Externos | Entity Framework Core (`ApplicationDbContext`), Identity, JWT Service, Azure Blob Storage, Repositories |

## Estrutura do Projeto

```
backend/
├── DejaBackend.Api/              # Camada de Apresentação
│   ├── Controllers/               # API Controllers
│   │   ├── AuthController.cs
│   │   ├── PatientsController.cs
│   │   ├── MedicationsController.cs
│   │   ├── PrescriptionsController.cs
│   │   ├── StockController.cs
│   │   ├── ReplenishmentController.cs
│   │   ├── CaregiversController.cs
│   │   ├── RepresentativesController.cs
│   │   ├── CaregiverSchedulesController.cs
│   │   └── AlertsController.cs
│   ├── Program.cs                 # Configuração da aplicação
│   └── appsettings.json          # Configurações
│
├── DejaBackend.Application/       # Camada de Aplicação
│   ├── Auth/
│   │   ├── Commands/             # RegisterUser, Login
│   │   └── Queries/              # GetCurrentUser
│   ├── Patients/
│   │   ├── Commands/             # AddPatient, UpdatePatient, DeletePatient, SharePatient
│   │   └── Queries/              # GetPatients
│   ├── Medications/
│   │   ├── Commands/             # AddMedication, UpdateMedication, DeleteMedication
│   │   └── Queries/              # GetMedications
│   ├── Prescriptions/
│   │   ├── Commands/             # UploadPrescription, ProcessPrescription, DeletePrescription
│   │   └── Queries/              # GetPrescriptions
│   ├── Stock/
│   │   ├── Commands/             # AddStockEntry
│   │   └── Queries/              # GetStock, GetMonthlyExpenses
│   ├── Caregivers/
│   │   ├── Commands/             # AddCaregiver, DeleteCaregiver
│   │   └── Queries/              # GetCaregivers
│   ├── CaregiverSchedules/
│   │   ├── Commands/             # AddCaregiverSchedule, UpdateCaregiverSchedule, DeleteCaregiverSchedule
│   │   └── Queries/              # GetCaregiverSchedules, GetCaregiverByPatientAndTime
│   ├── Alerts/
│   │   ├── Commands/             # UpdateAlertSettings
│   │   └── Queries/              # GetAlertSettings
│   └── Interfaces/               # Contratos da camada de aplicação
│
├── DejaBackend.Domain/            # Camada de Domínio
│   ├── Entities/                 # Entidades de domínio
│   │   ├── User.cs
│   │   ├── Patient.cs
│   │   ├── Medication.cs
│   │   ├── Prescription.cs
│   │   ├── StockMovement.cs
│   │   ├── Caregiver.cs
│   │   ├── CaregiverSchedule.cs
│   │   ├── Representative.cs
│   │   ├── ReplenishmentRequest.cs
│   │   └── AlertSettings.cs
│   └── Enums/                    # Enumeradores
│       ├── CareType.cs
│       ├── TreatmentType.cs
│       ├── PrescriptionType.cs
│       └── StockEnums.cs
│
└── DejaBackend.Infrastructure/    # Camada de Infraestrutura
    ├── Persistence/
    │   └── ApplicationDbContext.cs
    ├── Services/
    │   ├── JwtService.cs
    │   ├── CurrentUserService.cs
    │   ├── UserRepository.cs
    │   ├── AzureBlobStorageService.cs
    │   └── PrescriptionTypeRecognizer.cs
    ├── Migrations/                # Migrations do Entity Framework
    └── DependencyInjection.cs     # Configuração de DI
```

## Tecnologias e Dependências

### Principais Frameworks e Bibliotecas

- **.NET 8.0** - Framework principal
- **ASP.NET Core 8** - Web API framework
- **Entity Framework Core 8.0.4** - ORM para acesso a dados
- **SQL Server** - Banco de dados (Azure SQL Database)
- **MediatR** - Implementação do padrão CQRS
- **Microsoft.AspNetCore.Identity** - Autenticação e autorização
- **JWT Bearer Authentication** - Autenticação via tokens
- **Swashbuckle.AspNetCore** - Documentação Swagger/OpenAPI
- **Azure.Storage.Blobs** - Armazenamento de arquivos no Azure
- **SixLabors.ImageSharp** - Processamento de imagens (reconhecimento de receitas)

## Configuração e Instalação

### Pré-requisitos

- **.NET 8 SDK** ([Download](https://dotnet.microsoft.com/download/dotnet/8.0))
- **SQL Server** (Azure SQL Database ou SQL Server local)
- **Azure Storage Account** (para armazenamento de receitas)
- Editor de código (Visual Studio Code, Visual Studio, Rider)

### Configuração

1. **Clone o repositório e navegue até a pasta do backend:**
   ```bash
   cd DejaBackend
   ```

2. **Configure o `appsettings.json` ou `appsettings.Development.json`:**
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=seu-servidor;Database=DejaDB;User Id=seu-usuario;Password=sua-senha;Encrypt=True;TrustServerCertificate=False;Connection Timeout=60;Command Timeout=60"
     },
     "Jwt": {
       "Key": "sua-chave-secreta-longa-e-segura-aqui",
       "Issuer": "DejaBackend",
       "Audience": "DejaFrontend"
     },
     "AzureStorage": {
       "ConnectionString": "DefaultEndpointsProtocol=https;AccountName=seu-storage;AccountKey=sua-key;EndpointSuffix=core.windows.net"
     }
   }
   ```

3. **Restaure as dependências:**
   ```bash
   dotnet restore
   ```

4. **Aplique as migrations do banco de dados:**
   ```bash
   dotnet ef database update --project DejaBackend.Infrastructure --startup-project DejaBackend.Api
   ```

5. **Execute a aplicação:**
   ```bash
   dotnet run --project DejaBackend.Api
   ```

   A API estará disponível em:
   - `https://localhost:7262` (HTTPS)
   - `http://localhost:5101` (HTTP)

## Arquitetura CQRS

O projeto utiliza o padrão **CQRS (Command Query Responsibility Segregation)** via MediatR:

### Commands (Modificações)
- `AddPatientCommand` - Criar paciente
- `UpdateMedicationCommand` - Atualizar medicamento
- `AddStockEntryCommand` - Adicionar entrada de estoque
- etc.

### Queries (Consultas)
- `GetPatientsQuery` - Listar pacientes
- `GetStockQuery` - Consultar estoque
- `GetMonthlyExpensesQuery` - Calcular gastos mensais
- etc.

**Exemplo de uso:**
```csharp
// No Controller
var query = new GetPatientsQuery();
var result = await _mediator.Send(query);
return Ok(result);
```

## Endpoints da API

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `POST` | `/api/auth/register` | Registra novo usuário | Não |
| `POST` | `/api/auth/login` | Autentica usuário e retorna JWT | Não |
| `GET` | `/api/auth/me` | Retorna dados do usuário atual | Sim |

### Pacientes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/patients` | Lista pacientes do usuário |
| `POST` | `/api/patients` | Cria novo paciente |
| `PUT` | `/api/patients/{id}` | Atualiza paciente |
| `DELETE` | `/api/patients/{id}` | Exclui paciente |
| `POST` | `/api/patients/{id}/share` | Compartilha paciente com outro representante |

### Medicamentos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/medications` | Lista medicamentos |
| `POST` | `/api/medications` | Cria novo medicamento |
| `PUT` | `/api/medications/{id}` | Atualiza medicamento |
| `DELETE` | `/api/medications/{id}` | Exclui medicamento |

### Receitas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/prescriptions` | Lista receitas |
| `POST` | `/api/prescriptions/upload` | Faz upload de receita (FormData) |
| `GET` | `/api/prescriptions/{id}/file` | Baixa arquivo da receita |
| `POST` | `/api/prescriptions/{id}/process` | Processa receita e cria medicamentos |
| `DELETE` | `/api/prescriptions/{id}` | Exclui receita |

### Estoque

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/stock` | Consulta estoque de medicamentos |
| `POST` | `/api/stock/entry` | Registra entrada de estoque |
| `GET` | `/api/stock/monthly-expenses` | Calcula gastos mensais |

### Solicitações de Reposição

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/replenishment` | Lista solicitações |
| `POST` | `/api/replenishment` | Cria nova solicitação |
| `POST` | `/api/replenishment/{id}/approve` | Aprova solicitação |
| `POST` | `/api/replenishment/{id}/reject` | Rejeita solicitação |

### Cuidadores

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/caregivers` | Lista cuidadores |
| `POST` | `/api/caregivers` | Cria novo cuidador |
| `DELETE` | `/api/caregivers/{id}` | Exclui cuidador |

### Escalas de Cuidadores

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/caregiver-schedules` | Lista escalas |
| `POST` | `/api/caregiver-schedules` | Cria nova escala |
| `PUT` | `/api/caregiver-schedules/{id}` | Atualiza escala |
| `DELETE` | `/api/caregiver-schedules/{id}` | Exclui escala |

### Configurações de Alertas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/alerts/settings` | Retorna configurações de alertas |
| `PUT` | `/api/alerts/settings` | Atualiza configurações de alertas |

## Autenticação JWT

A aplicação utiliza **JWT (JSON Web Tokens)** para autenticação:

1. **Login/Register**: Retorna um token JWT
2. **Requests autenticados**: Incluem o header `Authorization: Bearer {token}`
3. **Middleware**: Valida o token em cada requisição protegida

**Configuração em `DependencyInjection.cs`:**
```csharp
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => { /* ... */ });
```

## Banco de Dados

### Entity Framework Core

- **Provider**: SQL Server
- **Migrations**: Gerenciadas via EF Core CLI
- **DbContext**: `ApplicationDbContext`

### Principais Tabelas

- `Users` - Usuários do sistema
- `Patients` - Pacientes
- `Medications` - Medicamentos
- `StockMovements` - Movimentações de estoque
- `Prescriptions` - Receitas médicas
- `Caregivers` - Cuidadores
- `CaregiverSchedules` - Escalas de cuidadores
- `Representatives` - Representantes legais
- `ReplenishmentRequests` - Solicitações de reposição
- `AlertSettings` - Configurações de alertas

### Migrations

**Criar nova migration:**
```bash
dotnet ef migrations add NomeDaMigration --project DejaBackend.Infrastructure --startup-project DejaBackend.Api
```

**Aplicar migrations:**
```bash
dotnet ef database update --project DejaBackend.Infrastructure --startup-project DejaBackend.Api
```

**Reverter migration:**
```bash
dotnet ef database update NomeDaMigrationAnterior --project DejaBackend.Infrastructure --startup-project DejaBackend.Api
```

## Armazenamento de Arquivos

### Azure Blob Storage

O sistema utiliza **Azure Blob Storage** para armazenar receitas médicas:

- **Container**: `dejacontainer`
- **Service**: `AzureBlobStorageService` implementa `IFileStorageService`
- **Upload**: Via `UploadFileAsync(IFormFile)`
- **Download**: Via `DownloadFileAsync(string filePath)`

**Configuração:**
```json
{
  "AzureStorage": {
    "ConnectionString": "DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net"
  }
}
```

## Lógica de Negócio Importante

### Cálculo de Estoque

- **CurrentStock**: Calculado dinamicamente como `soma(entradas) - soma(saídas)`
- **DaysLeft**: Calculado como `CurrentStock / DailyConsumption`
- **Status**: Baseado em thresholds configuráveis (CriticalStockThreshold, LowStockThreshold)

### Reconhecimento de Tipo de Receita

- **Service**: `PrescriptionTypeRecognizer`
- **Tecnologia**: Análise de imagens com `SixLabors.ImageSharp`
- **Método**: Heurística baseada em cores dominantes e bordas coloridas
- **Tipos**: Simple, TypeB, TypeC1, TypeC2

### Escalas de Cuidadores

- **Funcionalidade**: Define cuidador responsável por paciente em períodos específicos
- **Campos**: Dias da semana, horário de início e fim
- **Uso no Dashboard**: Identifica cuidador responsável por horário de medicação

### Gastos Mensais

- **Cálculo**: Soma de `Price` de `StockMovements` do mês atual
- **Parcelas**: Considera compras parceladas, distribuindo valor ao longo dos meses

## Swagger/OpenAPI

A documentação da API está disponível via **Swagger UI**:

- **URL**: `https://localhost:7262/swagger` (quando em execução)
- **Autenticação**: Botão "Authorize" para adicionar token JWT
- **Formato**: Digite apenas o token (sem "Bearer ")

## Desenvolvimento

### Padrões de Código

- **Clean Architecture**: Separação clara de responsabilidades
- **SOLID Principles**: Seguidos em todas as camadas
- **CQRS**: Commands para modificações, Queries para leitura
- **Repository Pattern**: Abstração de acesso a dados
- **Dependency Injection**: Configurado via `DependencyInjection.cs`

### Criando Novos Endpoints

1. **Criar Command/Query** em `DejaBackend.Application`
2. **Criar Handler** implementando `IRequestHandler<T>`
3. **Adicionar Controller** em `DejaBackend.Api/Controllers`
4. **Registrar via MediatR** (automático)

### Adicionando Novas Entidades

1. **Criar Entity** em `DejaBackend.Domain/Entities`
2. **Adicionar DbSet** em `ApplicationDbContext`
3. **Configurar mapeamento** em `OnModelCreating`
4. **Criar migration**: `dotnet ef migrations add Nome`
5. **Aplicar migration**: `dotnet ef database update`

## Deploy

### Azure App Service

O backend está configurado para deploy no **Azure App Service**:

- **Frontend**: Arquivos estáticos servidos de `frontend/build`
- **Backend**: API ASP.NET Core
- **Database**: Azure SQL Database
- **Storage**: Azure Blob Storage

**Workflow de deploy**: `.github/workflows/azure-deploy.yml`

### Configurações de Produção

- **Connection String**: Azure SQL Database
- **JWT Key**: Armazenado em Azure Key Vault ou App Settings
- **Azure Storage**: Connection String em App Settings
- **CORS**: Configurado para permitir domínio do frontend

## Troubleshooting

### Erro de Conexão com Banco

- Verifique a connection string em `appsettings.json`
- Confirme firewall do Azure SQL Database (adicionar IP)
- Teste conectividade: `telnet servidor 1433`

### Erro de Autenticação

- Verifique JWT Key em `appsettings.json`
- Confirme que o token está sendo enviado corretamente
- Verifique expiração do token

### Erro de Upload de Arquivo

- Verifique Azure Storage Connection String
- Confirme existência do container `dejacontainer`
- Verifique permissões de acesso

## Testes

### Executar Testes (se implementados)

```bash
dotnet test
```

## Dependências Principais

```xml
<PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="8.0.21" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.4" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="6.6.2" />
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.4" />
<PackageReference Include="MediatR" Version="12.x" />
<PackageReference Include="Azure.Storage.Blobs" Version="12.x" />
<PackageReference Include="SixLabors.ImageSharp" Version="3.1.6" />
```

## Contribuindo

1. Siga os padrões de Clean Architecture
2. Use CQRS para todas as operações
3. Mantenha testes unitários (quando implementados)
4. Documente código complexo
5. Siga convenções de nomenclatura do C#

---

**Desenvolvido com ❤️ para simplificar o cuidado de pacientes**
