import { Router } from 'express';
import { obtenerObras, crearObra, actualizarObra, eliminarObra } from '../controllers/obras.controller';
import { autorizarRoles } from '../middlewares/auth.middleware';
import { upload } from '../config/storage';

const router = Router();

// Rutas
router.get('/', autorizarRoles(['ADMIN', 'DIRECTOR', 'MUSICO']), obtenerObras);

// Añadimos upload.single('guionPdf') para que intercepte el archivo antes de ir al controlador
router.post('/', autorizarRoles(['ADMIN']), upload.single('guionPdf'), crearObra);
router.put('/:id', autorizarRoles(['ADMIN']), upload.single('guionPdf'), actualizarObra);
router.delete('/:id', autorizarRoles(['ADMIN']), eliminarObra);

export default router;