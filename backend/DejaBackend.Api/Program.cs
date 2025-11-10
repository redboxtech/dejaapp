using DejaBackend.Application;
using DejaBackend.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.FileProviders;
using Microsoft.OpenApi.Models;
using System.IO;
using System.Linq;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure Application and Infrastructure services
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// Configure Swagger/OpenAPI
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "DejaBackend API", Version = "v1" });

    // Add custom operation filter for file uploads
    c.OperationFilter<DejaBackend.Api.Filters.FileUploadOperationFilter>();

    // Configure IFormFile for Swagger
    c.MapType<IFormFile>(() => new OpenApiSchema
    {
        Type = "string",
        Format = "binary"
    });

    // Add JWT Authentication to Swagger
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "JWT Authentication",
        Description = "Enter only your JWT token (without the 'Bearer ' prefix)",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };
    c.AddSecurityDefinition(securityScheme.Reference.Id, securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, Array.Empty<string>() }
    });
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.AllowAnyOrigin() // In a real app, this should be restricted to the frontend URL
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "DejaBackend API v1");
});

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/", (HttpContext context) =>
{
    var acceptsHtml = context.Request.Headers.Accept.Any(header =>
        header.Contains("text/html", StringComparison.OrdinalIgnoreCase));

    if (acceptsHtml)
    {
        return Results.Redirect("/index.html");
    }

    return Results.Ok(new
    {
        status = "healthy",
        environment = app.Environment.EnvironmentName,
        timestamp = DateTimeOffset.UtcNow
    });
})
.WithName("RootHealthCheck");

var candidatePaths = new[]
{
    Path.Combine(app.Environment.ContentRootPath, "wwwroot"),
    Path.Combine(app.Environment.ContentRootPath, "..", "frontend", "build")
};

var spaPath = candidatePaths.FirstOrDefault(Directory.Exists);

if (spaPath != null)
{
    var fileProvider = new PhysicalFileProvider(spaPath);

    app.UseDefaultFiles(new DefaultFilesOptions
    {
        FileProvider = fileProvider,
        DefaultFileNames = new List<string> { "index.html" }
    });

    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = fileProvider,
        RequestPath = ""
    });

    app.MapFallback(() =>
        Results.File(Path.Combine(spaPath, "index.html"), "text/html"));
}
else
{
    app.Logger.LogWarning("Nenhum build do frontend encontrado. Verifique se o bundle foi gerado.");
}

app.Run();
