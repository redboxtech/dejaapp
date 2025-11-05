using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using DejaBackend.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DejaBackend.Infrastructure.Services;

public class AzureBlobStorageService : IFileStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AzureBlobStorageService> _logger;
    private const string DefaultContainerName = "dejacontainer";

    public AzureBlobStorageService(IConfiguration configuration, ILogger<AzureBlobStorageService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        
        // Tentar diferentes formas de ler a connection string
        var connectionString = _configuration["AzureStorage:ConnectionString"] 
            ?? _configuration.GetSection("AzureStorage")["ConnectionString"]
            ?? _configuration.GetConnectionString("AzureStorage");
            
        _logger.LogDebug("Azure Storage connection string read. Length: {Length}, IsNullOrWhiteSpace: {IsNullOrWhiteSpace}", 
            connectionString?.Length ?? 0, string.IsNullOrWhiteSpace(connectionString));
            
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            _logger.LogError("Azure Storage connection string is null or empty. Available config keys: {Keys}", 
                string.Join(", ", _configuration.GetSection("AzureStorage").GetChildren().Select(c => c.Key)));
            throw new InvalidOperationException("AzureStorage:ConnectionString is not configured. Please check appsettings.json.");
        }

        // Remover espaços em branco e caracteres de nova linha que podem ter sido adicionados
        connectionString = connectionString.Trim();
        
        _logger.LogDebug("Connection string after trim. Length: {Length}, Contains AccountName: {HasAccountName}, Contains AccountKey: {HasAccountKey}", 
            connectionString.Length,
            connectionString.Contains("AccountName="),
            connectionString.Contains("AccountKey="));
        
        // Validar que a connection string contém os parâmetros necessários
        if (!connectionString.Contains("AccountName=") || !connectionString.Contains("AccountKey="))
        {
            _logger.LogError("Azure Storage connection string is missing required parameters. Connection string (first 100 chars): {ConnectionStringStart}", 
                connectionString.Substring(0, Math.Min(100, connectionString.Length)));
            throw new InvalidOperationException("Azure Storage connection string must contain AccountName and AccountKey. Please verify the connection string in appsettings.json.");
        }
        
        // Validar que todos os segmentos estão no formato "name=value"
        var segments = connectionString.Split(';', StringSplitOptions.RemoveEmptyEntries);
        foreach (var segment in segments)
        {
            var trimmedSegment = segment.Trim();
            if (!trimmedSegment.Contains('='))
            {
                throw new InvalidOperationException($"Invalid connection string segment: '{trimmedSegment}'. All segments must be in the format 'name=value'.");
            }
        }
        
        try
        {
            _blobServiceClient = new BlobServiceClient(connectionString);
            _logger.LogInformation("Azure Blob Storage client initialized successfully for account: {AccountName}", 
                connectionString.Split(';').FirstOrDefault(s => s.StartsWith("AccountName="))?.Split('=')[1] ?? "Unknown");
        }
        catch (FormatException ex)
        {
            _logger.LogError(ex, "Invalid Azure Storage connection string format. Connection string length: {Length}, Contains AccountName: {HasAccountName}, Contains AccountKey: {HasAccountKey}", 
                connectionString?.Length ?? 0,
                connectionString?.Contains("AccountName=") ?? false,
                connectionString?.Contains("AccountKey=") ?? false);
            throw new InvalidOperationException($"Invalid Azure Storage connection string format: {ex.Message}. Please verify the connection string in appsettings.json is correct.", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing Azure Blob Storage client");
            throw;
        }
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, string? containerName = null)
    {
        try
        {
            containerName ??= DefaultContainerName;
            
            // Criar container se não existir
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);

            // Gerar nome único para o arquivo (remover caracteres especiais do nome original)
            var sanitizedFileName = SanitizeFileName(fileName);
            var uniqueFileName = $"{Guid.NewGuid()}_{sanitizedFileName}";
            var blobClient = containerClient.GetBlobClient(uniqueFileName);

            // Upload do arquivo
            var blobHttpHeaders = new BlobHttpHeaders
            {
                ContentType = contentType
            };

            await blobClient.UploadAsync(fileStream, new BlobUploadOptions
            {
                HttpHeaders = blobHttpHeaders
            });

            // Retornar URL do blob
            return blobClient.Uri.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file to Azure Blob Storage");
            throw;
        }
    }

    public async Task<(Stream stream, string contentType)> DownloadFileAsync(string fileUrl, string? containerName = null)
    {
        try
        {
            containerName ??= DefaultContainerName;
            
            // Parse da URL do blob do Azure Storage
            // Formato: https://{account}.blob.core.windows.net/{container}/{blobName}
            var uri = new Uri(fileUrl);
            var pathParts = uri.AbsolutePath.TrimStart('/').Split('/');
            
            // Se a URL contém o container, usar ele; senão usar o containerName fornecido
            string blobName;
            if (pathParts.Length > 1)
            {
                // URL completa: usar o último segmento como nome do blob
                blobName = string.Join("/", pathParts.Skip(1)); // Pular o nome do container
            }
            else
            {
                // Apenas o nome do blob foi fornecido
                blobName = pathParts[0];
            }

            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            var blobClient = containerClient.GetBlobClient(blobName);

            if (!await blobClient.ExistsAsync())
            {
                throw new FileNotFoundException($"File not found: {fileUrl}");
            }

            // Obter propriedades do blob para pegar o ContentType
            var properties = await blobClient.GetPropertiesAsync();
            var contentType = properties.Value.ContentType ?? "application/octet-stream";

            // Download do arquivo
            var downloadResult = await blobClient.DownloadStreamingAsync();

            return (downloadResult.Value.Content, contentType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading file from Azure Blob Storage");
            throw;
        }
    }

    public async Task<bool> DeleteFileAsync(string fileUrl, string? containerName = null)
    {
        try
        {
            containerName ??= DefaultContainerName;
            
            // Parse da URL do blob do Azure Storage
            var uri = new Uri(fileUrl);
            var pathParts = uri.AbsolutePath.TrimStart('/').Split('/');
            
            string blobName;
            if (pathParts.Length > 1)
            {
                blobName = string.Join("/", pathParts.Skip(1));
            }
            else
            {
                blobName = pathParts[0];
            }

            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            var blobClient = containerClient.GetBlobClient(blobName);

            if (!await blobClient.ExistsAsync())
            {
                return false;
            }

            await blobClient.DeleteAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file from Azure Blob Storage");
            throw;
        }
    }

    private static string SanitizeFileName(string fileName)
    {
        // Remover caracteres especiais que podem causar problemas no Azure Blob Storage
        var invalidChars = Path.GetInvalidFileNameChars();
        var sanitized = string.Join("_", fileName.Split(invalidChars, StringSplitOptions.RemoveEmptyEntries));
        return sanitized;
    }
}

