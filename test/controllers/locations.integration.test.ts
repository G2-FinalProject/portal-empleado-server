import request from 'supertest';
import express from 'express';
import locationRouter from '../../src/routes/locationRoutes';
import authRouter from '../../src/routes/authRoutes';
import { User } from '../../src/models/userModel';
import { Role } from '../../src/models/roleModel';
import { Department } from '../../src/models/departmentModel';
import { Location } from '../../src/models/locationModel';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/setupDatabase';
import { seedAdminAndToken } from '../helpers/seedAdminAndToken';
import bcrypt from 'bcrypt';
import { seedUserAndToken } from '../helpers/seedUserAndToken';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);
app.use('/locations', locationRouter);

describe('Locations API', () => {
  let adminToken: string;
  let employeeToken: string;
  let locId: number;
  let deptId: number;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    await User.destroy({ where: {}, force: true });
    await Department.destroy({ where: {}, force: true });
    await Role.destroy({ where: {}, force: true });
    await Location.destroy({ where: {}, force: true });

    // Crear admin y obtener token
    const seedData = await seedAdminAndToken(app);
    adminToken = seedData.token;
    locId = seedData.locId;
    deptId = seedData.deptId;

    const employeeData = await seedUserAndToken({
      app,
      deptId,
      locId,
      email: 'employee@test.com',
      password: 'employee123',
      roleId: 3,
    });

    employeeToken = employeeData.token;
  });
  
  // ===== GET /locations =====
  it('GET /locations - admin debe recibir 200 y lista con includes', async () => {
    const res = await request(app)
      .get('/locations')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    
    // Verificar includes con alias
    if (res.body[0]) {
      expect(res.body[0]).toHaveProperty('users');
      expect(res.body[0]).toHaveProperty('holidays');
    }
  });

  it('GET /locations - employee debe recibir 403', async () => {
    const res = await request(app)
      .get('/locations')
      .set('Authorization', `Bearer ${employeeToken}`);
    
    expect(res.status).toBe(403);
  });

  // ===== GET /locations/:id =====
  it('GET /locations/:id - admin debe recibir 200 con datos e includes', async () => {
    const res = await request(app)
      .get(`/locations/${locId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.location_name).toBe('Madrid');
    expect(res.body).toHaveProperty('users');
    expect(res.body).toHaveProperty('holidays');
  });

  it('GET /locations/:id - employee debe recibir 403', async () => {
    const res = await request(app)
      .get(`/locations/${locId}`)
      .set('Authorization', `Bearer ${employeeToken}`);
    
    expect(res.status).toBe(403);
  });

  it('GET /locations/:id - debe devolver 404 cuando no existe', async () => {
    const res = await request(app)
      .get('/locations/99999')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(404);
  });

  // ===== POST /locations =====
  it('POST /locations - admin debe crear ubicación (201)', async () => {
    const res = await request(app)
      .post('/locations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        location_name: 'Barcelona',
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.location_name).toBe('Barcelona');
  });

  it('POST /locations - employee debe recibir 403', async () => {
    const res = await request(app)
      .post('/locations')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        location_name: 'Barcelona',
      });

    expect(res.status).toBe(403);
  });

  it('POST /locations - debe rechazar duplicados (400)', async () => {
    // Intentar crear ubicación con nombre existente
    const res = await request(app)
      .post('/locations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        location_name: 'Madrid',  // Ya existe
      });

    expect(res.status).toBe(400);
  });

  // ===== PATCH /locations/:id =====
  it('PATCH /locations/:id - admin debe actualizar (200/204)', async () => {
    const res = await request(app)
      .patch(`/locations/${locId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        location_name: 'Madrid Actualizado',
      });

    expect([200, 204]).toContain(res.status);
  });

  it('PATCH /locations/:id - employee debe recibir 403', async () => {
    const res = await request(app)
      .patch(`/locations/${locId}`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        location_name: 'Madrid Actualizado',
      });

    expect(res.status).toBe(403);
  });

  it('PATCH /locations/:id - debe rechazar nombre duplicado (400)', async () => {
    // Crear otra ubicación
    await Location.create({ location_name: 'Valencia' });

    // Intentar cambiar a nombre existente
    const res = await request(app)
      .patch(`/locations/${locId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        location_name: 'Valencia',  // Ya existe
      });

    expect(res.status).toBe(400);
  });

  it('PATCH /locations/:id - debe devolver 404 cuando no existe', async () => {
    const res = await request(app)
      .patch('/locations/99999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        location_name: 'NoExiste',
      });

    expect(res.status).toBe(404);
  });

  // ===== DELETE /locations/:id =====
  it('DELETE /locations/:id - admin debe eliminar (200/204)', async () => {
    const locToDelete = await Location.create({ location_name: 'Valencia' });

    const res = await request(app)
      .delete(`/locations/${locToDelete.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect([200, 204]).toContain(res.status);
  });

  it('DELETE /locations/:id - employee debe recibir 403', async () => {
    const locToDelete = await Location.create({ location_name: 'Sevilla' });

    const res = await request(app)
      .delete(`/locations/${locToDelete.id}`)
      .set('Authorization', `Bearer ${employeeToken}`);
    
    expect(res.status).toBe(403);
  });

  it('DELETE /locations/:id - debe devolver 404 cuando no existe', async () => {
    const res = await request(app)
      .delete('/locations/99999')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(404);
  });
});