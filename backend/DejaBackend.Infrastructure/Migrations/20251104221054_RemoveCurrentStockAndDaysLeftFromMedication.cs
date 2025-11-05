using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DejaBackend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCurrentStockAndDaysLeftFromMedication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Migrar estoques atuais para movimentações antes de remover as colunas
            // Criar movimentações iniciais para medicamentos que têm estoque mas não têm movimentações
            migrationBuilder.Sql(@"
                INSERT INTO StockMovements (Id, MedicationId, Type, Quantity, Date, Source, OwnerId)
                SELECT 
                    NEWID(),
                    m.Id,
                    0, -- StockMovementType.In = 0
                    m.CurrentStock,
                    GETUTCDATE(),
                    'Migração de Dados - Estoque Inicial',
                    m.OwnerId
                FROM Medications m
                WHERE m.CurrentStock > 0
                AND NOT EXISTS (
                    SELECT 1 
                    FROM StockMovements sm 
                    WHERE sm.MedicationId = m.Id 
                    AND sm.Source = 'Estoque Inicial'
                )
            ");

            migrationBuilder.DropColumn(
                name: "CurrentStock",
                table: "Medications");

            migrationBuilder.DropColumn(
                name: "DaysLeft",
                table: "Medications");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CurrentStock",
                table: "Medications",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "DaysLeft",
                table: "Medications",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
