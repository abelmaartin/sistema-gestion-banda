import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../index';
import prisma from '../config/db';

vi.mock('../config/db', () => ({
  default: {
    obra: {
      findMany: vi.fn(),
      create: vi.fn(),
    }
  }
}));

describe('Pruebas Unitarias: Módulo de Obras', () => {
  let tokenAdmin: string;
  let tokenMusico: string;

  beforeAll(() => {
    process.env.JWT_SECRET = 'secreto_test';
    tokenAdmin = jwt.sign({ id: 1, rol: 'ADMIN' }, process.env.JWT_SECRET);
    tokenMusico = jwt.sign({ id: 2, rol: 'MUSICO' }, process.env.JWT_SECRET);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/obras: Devuelve el catálogo si el token es válido', async () => {
    vi.mocked(prisma.obra.findMany).mockResolvedValue([
      { id: 1, titulo: 'Amparito Roca', compositor: 'Jaime Texidor' } as any
    ]);

    const res = await request(app)
      .get('/api/obras')
      .set('Authorization', `Bearer ${tokenMusico}`); // Un músico puede verlas

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].titulo).toBe('Amparito Roca');
  });

  it('POST /api/obras: Bloquea (403) a un usuario con rol MUSICO', async () => {
    const res = await request(app)
      .post('/api/obras')
      .set('Authorization', `Bearer ${tokenMusico}`)
      .send({ titulo: 'Oregón', compositor: 'Jacob de Haan', genero: 'Fantasía' });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('privilegios necesarios');
    expect(prisma.obra.create).not.toHaveBeenCalled(); // Nos aseguramos de que no tocó la BD
  });

  it('POST /api/obras: Permite (201) al ADMIN crear una obra', async () => {
    vi.mocked(prisma.obra.create).mockResolvedValue({ id: 2, titulo: 'Oregón' } as any);

    const res = await request(app)
      .post('/api/obras')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ titulo: 'Oregón', compositor: 'Jacob de Haan', genero: 'Fantasía' });

    expect(res.status).toBe(201);
    expect(prisma.obra.create).toHaveBeenCalledOnce();
  });
});