-- AlterTable
ALTER TABLE "GlobalSettings" ADD COLUMN     "availableYears" INTEGER[] DEFAULT ARRAY[2023, 2024, 2025, 2026, 2027]::INTEGER[];
