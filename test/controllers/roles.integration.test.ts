import request from 'supertest';
import express from 'express';
import roleRouter from '../../src/routes/roleRoutes';
import authRouter from '../../src/routes/authRoutes';
import { Role } from '../../src/models/roleModel';
import { User } from '../../src/models/userModel';
import { Department } from '../../src/models/departmentModel';
import { Location } from '../../src/models/locationModel';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/setupDatabase';
import { seedAdminAndToken } from '../helpers/seedAdminAndToken';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);
app.use('/roles', roleRouter);

describe('Roles API', () => {
  let adminToken: string;
  let roleId: number;
  let locId: number;
  let deptId: number;
  let adminUserId: number;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    await User.destroy({ where: {}, force: true });
    await Role.destroy({ where: {}, force: true });
    await Department.destroy({ where: {}, force: true });
    await Location.destroy({ where: {}, force: true });

    // Sembrar datos base y obtener token de admin
    const seedData = await seedAdminAndToken(app);
    adminToken = seedData.token;
    locId = seedData.locId;
    deptId = seedData.deptId;
    adminUserId = seedData.adminUserId;

    // Crear roles adicionales para pruebas
    const roles = await Role.bulkCreate([
  { role_name: 'manager' },
  { role_name: 'employee' },
]);

    roleId = roles[1].id; // employee
  });

  // ===== GET /roles =====
  it('GET /roles - admin debe listar todos los roles (200)', async () => {
    const res = await request(app)
      .get('/roles')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(3); // admin, manager, employee
  });

  // ===== GET /roles/:id =====
  it('GET /roles/:id - admin debe obtener un rol específico (200)', async () => {
    const res = await request(app)
      .get(`/roles/${roleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.role_name).toBe('employee');
    expect(res.body).toHaveProperty('users');
  });

  it('GET /roles/:id - debe devolver 404 si el rol no existe', async () => {
    const res = await request(app)
      .get('/roles/99999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  // ===== POST /roles =====
  it('POST /roles - admin debe crear un nuevo rol (201)', async () => {
    const res = await request(app)
      .post('/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role_name: 'tester' });

    expect([200, 201]).toContain(res.status);
    expect(res.body.role.role_name).toBe('tester');
  });

  // ===== PATCH /roles/:id =====
  it('PATCH /roles/:id - admin debe actualizar un rol existente (200)', async () => {
    const res = await request(app)
      .patch(`/roles/${roleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role_name: 'developer' });

    expect([200, 204]).toContain(res.status);
    expect(res.body.role_name).toBe('developer');
  });

  it('PATCH /roles/:id - debe devolver 404 si el rol no existe', async () => {
    const res = await request(app)
      .patch('/roles/99999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role_name: 'ghost' });

    expect(res.status).toBe(404);
  });

  // ===== DELETE /roles/:id =====
  it('DELETE /roles/:id - admin debe eliminar un rol sin usuarios asignados (200/204)', async () => {
    const roleToDelete = await Role.create({ role_name: 'tempRole' });

    const res = await request(app)
      .delete(`/roles/${roleToDelete.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect([200, 204]).toContain(res.status);
  });

  it('DELETE /roles/:id - no debe eliminar un rol con usuarios asociados (400)', async () => {
    const hashedPassword = await bcrypt.hash('user123', 10);
    const roleWithUser = await Role.create({ role_name: 'linkedRole' });

    await User.create({
      first_name: 'Empleado',
      last_name: 'Asociado',
      email: 'asociado@test.com',
      password_hash: hashedPassword,
      role_id: roleWithUser.id,
      department_id: deptId,
      location_id: locId,
      available_days: 22,
    });

    const res = await request(app)
      .delete(`/roles/${roleWithUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/usuario/);
  });

  it('DELETE /roles/:id - debe devolver 404 si el rol no existe', async () => {
    const res = await request(app)
      .delete('/roles/99999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  // ===== POST /roles/assign =====
  it('POST /roles/assign - debe asignar correctamente un rol a un usuario (200)', async () => {
    const newRole = await Role.create({ role_name: 'tester' });

    const res = await request(app)
      .post('/roles/assign')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: adminUserId, roleId: newRole.id });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/asignado correctamente/);
    expect(res.body.user.nuevoRol).toBe('tester');
  });

  it('POST /roles/assign - debe devolver 404 si el usuario no existe', async () => {
    const newRole = await Role.create({ role_name: 'ghostRole' });

    const res = await request(app)
      .post('/roles/assign')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: 99999, roleId: newRole.id });

    expect(res.status).toBe(404);
  });

  it('POST /roles/assign - debe devolver 404 si el rol no existe', async () => {
    const res = await request(app)
      .post('/roles/assign')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: adminUserId, roleId: 99999 });

    expect(res.status).toBe(404);
  });

  it('POST /roles/assign - debe devolver 400 si faltan userId o roleId', async () => {
    const res = await request(app)
      .post('/roles/assign')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: null, roleId: null });

    expect(res.status).toBe(400);
  });
});
