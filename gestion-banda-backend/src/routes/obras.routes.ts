import { Router } from 'express';
import { obtenerObras, crearObra, actualizarObra, eliminarObra } from '../controllers/obras.controller';
import { autorizarRoles } from '../middlewares/auth.middleware';

const router = Router();

// Ejemplo: Todos pueden ver el archivo musical
router.get('/', autorizarRoles(['ADMIN', 'PROFESOR', 'MUSICO']), obtenerObras);

// Ejemplo: Solo administradores (y quizá el director) pueden gestionar obras
router.post('/', autorizarRoles(['ADMIN']), crearObra);
router.put('/:id', autorizarRoles(['ADMIN']), actualizarObra);
router.delete('/:id', autorizarRoles(['ADMIN']), eliminarObra);

export default router;