
import request from 'supertest';
import express from 'express';
import holidayRouter from '../../src/routes/holidayRoutes';
import authRouter from '../../src/routes/authRoutes';
import { Holiday } from '../../src/models/holidayModel';
import { Location } from '../../src/models/locationModel';
import { Role } from '../../src/models/roleModel';
import { Department } from '../../src/models/departmentModel';
import { User } from '../../src/models/userModel';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/setupDatabase';
import { seedAdminAndToken } from '../helpers/seedAdminAndToken';
import { seedUserAndToken } from '../helpers/seedUserAndToken';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);
app.use('/holidays', holidayRouter);

describe('Holidays API', () => {
  let adminToken: string;
  let employeeToken: string;
  let locId: number;
  let otherLocId: number;
  let firstHolidayId: number; 

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    // Limpiar todo
    await User.destroy({ where: {}, force: true });
    await Holiday.destroy({ where: {}, force: true });
    await Location.destroy({ where: {}, force: true });
    await Role.destroy({ where: {}, force: true });
    await Department.destroy({ where: {}, force: true });

    // Crear admin y obtener token
    const seedData = await seedAdminAndToken(app);
    adminToken = seedData.token;
    locId = seedData.locId;

    // Crear otra ubicación
    const otherLocation = await Location.create({ location_name: 'Barcelona' });
    otherLocId = otherLocation.id;

    // Crear empleado y token
    const employeeData = await seedUserAndToken({
      app,
      deptId: seedData.deptId,
      locId,
      email: 'employee@test.com',
      password: 'employee123',
      roleId: 3,
    });
    employeeToken = employeeData.token;

    // Crear holidays de prueba
    const holidays = await Holiday.bulkCreate([
      { holiday_name: 'Año Nuevo', holiday_date: new Date('2025-01-01'), location_id: locId },
      { holiday_name: 'San Juan', holiday_date: new Date('2025-06-24'), location_id: otherLocId },
    ]);

    // Guardar ID del primero
    firstHolidayId = holidays[0].id;
  });

  // ===== GET /holidays =====
  it('GET /holidays - admin debe recibir lista completa (200)', async () => {
    const res = await request(app)
      .get('/holidays')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('location');
  });

  it('GET /holidays - employee debe recibir su lista de festivos (200)', async () => {
    const res = await request(app)
      .get('/holidays')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // ===== GET /holidays/:id =====
  it('GET /holidays/:id - admin debe obtener holiday (200)', async () => {
    const res = await request(app)
      .get(`/holidays/${firstHolidayId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('holiday_name', 'Año Nuevo');
    expect(res.body).toHaveProperty('location');
  });

  it('GET /holidays/:id - employee debe poder ver un festivo (200)', async () => {
    const res = await request(app)
      .get(`/holidays/${firstHolidayId}`)
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('holiday_name');
  });

  it('GET /holidays/:id - debe devolver 404 si no existe', async () => {
    const res = await request(app)
      .get('/holidays/99999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  // ===== POST /holidays =====
  it('POST /holidays - admin debe crear holiday (201)', async () => {
    const res = await request(app)
      .post('/holidays')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        holiday_name: 'Fiesta Nacional',
        holiday_date: new Date('2025-10-12'),
        location_id: locId,
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.holiday_name).toBe('Fiesta Nacional');
    expect(res.body.location_id).toBe(locId);
  });

  it('POST /holidays - employee debe recibir 403', async () => {
    const res = await request(app)
      .post('/holidays')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        holiday_name: 'Fiesta del empleado',
        holiday_date: new Date('2025-08-15'),
        location_id: locId,
      });

    expect(res.status).toBe(403);
  });

  it('POST /holidays - debe rechazar duplicado (400)', async () => {
    const res = await request(app)
      .post('/holidays')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        holiday_name: 'Año Nuevo duplicado',
        holiday_date: new Date('2025-01-01'),
        location_id: locId,
      });

    expect(res.status).toBe(400);
  });

  // ===== PATCH /holidays/:id =====
  it('PATCH /holidays/:id - admin debe actualizar (200)', async () => {
    const res = await request(app)
      .patch(`/holidays/${firstHolidayId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ holiday_name: 'Año Nuevo Actualizado' });

    expect([200, 204]).toContain(res.status);
  });

  it('PATCH /holidays/:id - employee debe recibir 403', async () => {
    const res = await request(app)
      .patch(`/holidays/${firstHolidayId}`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ holiday_name: 'Cambio prohibido' });

    expect(res.status).toBe(403);
  });

  it('PATCH /holidays/:id - debe devolver 404 si no existe', async () => {
    const res = await request(app)
      .patch('/holidays/99999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ holiday_name: 'Inexistente' });

    expect(res.status).toBe(404);
  });

  // ===== DELETE /holidays/:id =====
  it('DELETE /holidays/:id - admin debe eliminar holiday (200/204)', async () => {
    const holiday = await Holiday.create({
      holiday_name: 'Eliminar Test',
      holiday_date: new Date('2025-11-01'),
      location_id: locId,
    });

    const res = await request(app)
      .delete(`/holidays/${holiday.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect([200, 204]).toContain(res.status);
  });

  it('DELETE /holidays/:id - employee debe recibir 403', async () => {
    const holiday = await Holiday.create({
      holiday_name: 'No autorizado',
      holiday_date: new Date('2025-09-01'),
      location_id: locId,
    });

    const res = await request(app)
      .delete(`/holidays/${holiday.id}`)
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(403);
  });

  it('DELETE /holidays/:id - debe devolver 404 si no existe', async () => {
    const res = await request(app)
      .delete('/holidays/99999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
