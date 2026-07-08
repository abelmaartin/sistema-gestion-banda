import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// 1. Configuramos la conexión nativa a PostgreSQL
const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });

// 2. Envolvemos la conexión en el adaptador de Prisma
const adapter = new PrismaPg(pool);

// 3. Inicializamos el cliente inyectándole el adaptador
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando la siembra de datos (Seeding)...');

  // 1. CREAR INSTRUMENTOS
  // Usamos 'upsert' en lugar de 'create'. Esto significa:
  // "Busca si ya existe la Flauta Travesera. Si existe (update), no hagas nada. Si NO existe (create), créala."
  // Así evitamos errores si ejecutamos este script varias veces por accidente.
  
  const flauta = await prisma.instrumento.upsert({
    where: { nombre: 'Flauta Travesera' },
    update: {},
    create: { nombre: 'Flauta Travesera', familia: 'Viento Madera' },
  });

  const clarinete = await prisma.instrumento.upsert({
    where: { nombre: 'Clarinete' },
    update: {},
    create: { nombre: 'Clarinete', familia: 'Viento Madera' },
  });

  const tuba = await prisma.instrumento.upsert({
    where: { nombre: 'Tuba' },
    update: {},
    create: { nombre: 'Tuba', familia: 'Viento Metal' },
  });

  const caja = await prisma.instrumento.upsert({
    where: { nombre: 'Caja' },
    update: {},
    create: { nombre: 'Caja', familia: 'Percusión' },
  });

  // 2. CREAR UNA OBRA DE PRUEBA
  // Aquí usamos 'create' normal porque no le pusimos un @unique al título en el esquema.
  const obra1 = await prisma.obra.create({
    data: {
      titulo: 'Islas Canarias',
      compositor: 'Jose María Tarridas',
      genero: 'Pasodoble',
      ubicacionFisica: 'Archivo A - Caja 1',
      duracionEstimada: 180, // Segundos
    },
  });

  const obra2 = await prisma.obra.create({
    data: {
      titulo: 'Oregón',
      compositor: 'Jacob de Haan',
      genero: 'Fantasía / Poema Sinfónico',
      ubicacionFisica: 'Archivo B - Caja 3',
    },
  });

  console.log('✅ Base de datos poblada con éxito.');
  console.log(`Se han creado instrumentos como: ${flauta.nombre}, ${clarinete.nombre}...`);
  console.log(`Se han añadido las obras: ${obra1.titulo} y ${obra2.titulo}.`);
}

// Ejecutar la función principal y cerrar la conexión al terminar
main()
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });