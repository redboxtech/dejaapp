-- Script para adicionar a coluna Color à tabela Caregivers
-- Execute este script diretamente no banco de dados SQL Server

IF NOT EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Caregivers]') 
    AND name = 'Color'
)
BEGIN
    ALTER TABLE [Caregivers] ADD [Color] nvarchar(max) NULL;
    PRINT 'Coluna Color adicionada com sucesso!';
END
ELSE
BEGIN
    PRINT 'Coluna Color já existe na tabela Caregivers.';
END

