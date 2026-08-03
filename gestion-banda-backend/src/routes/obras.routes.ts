import { Router } from 'express';
import { obtenerObras, crearObra, actualizarObra, eliminarObra } from '../controllers/obras.controller';
import { autorizarRoles } from '../middlewares/auth.middleware'; // O como se llame tu middleware

const router = Router();

// Rutas base
router.get('/', autorizarRoles, obtenerObras);
router.post('/', autorizarRoles, crearObra);

// Nuevas rutas con el parámetro dinámico /:id
router.put('/:id',  autorizarRoles, actualizarObra);
router.delete('/:id', autorizarRoles, eliminarObra);

export default router;