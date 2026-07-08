-- CreateTable
CREATE TABLE "Obra" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "compositor" TEXT NOT NULL,
    "arreglista" TEXT,
    "genero" TEXT NOT NULL,
    "ubicacionFisica" TEXT,
    "duracionEstimada" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Obra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instrumento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "familia" TEXT NOT NULL,

    CONSTRAINT "Instrumento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Particella" (
    "id" SERIAL NOT NULL,
    "voz" TEXT NOT NULL,
    "archivoPdf" TEXT NOT NULL,
    "obraId" INTEGER NOT NULL,
    "instrumentoId" INTEGER NOT NULL,

    CONSTRAINT "Particella_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantillaImpresion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "PlantillaImpresion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetallePlantilla" (
    "id" SERIAL NOT NULL,
    "voz" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "plantillaId" INTEGER NOT NULL,
    "instrumentoId" INTEGER NOT NULL,

    CONSTRAINT "DetallePlantilla_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Instrumento_nombre_key" ON "Instrumento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Particella_obraId_instrumentoId_voz_key" ON "Particella"("obraId", "instrumentoId", "voz");

-- CreateIndex
CREATE UNIQUE INDEX "PlantillaImpresion_nombre_key" ON "PlantillaImpresion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "DetallePlantilla_plantillaId_instrumentoId_voz_key" ON "DetallePlantilla"("plantillaId", "instrumentoId", "voz");

-- AddForeignKey
ALTER TABLE "Particella" ADD CONSTRAINT "Particella_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Particella" ADD CONSTRAINT "Particella_instrumentoId_fkey" FOREIGN KEY ("instrumentoId") REFERENCES "Instrumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetallePlantilla" ADD CONSTRAINT "DetallePlantilla_plantillaId_fkey" FOREIGN KEY ("plantillaId") REFERENCES "PlantillaImpresion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetallePlantilla" ADD CONSTRAINT "DetallePlantilla_instrumentoId_fkey" FOREIGN KEY ("instrumentoId") REFERENCES "Instrumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
