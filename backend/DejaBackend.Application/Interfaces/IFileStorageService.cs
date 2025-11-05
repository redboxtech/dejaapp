namespace DejaBackend.Application.Interfaces;

public interface IFileStorageService
{
    /// <summary>
    /// Faz upload de um arquivo para o Azure Blob Storage
    /// </summary>
    /// <param name="fileStream">Stream do arquivo</param>
    /// <param name="fileName">Nome do arquivo</param>
    /// <param name="contentType">Tipo de conteúdo (MIME type)</param>
    /// <param name="containerName">Nome do container (opcional, padrão: "prescriptions")</param>
    /// <returns>URL do arquivo no Azure Blob Storage</returns>
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, string? containerName = null);

    /// <summary>
    /// Faz download de um arquivo do Azure Blob Storage
    /// </summary>
    /// <param name="fileUrl">URL do arquivo no Azure Blob Storage</param>
    /// <param name="containerName">Nome do container (opcional, padrão: "prescriptions")</param>
    /// <returns>Stream do arquivo e seu tipo de conteúdo</returns>
    Task<(Stream stream, string contentType)> DownloadFileAsync(string fileUrl, string? containerName = null);

    /// <summary>
    /// Deleta um arquivo do Azure Blob Storage
    /// </summary>
    /// <param name="fileUrl">URL do arquivo no Azure Blob Storage</param>
    /// <param name="containerName">Nome do container (opcional, padrão: "prescriptions")</param>
    /// <returns>True se deletado com sucesso</returns>
    Task<bool> DeleteFileAsync(string fileUrl, string? containerName = null);
}

