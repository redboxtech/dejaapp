using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DejaBackend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemovePosologyFromMedication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Adicionar colunas de posologia em MedicationPatients primeiro
            migrationBuilder.AddColumn<string>(
                name: "CustomFrequency",
                table: "MedicationPatients",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Frequency",
                table: "MedicationPatients",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "HasTapering",
                table: "MedicationPatients",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsExtra",
                table: "MedicationPatients",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsHalfDose",
                table: "MedicationPatients",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "PrescriptionId",
                table: "MedicationPatients",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Times",
                table: "MedicationPatients",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateOnly>(
                name: "TreatmentEndDate",
                table: "MedicationPatients",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "TreatmentStartDate",
                table: "MedicationPatients",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<int>(
                name: "TreatmentType",
                table: "MedicationPatients",
                type: "int",
                nullable: false,
                defaultValue: 0);

            // 2. Migrar dados de posologia de Medications para MedicationPatients
            migrationBuilder.Sql(@"
                UPDATE mp
                SET mp.Frequency = m.Frequency,
                    mp.Times = m.Times,
                    mp.IsHalfDose = m.IsHalfDose,
                    mp.CustomFrequency = m.CustomFrequency,
                    mp.IsExtra = m.IsExtra,
                    mp.TreatmentType = m.TreatmentType,
                    mp.TreatmentStartDate = m.TreatmentStartDate,
                    mp.TreatmentEndDate = m.TreatmentEndDate,
                    mp.HasTapering = m.HasTapering,
                    mp.PrescriptionId = m.PrescriptionId
                FROM MedicationPatients mp
                INNER JOIN Medications m ON mp.MedicationId = m.Id
                WHERE m.Frequency IS NOT NULL
            ");

            // 3. Remover colunas de posologia da tabela Medications
            migrationBuilder.DropForeignKey(
                name: "FK_Medications_Prescriptions_PrescriptionId",
                table: "Medications");

            migrationBuilder.DropIndex(
                name: "IX_Medications_PrescriptionId",
                table: "Medications");

            migrationBuilder.DropColumn(
                name: "CustomFrequency",
                table: "Medications");

            migrationBuilder.DropColumn(
                name: "Frequency",
                table: "Medications");

            migrationBuilder.DropColumn(
                name: "HasTapering",
                table: "Medications");

            migrationBuilder.DropColumn(
                name: "IsExtra",
                table: "Medications");

            migrationBuilder.DropColumn(
                name: "IsHalfDose",
                table: "Medications");

            migrationBuilder.DropColumn(
                name: "PrescriptionId",
                table: "Medications");

            migrationBuilder.DropColumn(
                name: "Times",
                table: "Medications");

            migrationBuilder.DropColumn(
                name: "TreatmentEndDate",
                table: "Medications");

            migrationBuilder.DropColumn(
                name: "TreatmentStartDate",
                table: "Medications");

            migrationBuilder.DropColumn(
                name: "TreatmentType",
                table: "Medications");

            // 4. Criar índice e foreign key para PrescriptionId em MedicationPatients
            migrationBuilder.CreateIndex(
                name: "IX_MedicationPatients_PrescriptionId",
                table: "MedicationPatients",
                column: "PrescriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_MedicationPatients_Prescriptions_PrescriptionId",
                table: "MedicationPatients",
                column: "PrescriptionId",
                principalTable: "Prescriptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // 1. Adicionar colunas de posologia de volta em Medications
            migrationBuilder.AddColumn<string>(
                name: "CustomFrequency",
                table: "Medications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Frequency",
                table: "Medications",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "HasTapering",
                table: "Medications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsExtra",
                table: "Medications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsHalfDose",
                table: "Medications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "PrescriptionId",
                table: "Medications",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Times",
                table: "Medications",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateOnly>(
                name: "TreatmentEndDate",
                table: "Medications",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "TreatmentStartDate",
                table: "Medications",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<int>(
                name: "TreatmentType",
                table: "Medications",
                type: "int",
                nullable: false,
                defaultValue: 0);

            // 2. Migrar dados de posologia de MedicationPatients para Medications
            migrationBuilder.Sql(@"
                UPDATE m
                SET m.Frequency = mp.Frequency,
                    m.Times = mp.Times,
                    m.IsHalfDose = mp.IsHalfDose,
                    m.CustomFrequency = mp.CustomFrequency,
                    m.IsExtra = mp.IsExtra,
                    m.TreatmentType = mp.TreatmentType,
                    m.TreatmentStartDate = mp.TreatmentStartDate,
                    m.TreatmentEndDate = mp.TreatmentEndDate,
                    m.HasTapering = mp.HasTapering,
                    m.PrescriptionId = mp.PrescriptionId
                FROM Medications m
                INNER JOIN (
                    SELECT MedicationId,
                           Frequency,
                           Times,
                           IsHalfDose,
                           CustomFrequency,
                           IsExtra,
                           TreatmentType,
                           TreatmentStartDate,
                           TreatmentEndDate,
                           HasTapering,
                           PrescriptionId,
                           ROW_NUMBER() OVER (PARTITION BY MedicationId ORDER BY PatientId) as rn
                    FROM MedicationPatients
                ) mp ON m.Id = mp.MedicationId AND mp.rn = 1
            ");

            // 3. Criar índice e foreign key para PrescriptionId em Medications
            migrationBuilder.CreateIndex(
                name: "IX_Medications_PrescriptionId",
                table: "Medications",
                column: "PrescriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Medications_Prescriptions_PrescriptionId",
                table: "Medications",
                column: "PrescriptionId",
                principalTable: "Prescriptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

            // 4. Remover colunas de posologia de MedicationPatients
            migrationBuilder.DropForeignKey(
                name: "FK_MedicationPatients_Prescriptions_PrescriptionId",
                table: "MedicationPatients");

            migrationBuilder.DropIndex(
                name: "IX_MedicationPatients_PrescriptionId",
                table: "MedicationPatients");

            migrationBuilder.DropColumn(
                name: "CustomFrequency",
                table: "MedicationPatients");

            migrationBuilder.DropColumn(
                name: "Frequency",
                table: "MedicationPatients");

            migrationBuilder.DropColumn(
                name: "HasTapering",
                table: "MedicationPatients");

            migrationBuilder.DropColumn(
                name: "IsExtra",
                table: "MedicationPatients");

            migrationBuilder.DropColumn(
                name: "IsHalfDose",
                table: "MedicationPatients");

            migrationBuilder.DropColumn(
                name: "PrescriptionId",
                table: "MedicationPatients");

            migrationBuilder.DropColumn(
                name: "Times",
                table: "MedicationPatients");

            migrationBuilder.DropColumn(
                name: "TreatmentEndDate",
                table: "MedicationPatients");

            migrationBuilder.DropColumn(
                name: "TreatmentStartDate",
                table: "MedicationPatients");

            migrationBuilder.DropColumn(
                name: "TreatmentType",
                table: "MedicationPatients");

            migrationBuilder.AddForeignKey(
                name: "FK_MedicationPatients_Patients_PatientId",
                table: "MedicationPatients",
                column: "PatientId",
                principalTable: "Patients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
