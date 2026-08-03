import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Importamos la función que creaste en el otro archivo
import { seedInstrumentos } from './seed-instrumentos'; 

// 1. Configuramos la conexión nativa a PostgreSQL
const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });

// 2. Envolvemos la conexión en el adaptador de Prisma
const adapter = new PrismaPg(pool);

// 3. Inicializamos el cliente inyectándole el adaptador
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando la siembra de datos (Seeding)...');

  // 1. CREAR INSTRUMENTOS (Llamando al archivo externo)
  console.log('🎺 Cargando plantilla de instrumentos...');
  await seedInstrumentos();

  console.log('✅ Base de datos poblada con éxito.');
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