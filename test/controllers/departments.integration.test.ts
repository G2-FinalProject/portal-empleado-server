import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import departmentRouter from '../../src/routes/departmentRoutes';
import authRouter from '../../src/routes/authRoutes';
import { Department } from '../../src/models/departmentModel';
import { User } from '../../src/models/userModel';
import { Role } from '../../src/models/roleModel';
import { Location } from '../../src/models/locationModel';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/setupDatabase';
import { seedAdminAndToken } from '../helpers/seedAdminAndToken';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);
app.use('/departments', departmentRouter);

describe('Departments API', () => {
  let adminToken: string;
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

    // Sembramos roles, admin y token
    const seeded = await seedAdminAndToken(app);
    adminToken = seeded.token;
    deptId = seeded.deptId;
    locId = seeded.locId;
  });

 
  it('GET /departments - debería listar todos los departamentos', async () => {
    const res = await request(app)
      .get('/departments')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /departments/:id - debería obtener un departamento específico', async () => {
    const res = await request(app)
      .get(`/departments/${deptId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.department_name).toBe('IT');
  });

  it('POST /departments - debería crear un nuevo departamento', async () => {
    const res = await request(app)
      .post('/departments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        department_name: 'Recursos Humanos'
        
      });
        console.log(' Response body:', res.body);

    expect([200, 201]).toContain(res.status);
    expect(res.body.department_name).toBe('Recursos Humanos');
  });


  it('PATCH /departments/:id - debería actualizar un departamento existente', async () => {
    const res = await request(app)
      .patch(`/departments/${deptId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ department_name: 'IT Renovado' });

    expect([200, 204]).toContain(res.status);
    expect(res.body.department_name).toBe('IT Renovado');
  });

  it('DELETE /departments/:id - debería eliminar un departamento sin empleados', async () => {
    const deptToDelete = await Department.create({ department_name: 'Temporal' });

    const res = await request(app)
      .delete(`/departments/${deptToDelete.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect([200, 204]).toContain(res.status);
  });

  
  it('DELETE /departments/:id - no debería eliminar un depto con empleados', async () => {
    
    const deptWithUsers = await Department.create({ department_name: 'Ventas' });

    const hashedPassword = await bcrypt.hash('test123', 10);
    await User.create({
      first_name: 'Empleado',
      last_name: 'Ejemplo',
      email: 'empleado@test.com',
      password_hash: hashedPassword,
      role_id: 3,
      department_id: deptWithUsers.id,
      location_id: locId,
      available_days: 20,
    });

    const res = await request(app)
      .delete(`/departments/${deptWithUsers.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/tiene 1 empleado/);
  });
});
