import prisma from '../config/db';

export const obtenerObras = async (req: any, res: any) => {
  try {
    const catalogo = await prisma.obra.findMany({
      orderBy: { titulo: 'asc' } // Ordenamos alfabéticamente
    });
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

export const actualizarObra = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { titulo, compositor, arreglista, genero, ubicacionFisica, duracionEstimada } = req.body;

    const obraActualizada = await prisma.obra.update({
      where: { id: Number(id) },
      data: { titulo, compositor, arreglista, genero, ubicacionFisica, duracionEstimada },
    });

    res.status(200).json(obraActualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar los datos de la obra' });
  }
};

export const eliminarObra = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    await prisma.obra.delete({ 
      where: { id: Number(id) } 
    });
    
    res.status(200).json({ mensaje: 'Obra eliminada del archivo correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la obra. Es posible que tenga particellas asociadas.' });
  }
};