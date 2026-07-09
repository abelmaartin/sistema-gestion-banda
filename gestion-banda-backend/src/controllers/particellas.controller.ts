import prisma from '../config/db';
import fs from 'fs';
import path from 'path';
import cloudinary from '../config/cloudinary';
import { Request, Response } from 'express';
import { Readable } from 'stream';

export const obtenerMisPartituras = async (req: any, res: any) => {
  try {
    const usuarioId = req.usuario.id;
    
    // Novedad: Capturamos lo que el usuario escribe en el buscador (si no escribe nada, es un string vacío)
    const terminoBusqueda = req.query.q as string || '';

    const usuarioCompleto = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { instrumentoId: true, voz: true } 
    });

    if (!usuarioCompleto || !usuarioCompleto.instrumentoId) {
      return res.status(400).json({ error: 'Tu usuario no tiene ningún instrumento asignado en el sistema.' });
    }

    // 1. Tu lógica experta intacta
    const condicionesVoz = [
      { voz: usuarioCompleto.voz || 'Única' },
      { voz: 'Única' }
    ];

    if (usuarioCompleto.voz === 'Principal') {
      condicionesVoz.push({ voz: '1º' });
    }

    // NUEVA REGLA: Si es 3º o Bajo, le damos permiso para leer los papeles de 2º
    if (usuarioCompleto.voz === '3º' || usuarioCompleto.voz === 'Bajo') {
      condicionesVoz.push({ voz: '2º' });
    }

    // 2. Consulta a Prisma combinada
    const misPartituras = await prisma.particella.findMany({
      where: {
        instrumentoId: usuarioCompleto.instrumentoId,
        OR: condicionesVoz,
        obra: {
          titulo: {
            contains: terminoBusqueda,
            mode: 'insensitive' // Para que dé igual si busca "Pasodoble" o "pasodoble"
          }
        }
      },
      include: {
        obra: true 
      },
      orderBy: {
        obra: {
          titulo: 'asc'
        }
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

export const subirParticella = async (req: Request, res: Response) => {
  try {
    // 1. Verificamos que el archivero haya enviado un archivo
    if (!req.file) {
      return res.status(400).json({ error: 'Debes adjuntar un PDF.' });
    }

    const { obraId, instrumentoId, voz } = req.body;

    // 2. Función para subir el PDF desde la memoria de Node hasta Cloudinary
    const subirACloudinary = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'archivo_musical_isora', // Carpeta que se creará en tu Cloudinary
          resource_type: 'auto' // 'auto' es necesario para aceptar PDFs
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      // Inyectamos el buffer de memoria en el stream de subida
      Readable.from(req.file!.buffer).pipe(uploadStream);
    });

    // Esperamos a que Cloudinary termine y nos devuelva los datos
    const resultadoCloudinary: any = await subirACloudinary;

    // 3. Guardamos TODO en la base de datos de Neon usando Prisma
    const nuevaParticella = await prisma.particella.create({
      data: {
        voz: voz,
        // En lugar de un nombre local, guardamos la URL pública que nos dio Cloudinary
        nombreArchivo: resultadoCloudinary.secure_url, 
        obraId: parseInt(obraId),
        instrumentoId: parseInt(instrumentoId)
      }
    });

    res.status(201).json(nuevaParticella);

  } catch (error) {
    console.error('Error al subir la partitura:', error);
    res.status(500).json({ error: 'Error interno del servidor al procesar el archivo.' });
  }
};