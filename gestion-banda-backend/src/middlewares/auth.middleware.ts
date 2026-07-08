import jwt from 'jsonwebtoken';

export const autorizarRoles = (rolesPermitidos: string[]) => {
  return (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token válido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; rol: string };
      req.usuario = payload;

      if (!rolesPermitidos.includes(payload.rol)) {
        return res.status(403).json({ error: 'Acceso denegado. No tienes los privilegios necesarios.' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
  };
};