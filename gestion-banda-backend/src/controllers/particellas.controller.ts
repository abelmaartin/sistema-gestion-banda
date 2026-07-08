import prisma from '../config/db';
import fs from 'fs';
import path from 'path';

export const obtenerMisPartituras = async (req: any, res: any) => {
  try {
    const usuarioId = req.usuario.id;
    
    const usuarioCompleto = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { instrumentoId: true, voz: true } 
    });

    if (!usuarioCompleto || !usuarioCompleto.instrumentoId) {
      return res.status(400).json({ error: 'Tu usuario no tiene ningún instrumento asignado en el sistema.' });
    }

    // 1. Preparamos las condiciones base (su voz exacta y los papeles generales)
    const condicionesVoz = [
      { voz: usuarioCompleto.voz || 'Única' },
      { voz: 'Única' }
    ];

    // 2. Lógica experta: Si es el Principal, le damos acceso también a las partituras de 1º
    if (usuarioCompleto.voz === 'Principal') {
      condicionesVoz.push({ voz: '1º' });
    }

    // 3. Hacemos la consulta a Prisma
    const misPartituras = await prisma.particella.findMany({
      where: {
        instrumentoId: usuarioCompleto.instrumentoId,
        OR: condicionesVoz
      },
      include: {
        obra: true 
      }
    });

    res.status(200).json(misPartituras);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tus partituras.' });
  }
};

export const obtenerTodasParticellas = async (req: any, res: any) => {
  try {
    const todas = await prisma.particella.findMany({
      include: { obra: true, instrumento: true }
    });
    res.status(200).json(todas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el archivo completo.' });
  }
};

export const eliminarParticella = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    // 1. Buscamos la particella para saber el nombre del archivo
    const particella = await prisma.particella.findUnique({ where: { id: Number(id) } });
    if (!particella) return res.status(404).json({ error: 'Partitura no encontrada.' });

    // 2. Borramos el archivo físico del servidor
    const rutaArchivo = path.join(__dirname, '../../archivos_musicales', particella.nombreArchivo);
    if (fs.existsSync(rutaArchivo)) {
      fs.unlinkSync(rutaArchivo);
    }

    // 3. Borramos el registro de la base de datos PostgreSQL
    await prisma.particella.delete({ where: { id: Number(id) } });

    res.status(200).json({ mensaje: 'Partitura eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la partitura.' });
  }
};

export const subirParticella = async (req: any, res: any) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Por favor, selecciona un archivo PDF válido.' });

    const { voz, obraId, instrumentoId } = req.body;
    const nuevaParticella = await prisma.particella.create({
      data: {
        nombreArchivo: req.file.filename,
        voz,
        obraId: parseInt(obraId),
        instrumentoId: parseInt(instrumentoId)
      }
    });

    res.status(201).json({ mensaje: 'Partitura subida y registrada con éxito', particella: nuevaParticella });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar la subida de la partitura.' });
  }
};