using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DejaBackend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCaregiverColor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Verifica se a coluna já existe antes de adicionar
            migrationBuilder.Sql(@"
                IF NOT EXISTS (
                    SELECT 1 
                    FROM sys.columns 
                    WHERE object_id = OBJECT_ID(N'[dbo].[Caregivers]') 
                    AND name = 'Color'
                )
                BEGIN
                    ALTER TABLE [Caregivers] ADD [Color] nvarchar(max) NULL;
                END
            ");
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
