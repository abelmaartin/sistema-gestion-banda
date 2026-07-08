import { Router } from 'express';
import prisma from '../config/db';
import { autorizarRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', autorizarRoles(['ADMIN', 'PROFESOR', 'MUSICO']), async (req, res) => {
  try {
    const instrumentos = await prisma.instrumento.findMany();
    res.status(200).json(instrumentos);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar instrumentos' });
  }
});

export default router;