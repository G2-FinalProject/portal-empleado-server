import request from 'supertest';
import express from 'express';
import authRouter from '../../src/routes/authRoutes';
import { User } from '../../src/models/userModel';
import { Role } from '../../src/models/roleModel';
import { Department } from '../../src/models/departmentModel';
import { Location } from '../../src/models/locationModel';
import { VacationRequest } from '../../src/models/vacationRequestModel';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/setupDatabase';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('POST /auth/login', () => {
  
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    // Limpia en orden correcto (primero las dependientes)
    await VacationRequest.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    await Department.destroy({ where: {}, force: true });
    await Role.destroy({ where: {}, force: true });
    await Location.destroy({ where: {}, force: true });
  });

  it('200 con token cuando credenciales correctas', async () => {
    const role = await Role.create({ role_name: 'Admin' });
    const dept = await Department.create({ department_name: 'IT' });
    const loc = await Location.create({ location_name: 'HQ' });

    const hashedPassword = await bcrypt.hash('correcta', 10);
    
    await User.create({
      first_name: 'Gabriela',
      last_name: 'Admin',
      email: 'gaby@admin.com',
      password_hash: hashedPassword,
      role_id: role.id,
      department_id: dept.id,
      location_id: loc.id,
      available_days: 20,
    });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'gaby@admin.com', password: 'correcta' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('401 cuando password incorrecta', async () => {
    const role = await Role.create({ role_name: 'Admin' });
    const dept = await Department.create({ department_name: 'IT' });
    const loc = await Location.create({ location_name: 'HQ' });

    const hashedPassword = await bcrypt.hash('correcta', 10);
    
    await User.create({
      first_name: 'Gabriela',
      last_name: 'Admin',
      email: 'gaby@admin.com',
      password_hash: hashedPassword,
      role_id: role.id,
      department_id: dept.id,
      location_id: loc.id,
      available_days: 20,
    });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'gaby@admin.com', password: 'incorrecta' });

    expect(res.status).toBe(401);
  });
});