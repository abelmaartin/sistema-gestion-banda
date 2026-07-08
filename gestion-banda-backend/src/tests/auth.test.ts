import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../index';
import prisma from '../config/db';

vi.mock('../config/db', () => ({
  default: {
    usuario: {
      findUnique: vi.fn(),
      create: vi.fn(),
    }
  }
}));

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  }
}));

describe('Pruebas Unitarias: Módulo de Autenticación (Auth)', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- TESTS DE LOGIN ---
  it('Login: Error 401 si el email no existe', async () => {
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue(null);
    const res = await request(app).post('/api/auth/login').send({ email: 'x@x.com', password: '123' });
    expect(res.status).toBe(401);
  });

  it('Login: JWT (200) si las credenciales son correctas', async () => {
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue({ id: 1, email: 'x@x.com', password: 'hash', rol: 'MUSICO' } as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    
    // Necesitamos definir el secreto para que jwt.sign no falle en el controlador
    process.env.JWT_SECRET = 'secreto_test'; 

    const res = await request(app).post('/api/auth/login').send({ email: 'x@x.com', password: '123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  // --- TESTS DE REGISTRO ---
  it('Registro: Error 400 si el email ya existe', async () => {
    // Simulamos que un usuario ADMIN hace la petición
    process.env.JWT_SECRET = 'secreto_test';
    const importJwt = await import('jsonwebtoken');
    const tokenAdmin = importJwt.sign({ id: 1, rol: 'ADMIN' }, process.env.JWT_SECRET);

    // Prisma dice que el correo ya está ocupado
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue({ id: 2, email: 'ocupado@banda.com' } as any);

    const res = await request(app)
      .post('/api/auth/registro')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ email: 'ocupado@banda.com', password: '123', nombre: 'Test', apellido: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('ya está registrado');
  });

  it('Registro: Crea el usuario (201) correctamente', async () => {
    process.env.JWT_SECRET = 'secreto_test';
    const importJwt = await import('jsonwebtoken');
    const tokenAdmin = importJwt.sign({ id: 1, rol: 'ADMIN' }, process.env.JWT_SECRET);

    vi.mocked(prisma.usuario.findUnique).mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue('hash_seguro' as never);
    vi.mocked(prisma.usuario.create).mockResolvedValue({
      id: 2, email: 'nuevo@banda.com', nombre: 'Test', apellido: 'Test', rol: 'MUSICO'
    } as any); // Nótese que NO devolvemos la contraseña aquí simulando el borrado

    const res = await request(app)
      .post('/api/auth/registro')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ email: 'nuevo@banda.com', password: '123', nombre: 'Test', apellido: 'Test' });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('nuevo@banda.com');
    expect(prisma.usuario.create).toHaveBeenCalledOnce();
  });
});