-- AlterEnum
ALTER TYPE "Rol" ADD VALUE 'FAMILIAR_ACADEMIA';

-- CreateTable
CREATE TABLE "Alumno" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3),
    "familiarId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alumno_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Alumno" ADD CONSTRAINT "Alumno_familiarId_fkey" FOREIGN KEY ("familiarId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
