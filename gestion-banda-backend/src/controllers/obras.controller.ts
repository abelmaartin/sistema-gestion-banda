import prisma from '../config/db';
import cloudinary from '../config/cloudinary'; // Asegúrate de que la importación coincide con tu archivo
import fs from 'fs';

export const obtenerObras = async (req: any, res: any) => {
  try {
    const catalogo = await prisma.obra.findMany({
      orderBy: { titulo: 'asc' }
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
    
    let guionUrl = null;

    // Si Multer ha interceptado un PDF...
    if (req.file) {
      // 1. Lo subimos a Cloudinary
      const resultado = await cloudinary.uploader.upload(req.file.path, {
        folder: 'guiones_banda', // Opcional: te crea una carpeta en tu cuenta de Cloudinary
        resource_type: 'auto'    // Importante para que acepte PDFs sin problema
      });
      
      // 2. Nos guardamos la URL pública y segura
      guionUrl = resultado.secure_url;
      
      // 3. Borramos el archivo temporal de tu carpeta local para no saturar el servidor
      fs.unlinkSync(req.file.path);
    }

    const nuevaObra = await prisma.obra.create({
      data: { 
        titulo, compositor, arreglista, genero, ubicacionFisica, 
        duracionEstimada: duracionEstimada ? Number(duracionEstimada) : null,
        guionUrl // Guardamos el enlace real de Cloudinary
      },
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

    const dataToUpdate: any = { 
      titulo, compositor, arreglista, genero, ubicacionFisica, 
      duracionEstimada: duracionEstimada ? Number(duracionEstimada) : null 
    };

    // Si el usuario sube un PDF nuevo al editar...
    if (req.file) {
      const resultado = await cloudinary.uploader.upload(req.file.path, {
        folder: 'guiones_banda',
        resource_type: 'auto'
      });
      
      dataToUpdate.guionUrl = resultado.secure_url;
      fs.unlinkSync(req.file.path); // Limpiamos el temporal
    }

    const obraActualizada = await prisma.obra.update({
      where: { id: Number(id) },
      data: dataToUpdate,
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
    
    // (Opcional para el futuro): Aquí podrías añadir lógica para borrar el PDF de Cloudinary también
    // usando cloudinary.uploader.destroy() si quieres mantener tu nube limpia.
    
    await prisma.obra.delete({ 
      where: { id: Number(id) } 
    });
    
    res.status(200).json({ mensaje: 'Obra eliminada del archivo correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la obra.' });
  }
};