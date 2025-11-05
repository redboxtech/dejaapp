using DejaBackend.Application.Interfaces;
using DejaBackend.Domain.Enums;
using Microsoft.Extensions.Logging;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;

namespace DejaBackend.Infrastructure.Services;

/// <summary>
/// Serviço para reconhecimento automático do tipo de receita a partir de imagens/PDFs
/// Usa análise visual da imagem: cores, padrões e layout
/// </summary>
public class PrescriptionTypeRecognizer : IPrescriptionTypeRecognizer
{
    private readonly ILogger<PrescriptionTypeRecognizer> _logger;

    public PrescriptionTypeRecognizer(ILogger<PrescriptionTypeRecognizer> logger)
    {
        _logger = logger;
    }

    public async Task<PrescriptionType?> RecognizePrescriptionTypeAsync(Stream fileStream, string fileName, string contentType)
    {
        try
        {
            // Se for PDF, não podemos processar diretamente sem bibliotecas especiais
            if (contentType == "application/pdf")
            {
                _logger.LogWarning("PDF files are not yet supported for automatic type recognition. User will need to select manually.");
                return null;
            }

            // Analisar imagem
            fileStream.Position = 0; // Reset stream position
            using var image = await Image.LoadAsync<Rgb24>(fileStream);
            
            // 1. Análise de cores (receitas coloridas têm cores específicas)
            var colorAnalysis = await AnalyzeImageColorsAsync(image);
            
            // 2. Análise de padrões visuais
            var patternAnalysis = AnalyzeVisualPatterns(image);
            
            // 3. Combinar resultados
            var detectedType = DetermineTypeFromAnalysis(colorAnalysis, patternAnalysis);

            if (detectedType.HasValue)
            {
                _logger.LogInformation("Detected prescription type: {Type} for file {FileName}", detectedType, fileName);
            }
            else
            {
                _logger.LogInformation("Could not automatically detect prescription type for file {FileName}. User will need to select manually.", fileName);
            }

            return detectedType;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recognizing prescription type from file {FileName}", fileName);
            return null; // Retornar null em caso de erro - o usuário pode selecionar manualmente
        }
    }

    private async Task<ColorAnalysis> AnalyzeImageColorsAsync(Image<Rgb24> image)
    {
        var analysis = new ColorAnalysis();
        
        try
        {
            // Analisar uma amostra de pixels (não todos para performance)
            var sampleSize = Math.Min(5000, image.Width * image.Height);
            var step = Math.Max(1, (image.Width * image.Height) / sampleSize);
            
            int blueCount = 0;
            int yellowCount = 0;
            int whiteCount = 0;
            int totalSamples = 0;

            // Amostrar pixels de forma distribuída pela imagem
            for (int y = 0; y < image.Height; y += (int)Math.Sqrt(step))
            {
                for (int x = 0; x < image.Width; x += (int)Math.Sqrt(step))
                {
                    var pixel = image[x, y];
                    
                    // Verificar se é azul (Tipo B - receitas azuis)
                    if (IsBlueColor(pixel))
                    {
                        blueCount++;
                    }
                    // Verificar se é amarelo (Tipo C1/C2 - receitas amarelas)
                    else if (IsYellowColor(pixel))
                    {
                        yellowCount++;
                    }
                    // Verificar se é branco/neutro (Simples)
                    else if (IsWhiteOrNeutral(pixel))
                    {
                        whiteCount++;
                    }
                    
                    totalSamples++;
                }
            }

            if (totalSamples > 0)
            {
                analysis.BluePercentage = (double)blueCount / totalSamples * 100;
                analysis.YellowPercentage = (double)yellowCount / totalSamples * 100;
                analysis.WhitePercentage = (double)whiteCount / totalSamples * 100;
                analysis.HasDominantColor = analysis.BluePercentage > 8 || analysis.YellowPercentage > 8;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing image colors");
        }

        return analysis;
    }

    private bool IsBlueColor(Rgb24 pixel)
    {
        // Verificar se o pixel tem predominância de azul
        // Receitas tipo B geralmente têm uma cor azul característica (RGB: aproximadamente R<100, G<150, B>200)
        return pixel.B > pixel.R + 40 && 
               pixel.B > pixel.G + 30 && 
               pixel.B > 150 &&
               pixel.R < 120 &&
               pixel.G < 160;
    }

    private bool IsYellowColor(Rgb24 pixel)
    {
        // Verificar se o pixel tem predominância de amarelo
        // Receitas tipo C1/C2 geralmente têm uma cor amarela característica (RGB: aproximadamente R>200, G>200, B<150)
        return pixel.R > 200 && 
               pixel.G > 200 && 
               pixel.B < 150 && 
               Math.Abs(pixel.R - pixel.G) < 30;
    }

    private bool IsWhiteOrNeutral(Rgb24 pixel)
    {
        // Verificar se o pixel é branco ou neutro (receita simples geralmente é branca)
        return pixel.R > 240 && pixel.G > 240 && pixel.B > 240;
    }

    private PatternAnalysis AnalyzeVisualPatterns(Image<Rgb24> image)
    {
        var analysis = new PatternAnalysis();
        
        try
        {
            // Analisar bordas e áreas específicas da imagem
            // Receitas controladas geralmente têm bordas coloridas ou áreas destacadas
            
            // Analisar bordas (primeiras 5% e últimas 5% da imagem)
            var borderWidth = Math.Max(10, image.Width / 20);
            var borderHeight = Math.Max(10, image.Height / 20);
            
            int borderBlueCount = 0;
            int borderYellowCount = 0;
            int borderSamples = 0;

            // Analisar borda superior
            for (int y = 0; y < borderHeight && y < image.Height; y++)
            {
                for (int x = 0; x < image.Width; x += 5)
                {
                    var pixel = image[x, y];
                    if (IsBlueColor(pixel)) borderBlueCount++;
                    if (IsYellowColor(pixel)) borderYellowCount++;
                    borderSamples++;
                }
            }

            // Analisar borda inferior
            for (int y = Math.Max(0, image.Height - borderHeight); y < image.Height; y++)
            {
                for (int x = 0; x < image.Width; x += 5)
                {
                    var pixel = image[x, y];
                    if (IsBlueColor(pixel)) borderBlueCount++;
                    if (IsYellowColor(pixel)) borderYellowCount++;
                    borderSamples++;
                }
            }

            // Analisar bordas laterais
            for (int x = 0; x < borderWidth && x < image.Width; x++)
            {
                for (int y = 0; y < image.Height; y += 5)
                {
                    var pixel = image[x, y];
                    if (IsBlueColor(pixel)) borderBlueCount++;
                    if (IsYellowColor(pixel)) borderYellowCount++;
                    borderSamples++;
                }
            }

            for (int x = Math.Max(0, image.Width - borderWidth); x < image.Width; x++)
            {
                for (int y = 0; y < image.Height; y += 5)
                {
                    var pixel = image[x, y];
                    if (IsBlueColor(pixel)) borderBlueCount++;
                    if (IsYellowColor(pixel)) borderYellowCount++;
                    borderSamples++;
                }
            }

            if (borderSamples > 0)
            {
                analysis.BorderBluePercentage = (double)borderBlueCount / borderSamples * 100;
                analysis.BorderYellowPercentage = (double)borderYellowCount / borderSamples * 100;
                analysis.HasColoredBorders = analysis.BorderBluePercentage > 5 || analysis.BorderYellowPercentage > 5;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing visual patterns");
        }

        return analysis;
    }

    private PrescriptionType? DetermineTypeFromAnalysis(ColorAnalysis colorAnalysis, PatternAnalysis patternAnalysis)
    {
        // Lógica de decisão baseada na análise de cores e padrões
        
        // Prioridade 1: Bordas coloridas (receitas controladas geralmente têm bordas coloridas)
        if (patternAnalysis.HasColoredBorders)
        {
            // Se há predominância de azul nas bordas, provavelmente é Tipo B
            if (patternAnalysis.BorderBluePercentage > 10 && patternAnalysis.BorderBluePercentage > patternAnalysis.BorderYellowPercentage)
            {
                return PrescriptionType.TypeB;
            }

            // Se há predominância de amarelo nas bordas, provavelmente é Tipo C1 ou C2
            if (patternAnalysis.BorderYellowPercentage > 10 && patternAnalysis.BorderYellowPercentage > patternAnalysis.BorderBluePercentage)
            {
                // Por padrão, vamos retornar C1 (mais comum)
                // Para diferenciar C1 de C2 seria necessário análise mais complexa ou OCR
                return PrescriptionType.TypeC1;
            }
        }

        // Prioridade 2: Análise geral de cores
        // Se há predominância de azul na imagem, provavelmente é Tipo B
        if (colorAnalysis.BluePercentage > 12 && colorAnalysis.BluePercentage > colorAnalysis.YellowPercentage)
        {
            return PrescriptionType.TypeB;
        }

        // Se há predominância de amarelo na imagem, provavelmente é Tipo C1 ou C2
        if (colorAnalysis.YellowPercentage > 12 && colorAnalysis.YellowPercentage > colorAnalysis.BluePercentage)
        {
            // Por padrão, vamos retornar C1
            return PrescriptionType.TypeC1;
        }

        // Se é principalmente branco/neutro e não tem cores dominantes, provavelmente é Simples
        if (colorAnalysis.WhitePercentage > 75 && !colorAnalysis.HasDominantColor && !patternAnalysis.HasColoredBorders)
        {
            return PrescriptionType.Simple;
        }

        // Se não conseguiu determinar com certeza, retorna null
        // O usuário pode selecionar manualmente
        return null;
    }

    private class ColorAnalysis
    {
        public double BluePercentage { get; set; }
        public double YellowPercentage { get; set; }
        public double WhitePercentage { get; set; }
        public bool HasDominantColor { get; set; }
    }

    private class PatternAnalysis
    {
        public double BorderBluePercentage { get; set; }
        public double BorderYellowPercentage { get; set; }
        public bool HasColoredBorders { get; set; }
    }
}

