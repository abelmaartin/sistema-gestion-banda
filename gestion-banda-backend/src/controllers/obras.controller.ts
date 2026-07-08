import prisma from '../config/db';

export const obtenerObras = async (req: any, res: any) => {
  try {
    const catalogo = await prisma.obra.findMany();
    res.status(200).json(catalogo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al obtener las obras del archivo' });
  }
};

export const crearObra = async (req: any, res: any) => {
  try {
    const { titulo, compositor, arreglista, genero, ubicacionFisica, duracionEstimada } = req.body;
    const nuevaObra = await prisma.obra.create({
      data: { titulo, compositor, arreglista, genero, ubicacionFisica, duracionEstimada },
    });
    res.status(201).json(nuevaObra);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar la nueva obra en el archivo' });
  }
};