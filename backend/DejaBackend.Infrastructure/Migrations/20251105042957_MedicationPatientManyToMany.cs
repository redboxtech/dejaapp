using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DejaBackend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MedicationPatientManyToMany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Criar a nova tabela MedicationPatients primeiro
            migrationBuilder.CreateTable(
                name: "MedicationPatients",
                columns: table => new
                {
                    MedicationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PatientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DailyConsumption = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicationPatients", x => new { x.MedicationId, x.PatientId });
                    table.ForeignKey(
                        name: "FK_MedicationPatients_Medications_MedicationId",
                        column: x => x.MedicationId,
                        principalTable: "Medications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MedicationPatients_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MedicationPatients_PatientId",
                table: "MedicationPatients",
                column: "PatientId");

            // 2. Migrar dados existentes: para cada Medication, criar um MedicationPatient
            // usando o PatientId e DailyConsumption existentes
            migrationBuilder.Sql(@"
                INSERT INTO MedicationPatients (MedicationId, PatientId, DailyConsumption)
                SELECT Id, PatientId, DailyConsumption
                FROM Medications
                WHERE PatientId IS NOT NULL AND PatientId != '00000000-0000-0000-0000-000000000000'
            ");

            // 3. Agora remover as colunas antigas e foreign key
            migrationBuilder.DropForeignKey(
                name: "FK_Medications_Patients_PatientId",
                table: "Medications");

            migrationBuilder.DropIndex(
                name: "IX_Medications_PatientId",
                table: "Medications");

            migrationBuilder.DropColumn(
                name: "DailyConsumption",
                table: "Medications");

            migrationBuilder.DropColumn(
                name: "PatientId",
                table: "Medications");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // 1. Adicionar as colunas de volta
            migrationBuilder.AddColumn<decimal>(
                name: "DailyConsumption",
                table: "Medications",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "PatientId",
                table: "Medications",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            // 2. Migrar dados de volta: para cada Medication, pegar o primeiro MedicationPatient
            // (ou o único, já que antes era one-to-many)
            migrationBuilder.Sql(@"
                UPDATE m
                SET m.PatientId = mp.PatientId,
                    m.DailyConsumption = mp.DailyConsumption
                FROM Medications m
                INNER JOIN (
                    SELECT MedicationId, 
                           PatientId, 
                           DailyConsumption,
                           ROW_NUMBER() OVER (PARTITION BY MedicationId ORDER BY PatientId) as rn
                    FROM MedicationPatients
                ) mp ON m.Id = mp.MedicationId AND mp.rn = 1
            ");

            // 3. Criar índice e foreign key
            migrationBuilder.CreateIndex(
                name: "IX_Medications_PatientId",
                table: "Medications",
                column: "PatientId");

            migrationBuilder.AddForeignKey(
                name: "FK_Medications_Patients_PatientId",
                table: "Medications",
                column: "PatientId",
                principalTable: "Patients",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

            // 4. Remover a tabela MedicationPatients
            migrationBuilder.DropTable(
                name: "MedicationPatients");
        }
    }
}
