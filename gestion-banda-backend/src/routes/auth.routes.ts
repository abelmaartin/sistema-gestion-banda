import { Router } from 'express';
import { registrarUsuario, loginUsuario } from '../controllers/auth.controller';
import { autorizarRoles } from '../middlewares/auth.middleware';

const router = Router();

router.post('/registro', autorizarRoles(['ADMIN']), registrarUsuario);
router.post('/login', loginUsuario);

export default router;