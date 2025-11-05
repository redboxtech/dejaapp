using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DejaBackend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateExistingMedicationsWithDosageUnitAndPresentationForm : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Atualizar registros existentes: inferir DosageUnit e PresentationForm do Unit antigo
            // Se Unit for "mg", "g", "ml", "mcg", "ui" -> é DosageUnit, PresentationForm = "comprimido" (padrão)
            // Se Unit for "comprimido", "capsula", "gotas", etc. -> é PresentationForm, DosageUnit = "mg" (padrão)
            migrationBuilder.Sql(@"
                UPDATE Medications 
                SET DosageUnit = CASE 
                    WHEN Unit IN ('mg', 'g', 'ml', 'mcg', 'ui') THEN Unit
                    ELSE 'mg'
                END,
                PresentationForm = CASE 
                    WHEN Unit IN ('comprimido', 'capsula', 'gotas', 'aplicacao', 'inalacao', 'ampola', 'xarope', 'suspensao') THEN Unit
                    ELSE 'comprimido'
                END
                WHERE DosageUnit = '' OR PresentationForm = '';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
