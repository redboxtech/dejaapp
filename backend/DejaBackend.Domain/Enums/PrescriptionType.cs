namespace DejaBackend.Domain.Enums;

public enum PrescriptionType
{
    Simple = 0,          // Receita simples - válida por 1 ano, pode ser reutilizada
    TypeB = 1,          // Receita tipo B (controlada) - não pode ser reutilizada, vence em 3 meses
    TypeC1 = 2,         // Receita tipo C1 (controlada especial) - não pode ser reutilizada, vence em 3 meses
    TypeC2 = 3          // Receita tipo C2 (controlada especial) - não pode ser reutilizada, vence em 3 meses
}

