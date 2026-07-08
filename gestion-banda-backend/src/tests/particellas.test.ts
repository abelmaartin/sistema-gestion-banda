import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../index';
import prisma from '../config/db';

vi.mock('../config/db', () => ({
  default: {
    usuario: { findUnique: vi.fn() },
    particella: { findMany: vi.fn(), create: vi.fn() }
  }
}));

describe('Pruebas Unitarias: Módulo de Particellas', () => {
  let tokenMusico: string;

  beforeAll(() => {
    process.env.JWT_SECRET = 'secreto_test';
    tokenMusico = jwt.sign({ id: 99, rol: 'MUSICO' }, process.env.JWT_SECRET);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/particellas/mis-partituras: Error 400 si el músico no tiene instrumento asignado', async () => {
    // Simulamos que la base de datos devuelve al usuario pero con instrumentoId = null
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue({ instrumentoId: null } as any);

    const res = await request(app)
      .get('/api/particellas/mis-partituras')
      .set('Authorization', `Bearer ${tokenMusico}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('no tiene ningún instrumento asignado');
  });

  it('GET /api/particellas/mis-partituras: Devuelve las particellas correctas', async () => {
    // 1. Prisma dice que el músico toca el instrumento ID 1
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue({ instrumentoId: 1 } as any);
    
    // 2. Prisma devuelve las partituras simuladas para ese instrumento
    vi.mocked(prisma.particella.findMany).mockResolvedValue([
      { id: 1, voz: '1º', nombreArchivo: 'flauta.pdf' } as any
    ]);

    const res = await request(app)
      .get('/api/particellas/mis-partituras')
      .set('Authorization', `Bearer ${tokenMusico}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].nombreArchivo).toBe('flauta.pdf');
    // Comprobamos que el where se construyó correctamente pidiendo el instrumentoId 1
    expect(prisma.particella.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { instrumentoId: 1 }
    }));
  });
});