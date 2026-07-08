-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'MUSICO', 'PROFESOR');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'MUSICO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "instrumentoId" INTEGER,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_instrumentoId_fkey" FOREIGN KEY ("instrumentoId") REFERENCES "Instrumento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
