import { Router } from 'express';
import { obtenerMisPartituras, subirParticella, obtenerTodasParticellas, eliminarParticella } from '../controllers/particellas.controller';
import { autorizarRoles } from '../middlewares/auth.middleware';
import multer from 'multer';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/mis-partituras', autorizarRoles(['ADMIN', 'PROFESOR', 'MUSICO']), obtenerMisPartituras);
router.post('/', autorizarRoles(['ADMIN', 'PROFESOR']), upload.single('pdf'), subirParticella);

router.get('/todas', autorizarRoles(['ADMIN', 'PROFESOR']), obtenerTodasParticellas);
router.delete('/:id', autorizarRoles(['ADMIN', 'PROFESOR']), eliminarParticella);

export default router;