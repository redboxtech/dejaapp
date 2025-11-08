using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace DejaBackend.Api.Models;

public class UploadPrescriptionRequest
{
    [Required]
    public IFormFile? File { get; set; }

    [Required]
    public Guid PatientId { get; set; }

    [Required]
    public int Type { get; set; }

    [Required]
    public string? IssueDate { get; set; }

    public string? DoctorName { get; set; }

    public string? DoctorCrm { get; set; }

    public string? Notes { get; set; }
}

