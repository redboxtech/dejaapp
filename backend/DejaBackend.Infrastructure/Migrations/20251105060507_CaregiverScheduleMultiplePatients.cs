using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DejaBackend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CaregiverScheduleMultiplePatients : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Criar a nova tabela CaregiverSchedulePatients primeiro
            migrationBuilder.CreateTable(
                name: "CaregiverSchedulePatients",
                columns: table => new
                {
                    CaregiverScheduleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PatientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CaregiverSchedulePatients", x => new { x.CaregiverScheduleId, x.PatientId });
                    table.ForeignKey(
                        name: "FK_CaregiverSchedulePatients_CaregiverSchedules_CaregiverScheduleId",
                        column: x => x.CaregiverScheduleId,
                        principalTable: "CaregiverSchedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CaregiverSchedulePatients_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CaregiverSchedulePatients_PatientId",
                table: "CaregiverSchedulePatients",
                column: "PatientId");

            // 2. Migrar dados existentes: para cada CaregiverSchedule, criar um CaregiverSchedulePatient
            migrationBuilder.Sql(@"
                INSERT INTO CaregiverSchedulePatients (CaregiverScheduleId, PatientId)
                SELECT Id, PatientId
                FROM CaregiverSchedules
                WHERE PatientId IS NOT NULL AND PatientId != '00000000-0000-0000-0000-000000000000'
            ");

            // 3. Remover a coluna PatientId e foreign key de CaregiverSchedules
            migrationBuilder.DropForeignKey(
                name: "FK_CaregiverSchedules_Patients_PatientId",
                table: "CaregiverSchedules");

            migrationBuilder.DropIndex(
                name: "IX_CaregiverSchedules_PatientId",
                table: "CaregiverSchedules");

            migrationBuilder.DropColumn(
                name: "PatientId",
                table: "CaregiverSchedules");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // 1. Adicionar a coluna PatientId de volta
            migrationBuilder.AddColumn<Guid>(
                name: "PatientId",
                table: "CaregiverSchedules",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            // 2. Migrar dados de volta: para cada CaregiverSchedule, pegar o primeiro CaregiverSchedulePatient
            migrationBuilder.Sql(@"
                UPDATE cs
                SET cs.PatientId = csp.PatientId
                FROM CaregiverSchedules cs
                INNER JOIN (
                    SELECT CaregiverScheduleId,
                           PatientId,
                           ROW_NUMBER() OVER (PARTITION BY CaregiverScheduleId ORDER BY PatientId) as rn
                    FROM CaregiverSchedulePatients
                ) csp ON cs.Id = csp.CaregiverScheduleId AND csp.rn = 1
            ");

            // 3. Criar índice e foreign key
            migrationBuilder.CreateIndex(
                name: "IX_CaregiverSchedules_PatientId",
                table: "CaregiverSchedules",
                column: "PatientId");

            migrationBuilder.AddForeignKey(
                name: "FK_CaregiverSchedules_Patients_PatientId",
                table: "CaregiverSchedules",
                column: "PatientId",
                principalTable: "Patients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            // 4. Remover a tabela CaregiverSchedulePatients
            migrationBuilder.DropTable(
                name: "CaregiverSchedulePatients");
        }
    }
}
