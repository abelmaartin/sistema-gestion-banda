import 'dotenv/config';
import prisma from '../src/config/db';

// Le cambiamos el nombre a la función y le añadimos "export"
export async function seedInstrumentos() {
  const cantidad = await prisma.instrumento.count();
  
  if (cantidad > 1) {
    console.log('⚠️ Los instrumentos ya están registrados en la base de datos.');
    return;
  }

  const instrumentos = [
    // Viento Madera
    { nombre: 'Flautín', familia: 'Viento Madera' },
    { nombre: 'Flauta', familia: 'Viento Madera' },
    { nombre: 'Oboe', familia: 'Viento Madera' },
    { nombre: 'Requinto', familia: 'Viento Madera' },
    { nombre: 'Clarinete', familia: 'Viento Madera' },
    { nombre: 'Clarinete Bajo', familia: 'Viento Madera' },
    { nombre: 'Saxofón Alto', familia: 'Viento Madera' },
    { nombre: 'Saxofón Tenor', familia: 'Viento Madera' },
    { nombre: 'Saxofón Barítono', familia: 'Viento Madera' },
    
    // Viento Metal
    { nombre: 'Trompeta', familia: 'Viento Metal' },
    { nombre: 'Trompa', familia: 'Viento Metal' },
    { nombre: 'Trombón', familia: 'Viento Metal' },
    { nombre: 'Bombardino', familia: 'Viento Metal' },
    { nombre: 'Tuba', familia: 'Viento Metal' },
    
    // Percusión y Cuerda
    { nombre: 'Percusión', familia: 'Percusión' },
  ];

  await prisma.instrumento.createMany({
    data: instrumentos,
  });

  console.log('✅ ¡Toda la plantilla de instrumentos ha sido creada con éxito!');
}