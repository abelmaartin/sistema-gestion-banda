/*
  Warnings:

  - You are about to drop the column `archivoPdf` on the `Particella` table. All the data in the column will be lost.
  - Added the required column `nombreArchivo` to the `Particella` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Particella` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Particella_obraId_instrumentoId_voz_key";

-- AlterTable
ALTER TABLE "Particella" DROP COLUMN "archivoPdf",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nombreArchivo" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
