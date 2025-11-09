import request from 'supertest';
import express from 'express';
import userRouter from '../../src/routes/userRoutes';
import authRouter from '../../src/routes/authRoutes';
import { User } from '../../src/models/userModel';
import { Role } from '../../src/models/roleModel';
import { Department } from '../../src/models/departmentModel';
import { Location } from '../../src/models/locationModel';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/setupDatabase';
import bcrypt from 'bcrypt';
import { seedAdminAndToken } from '../helpers/seedAdminAndToken';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);
app.use('/users', userRouter);

describe('Users API', () => {
  let adminToken: string;
  let adminUserId: number;
  let deptId: number;
  let locId: number;

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

    const seeded = await seedAdminAndToken(app);
    adminToken = seeded.token;
    adminUserId = seeded.adminUserId;
    deptId = seeded.deptId;
    locId = seeded.locId;
  });

  it('GET /users - debería listar todos los usuarios', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /users/:id - debería obtener un usuario específico', async () => {
    const res = await request(app)
      .get(`/users/${adminUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('admin@test.com');
  });

  it('POST /users - debería crear un nuevo usuario', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        first_name: 'Nuevo',
        last_name: 'Usuario',
        email: 'nuevo@test.com',
        password: 'Password123!',
        role_id: 3,
        department_id: deptId,
        location_id: locId,
        available_days: 23,
      });
    expect([200, 201]).toContain(res.status);
  });

  it('PATCH /users/:id - debería actualizar un usuario', async () => {
    const res = await request(app)
      .patch(`/users/${adminUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ first_name: 'AdminActualizado' });
    expect([200, 204]).toContain(res.status);
  });

  it('DELETE /users/:id - debería eliminar un usuario', async () => {
    const hashedPassword = await bcrypt.hash('test123', 10);
    const userToDelete = await User.create({
      first_name: 'Delete',
      last_name: 'Me',
      email: 'delete@test.com',
      password_hash: hashedPassword,
      role_id: 3,
      department_id: deptId,
      location_id: locId,
      available_days: 23,
    });

    const res = await request(app)
      .delete(`/users/${userToDelete.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 204]).toContain(res.status);
  });
});
