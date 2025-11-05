using DejaBackend.Application.Interfaces;
using DejaBackend.Application.Prescriptions.Commands.UploadPrescription;
using DejaBackend.Application.Prescriptions.Commands.ProcessPrescription;
using DejaBackend.Application.Prescriptions.Commands.DeletePrescription;
using DejaBackend.Application.Prescriptions.Queries.GetPrescriptions;
using DejaBackend.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DejaBackend.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/prescriptions")]
public class PrescriptionsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IFileStorageService _fileStorageService;
    private readonly IPrescriptionTypeRecognizer _typeRecognizer;
    private readonly ILogger<PrescriptionsController> _logger;

    public PrescriptionsController(
        IMediator mediator, 
        IFileStorageService fileStorageService,
        IPrescriptionTypeRecognizer typeRecognizer,
        ILogger<PrescriptionsController> logger)
    {
        _mediator = mediator;
        _fileStorageService = fileStorageService;
        _typeRecognizer = typeRecognizer;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetPrescriptions()
    {
        try
        {
            var query = new GetPrescriptionsQuery();
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting prescriptions");
            return BadRequest(new { message = "An error occurred while getting prescriptions." });
        }
    }

    [HttpPost("upload")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10MB max
    public async Task<IActionResult> UploadPrescription(
        [FromForm] IFormFile file,
        [FromForm] Guid patientId,
        [FromForm] int type, // PrescriptionType enum
        [FromForm] string issueDate, // "yyyy-MM-dd"
        [FromForm] string? doctorName = null,
        [FromForm] string? doctorCrm = null,
        [FromForm] string? notes = null)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "File is required." });
            }

            // Validar tipo de arquivo
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest(new { message = "Only image files (JPG, PNG) and PDF files are allowed." });
            }

            // Validar tamanho (10MB)
            if (file.Length > 10 * 1024 * 1024)
            {
                return BadRequest(new { message = "File size exceeds 10MB limit." });
            }

            // Determinar content type
            var contentType = fileExtension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".pdf" => "application/pdf",
                _ => "application/octet-stream"
            };

            // Tentar reconhecer o tipo de receita automaticamente
            PrescriptionType? detectedType = null;
            try
            {
                using (var stream = file.OpenReadStream())
                {
                    detectedType = await _typeRecognizer.RecognizePrescriptionTypeAsync(stream, file.FileName, contentType);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error during automatic prescription type recognition, using manual selection");
            }

            // Se não foi detectado automaticamente, usar o tipo informado pelo usuário
            var prescriptionType = detectedType ?? (PrescriptionType)type;

            // Upload para Azure Blob Storage
            string fileUrl;
            using (var stream = file.OpenReadStream())
            {
                fileUrl = await _fileStorageService.UploadFileAsync(stream, file.FileName, contentType, "dejacontainer");
            }

            // Parse da data
            if (!DateOnly.TryParse(issueDate, out var issueDateParsed))
            {
                return BadRequest(new { message = "Invalid issue date format. Use yyyy-MM-dd." });
            }

            // Validar enum (usar o tipo detectado ou o informado)
            if (!Enum.IsDefined(typeof(PrescriptionType), (int)prescriptionType))
            {
                return BadRequest(new { message = "Invalid prescription type." });
            }

            // Criar comando para salvar no banco
            var command = new UploadPrescriptionCommand
            {
                PatientId = patientId,
                Type = prescriptionType,
                IssueDate = issueDateParsed,
                FileName = file.FileName,
                FilePath = fileUrl, // URL do Azure Blob Storage
                FileType = contentType,
                DoctorName = doctorName,
                DoctorCrm = doctorCrm,
                Notes = notes
            };

            var prescriptionId = await _mediator.Send(command);

            return CreatedAtAction(nameof(GetPrescriptions), new { id = prescriptionId }, new { 
                id = prescriptionId, 
                fileUrl = fileUrl,
                detectedType = detectedType?.ToString() // Informar se foi detectado automaticamente
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading prescription");
            
            // Retornar mensagem específica se for uma duplicata
            if (ex.Message.Contains("já foi cadastrada") || ex.Message.Contains("already exists"))
            {
                return Conflict(new { message = ex.Message });
            }
            
            return BadRequest(new { message = ex.Message ?? "An error occurred while uploading the prescription." });
        }
    }

    [HttpGet("{id}/file")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetPrescriptionFile(Guid id)
    {
        try
        {
            // Buscar receita
            var query = new GetPrescriptionsQuery();
            var prescriptions = await _mediator.Send(query);
            var prescription = prescriptions.FirstOrDefault(p => p.Id == id);

            if (prescription == null)
            {
                return NotFound(new { message = "Prescription not found." });
            }

            // Download do arquivo do Azure Blob Storage
            var (stream, contentType) = await _fileStorageService.DownloadFileAsync(prescription.FilePath, "dejacontainer");
            
            // Converter stream para bytes
            using (var memoryStream = new MemoryStream())
            {
                await stream.CopyToAsync(memoryStream);
                var fileBytes = memoryStream.ToArray();
                return File(fileBytes, contentType, prescription.FileName);
            }
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Error getting prescription file");
            return BadRequest(new { message = "An error occurred while getting the prescription file." });
        }
    }

    [HttpPost("{id}/process")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ProcessPrescription(Guid id, [FromBody] ProcessPrescriptionCommand command)
    {
        if (id != command.PrescriptionId)
        {
            return BadRequest(new { message = "ID mismatch." });
        }

        try
        {
            var prescriptionId = await _mediator.Send(command);
            return Ok(new { message = "Medications created successfully from prescription.", prescriptionId });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Error processing prescription");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeletePrescription(Guid id)
    {
        try
        {
            var command = new DeletePrescriptionCommand(id);
            var deleted = await _mediator.Send(command);

            if (!deleted)
            {
                return NotFound(new { message = "Prescription not found." });
            }

            return Ok(new { message = "Prescription deleted successfully." });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Error deleting prescription");
            return BadRequest(new { message = ex.Message ?? "An error occurred while deleting the prescription." });
        }
    }
}

