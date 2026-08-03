import prisma from '../config/db';
import bcrypt from 'bcrypt';

// Leer todos los usuarios
export const obtenerUsuarios = async (req: any, res: any) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: { instrumento: true },
      orderBy: { nombre: 'asc' }
    });
    
    // Filtramos la contraseña por seguridad antes de enviarlo al frontend
    const usuariosSeguros = usuarios.map(({ password, ...resto }) => resto);
    res.status(200).json(usuariosSeguros);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la lista de usuarios.' });
  }
};

// Actualizar un usuario
export const actualizarUsuario = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, username, rol, instrumentoId, voz } = req.body;

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: Number(id) },
      data: {
        nombre,
        apellido,
        username,
        rol,
        voz: instrumentoId ? voz : null,
        // Si hay instrumento, conectamos. Si viene vacío, desconectamos (por si el admin deja de tocar)
        instrumento: instrumentoId ? { connect: { id: Number(instrumentoId) } } : { disconnect: true }
      }
    });

    res.status(200).json(usuarioActualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el usuario.' });
  }
};

// Eliminar un usuario
export const eliminarUsuario = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    // Si el usuario tiene particellas asignadas o algo que bloquee el borrado, Prisma dará error, 
    // pero con este diseño actual, el borrado debería ser directo.
    await prisma.usuario.delete({ where: { id: Number(id) } });
    res.status(200).json({ mensaje: 'Usuario eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el usuario.' });
  }
};

// Obtener los datos del propio usuario logueado
export const obtenerMiPerfil = async (req: any, res: any) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      include: { instrumento: true }
    });
    
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const { password, ...datosSeguros } = usuario;
    res.status(200).json(datosSeguros);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar tu perfil.' });
  }
};

// Cambiar la contraseña del usuario logueado
export const cambiarMiPassword = async (req: any, res: any) => {
  try {
    const { passwordActual, nuevaPassword } = req.body;
    
    // 1. Buscamos al usuario en la base de datos
    const usuario = await prisma.usuario.findUnique({ where: { id: req.usuario.id } });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });

    // 2. Verificamos que la contraseña actual que ha introducido sea correcta
    const esValida = await bcrypt.compare(passwordActual, usuario.password);
    if (!esValida) return res.status(400).json({ error: 'La contraseña actual es incorrecta.' });

    // 3. Encriptamos y guardamos la nueva contraseña
    const saltRounds = 10;
    const nuevaPasswordEncriptada = await bcrypt.hash(nuevaPassword, saltRounds);

    await prisma.usuario.update({
      where: { id: req.usuario.id },
      data: { password: nuevaPasswordEncriptada }
    });

    res.status(200).json({ mensaje: 'Tu contraseña ha sido actualizada con éxito.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar la contraseña.' });
  }
};