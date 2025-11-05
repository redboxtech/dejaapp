using Microsoft.AspNetCore.Http;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Linq;

namespace DejaBackend.Api.Filters;

public class FileUploadOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var formParameters = context.ApiDescription.ParameterDescriptions
            .Where(p => p.Source.Id == "Form" || 
                       p.Source.Id == "FormFile" ||
                       p.Source == Microsoft.AspNetCore.Mvc.ModelBinding.BindingSource.Form)
            .ToList();

        if (formParameters.Any())
        {
            // Remover parâmetros de form dos parâmetros da operação
            operation.Parameters = operation.Parameters
                .Where(p => !formParameters.Any(fp => fp.Name == p.Name))
                .ToList();

            // Criar RequestBody para multipart/form-data
            operation.RequestBody = new OpenApiRequestBody
            {
                Content = new Dictionary<string, OpenApiMediaType>
                {
                    ["multipart/form-data"] = new OpenApiMediaType
                    {
                        Schema = new OpenApiSchema
                        {
                            Type = "object",
                            Properties = new Dictionary<string, OpenApiSchema>(),
                            Required = new HashSet<string>()
                        }
                    }
                }
            };

            var schema = operation.RequestBody.Content["multipart/form-data"].Schema;

            // Adicionar cada parâmetro de formulário ao schema
            foreach (var param in formParameters)
            {
                OpenApiSchema paramSchema;

                if (param.ModelMetadata?.ModelType == typeof(IFormFile))
                {
                    paramSchema = new OpenApiSchema
                    {
                        Type = "string",
                        Format = "binary",
                        Description = "File upload"
                    };
                }
                else
                {
                    paramSchema = context.SchemaGenerator.GenerateSchema(
                        param.ModelMetadata?.ModelType ?? typeof(string),
                        context.SchemaRepository);
                }

                schema.Properties[param.Name] = paramSchema;

                // Marcar como obrigatório se necessário
                if (param.IsRequired)
                {
                    schema.Required.Add(param.Name);
                }
            }
        }
    }
}

