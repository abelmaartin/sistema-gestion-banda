import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

export const registrarUsuario = async (req: any, res: any) => {
  try {
    const { email, password, nombre, apellido, rol, instrumentoId, voz } = req.body;
    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });

    if (usuarioExistente) return res.status(400).json({ error: 'Este correo ya está registrado en la banda.' });

    const saltRounds = 10;
    const passwordEncriptada = await bcrypt.hash(password, saltRounds);

    const nuevoUsuario = await prisma.usuario.create({
      data: { 
        email, 
        password: passwordEncriptada, 
        nombre, 
        apellido, 
        rol: rol || 'MUSICO',
        instrumentoId: instrumentoId ? Number(instrumentoId) : null,
        voz: instrumentoId ? voz : null 
      },
    });

    // Quitamos la contraseña cuando devolvamos el usuario para que no se vea
    const { password: _, ...usuarioSinPassword } = nuevoUsuario;
    res.status(201).json(usuarioSinPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al registrar al usuario.' });
  }
};

export const loginUsuario = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas.' });

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) return res.status(401).json({ error: 'Credenciales inválidas.' });

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      mensaje: 'Login exitoso', token,
      usuario: { id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email, rol: usuario.rol }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al iniciar sesión.' });
  }
};