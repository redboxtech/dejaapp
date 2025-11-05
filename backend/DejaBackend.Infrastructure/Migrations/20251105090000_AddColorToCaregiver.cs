using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DejaBackend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddColorToCaregiver : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "Caregivers",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Color",
                table: "Caregivers");
        }
    }
}


