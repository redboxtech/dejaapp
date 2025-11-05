using DejaBackend.Domain.Enums;

namespace DejaBackend.Application.Interfaces;

public interface IPrescriptionTypeRecognizer
{
    /// <summary>
    /// Reconhece o tipo de receita a partir de uma imagem/PDF
    /// </summary>
    /// <param name="fileStream">Stream do arquivo (imagem ou PDF)</param>
    /// <param name="fileName">Nome do arquivo</param>
    /// <param name="contentType">Tipo MIME do arquivo</param>
    /// <returns>O tipo de receita detectado, ou null se não foi possível determinar</returns>
    Task<PrescriptionType?> RecognizePrescriptionTypeAsync(Stream fileStream, string fileName, string contentType);
}

