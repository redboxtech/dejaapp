using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DejaBackend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAlertSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AlertSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MedicationDelayEnabled = table.Column<bool>(type: "bit", nullable: false),
                    MedicationDelayMinutes = table.Column<int>(type: "int", nullable: false),
                    MedicationDelayChannels = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LowStockEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LowStockThreshold = table.Column<int>(type: "int", nullable: false),
                    LowStockChannels = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CriticalStockEnabled = table.Column<bool>(type: "bit", nullable: false),
                    CriticalStockThreshold = table.Column<int>(type: "int", nullable: false),
                    CriticalStockChannels = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PrescriptionExpiryEnabled = table.Column<bool>(type: "bit", nullable: false),
                    PrescriptionExpiryDefaultDays = table.Column<int>(type: "int", nullable: false),
                    PrescriptionExpiryChannels = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReplenishmentRequestEnabled = table.Column<bool>(type: "bit", nullable: false),
                    ReplenishmentRequestChannels = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    QuietHoursEnabled = table.Column<bool>(type: "bit", nullable: false),
                    QuietHoursStartTime = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    QuietHoursEndTime = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlertSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AlertSettings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AlertSettings_UserId",
                table: "AlertSettings",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AlertSettings");
        }
    }
}
