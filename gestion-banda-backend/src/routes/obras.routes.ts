import { Router } from 'express';
import { obtenerObras, crearObra } from '../controllers/obras.controller';
import { autorizarRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', autorizarRoles(['ADMIN', 'PROFESOR', 'MUSICO']), obtenerObras);
router.post('/', autorizarRoles(['ADMIN']), crearObra);

export default router;