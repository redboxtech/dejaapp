using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DejaBackend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDosageUnitAndPresentationFormToMedication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Medications_Prescriptions_PrescriptionId",
                table: "Medications");

            migrationBuilder.AddColumn<string>(
                name: "DosageUnit",
                table: "Medications",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PresentationForm",
                table: "Medications",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

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

            migrationBuilder.AddForeignKey(
                name: "FK_Medications_Prescriptions_PrescriptionId",
                table: "Medications",
                column: "PrescriptionId",
                principalTable: "Prescriptions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Medications_Prescriptions_PrescriptionId",
                table: "Medications");

            migrationBuilder.DropColumn(
                name: "DosageUnit",
                table: "Medications");

            migrationBuilder.DropColumn(
                name: "PresentationForm",
                table: "Medications");

            migrationBuilder.AddForeignKey(
                name: "FK_Medications_Prescriptions_PrescriptionId",
                table: "Medications",
                column: "PrescriptionId",
                principalTable: "Prescriptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
