import 'dotenv/config';
import express from 'express';
import authRoutes from './routes/auth.routes';
import obrasRoutes from './routes/obras.routes';
import particellasRoutes from './routes/particellas.routes';
import instrumentosRoutes from './routes/instrumentos.routes';
import usuariosRoutes from './routes/usuarios.routes';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// 👇 AMPLIAMOS EL LÍMITE AQUÍ (50mb para que no rechace PDFs tochos de 104 páginas)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/obras', obrasRoutes);
app.use('/api/particellas', particellasRoutes);
app.use('/api/instrumentos', instrumentosRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Solo levantamos el puerto si este archivo se ejecuta directamente, 
// no cuando lo importa Supertest para los tests.
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor de la banda corriendo en http://localhost:${PORT}`);
  });
}

export default app; // 👈 Clave para que Supertest pueda usarlo