import { Router } from 'express';
import { 
  obtenerUsuarios, 
  actualizarUsuario, 
  eliminarUsuario, 
  obtenerMiPerfil, 
  cambiarMiPassword 
} from '../controllers/usuarios.controller';
import { autorizarRoles } from '../middlewares/auth.middleware';

const router = Router();

// 🟢 Rutas accesibles por CUALQUIER usuario logueado
router.get('/mi-perfil', autorizarRoles(['ADMIN', 'PROFESOR', 'MUSICO']), obtenerMiPerfil);
router.put('/mi-password', autorizarRoles(['ADMIN', 'PROFESOR', 'MUSICO']), cambiarMiPassword);

// 🔴 Rutas de Administración (Solo ADMIN)
router.get('/', autorizarRoles(['ADMIN']), obtenerUsuarios);
router.put('/:id', autorizarRoles(['ADMIN']), actualizarUsuario);
router.delete('/:id', autorizarRoles(['ADMIN']), eliminarUsuario);

export default router;