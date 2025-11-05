# Guia de Deploy para Azure

Este documento descreve como configurar o deploy automático do Deja App para Azure usando GitHub Actions.

## Pré-requisitos

1. **Azure App Service** criado para o backend
2. **Azure SQL Database** configurado
3. **Azure Storage Account** (para armazenamento de receitas)
4. **Secrets configurados no GitHub**

## Secrets do GitHub

Configure os seguintes secrets no repositório GitHub (Settings > Secrets and variables > Actions):

### 1. `AZURE_WEBAPP_PUBLISH_PROFILE`

- **Descrição**: Perfil de publicação do Azure App Service
- **Como obter**:
  1. Acesse o Azure Portal
  2. Vá para o App Service
  3. Clique em "Get publish profile" (Obter perfil de publicação)
  4. Copie todo o conteúdo do arquivo XML
  5. Cole como secret no GitHub

### 2. `VITE_API_URL` (Opcional)

- **Descrição**: URL da API para o frontend (usado durante o build)
- **Exemplo**: `https://deja-backend-api.azurewebsites.net`
- **Padrão**: Se não configurado, será usado `https://deja-backend-api.azurewebsites.net`

### 3. `AZURE_SQL_CONNECTION_STRING` (Opcional, para migrations automáticas)

- **Descrição**: String de conexão do Azure SQL Database
- **Como obter**:
  1. Acesse o Azure Portal
  2. Vá para o SQL Database
  3. Copie a connection string
  4. Substitua `{your_password}` pela senha real

## Configuração do Azure App Service

### 1. Configurar Connection String

No Azure Portal, vá para o App Service > Configuration > Connection strings:

```
Name: DefaultConnection
Value: [sua connection string do Azure SQL]
Type: SQLAzure
```

### 2. Configurar Application Settings

No Azure Portal, vá para o App Service > Configuration > Application settings:

```
Jwt__Key: [sua chave JWT secreta]
Jwt__Issuer: https://deja-backend-api.azurewebsites.net
Jwt__Audience: https://deja-backend-api.azurewebsites.net
AzureStorage__ConnectionString: [connection string do Azure Storage]
```

### 3. Configurar Startup Command

No Azure Portal, vá para o App Service > Configuration > General settings:

```
Always On: On
```

### 4. Configurar CORS (se necessário)

O backend já está configurado para permitir requisições do frontend. Verifique se o CORS está habilitado no `Program.cs`.

## Executar Migrations

As migrations podem ser executadas de duas formas:

### Opção 1: Manual (Recomendado)

Execute via Azure Portal ou Azure CLI:

```bash
az webapp deployment source config-zip \
  --resource-group <resource-group> \
  --name <app-name> \
  --src <publish-folder>.zip
```

Depois, execute as migrations:

```bash
dotnet ef database update \
  --project backend/DejaBackend.Infrastructure/DejaBackend.Infrastructure.csproj \
  --startup-project backend/DejaBackend.Api/DejaBackend.Api.csproj \
  --connection "sua-connection-string"
```

### Opção 2: Automática (Descomente no workflow)

Descomente as linhas de migration no arquivo `.github/workflows/azure-deploy.yml` (linhas 73-79).

## Processo de Deploy

1. **Push para main/master**: O deploy será executado automaticamente
2. **Manual**: Vá para Actions > Deploy to Azure > Run workflow

## Estrutura do Deploy

O workflow faz o seguinte:

1. **Build Frontend**:

   - Instala dependências npm
   - Build do projeto React/Vite
   - Copia arquivos para `frontend/build` e `wwwroot`

2. **Build Backend**:

   - Restaura pacotes NuGet
   - Build do projeto .NET
   - Publica aplicação

3. **Deploy**:
   - Envia tudo para o Azure App Service
   - O backend serve o frontend estático

## Troubleshooting

### Erro: "Publish profile not found"

- Verifique se o secret `AZURE_WEBAPP_PUBLISH_PROFILE` está configurado corretamente
- Rebaixe o publish profile do Azure Portal

### Erro: "Database connection failed"

- Verifique se a connection string está configurada no Azure App Service
- Verifique se o firewall do Azure SQL permite conexões do Azure Services

### Frontend não carrega

- Verifique se os arquivos foram copiados para `frontend/build`
- Verifique os logs do Azure App Service
- Verifique se o `Program.cs` está configurado para servir arquivos estáticos

### Build do frontend falha

- Verifique se o `package-lock.json` existe
- Verifique se todas as dependências estão no `package.json`
- Execute `npm ci` localmente para verificar
