import request from 'supertest';
import bcrypt from 'bcrypt';
import { Role } from '../../src/models/roleModel';
import { Department } from '../../src/models/departmentModel';
import { Location } from '../../src/models/locationModel';
import { User } from '../../src/models/userModel';

export async function seedAdminAndToken(app: any) {
  await Role.findOrCreate({ where: { id: 1 }, defaults: { id: 1, role_name: 'admin' } as any });
  await Role.findOrCreate({ where: { id: 2 }, defaults: { id: 2, role_name: 'manager' } as any });
  await Role.findOrCreate({ where: { id: 3 }, defaults: { id: 3, role_name: 'employee' } as any });

  const dept = await Department.create({ department_name: 'IT' });
  const loc = await Location.create({ location_name: 'Madrid' });

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await User.create({
    first_name: 'Admin',
    last_name: 'Test',
    email: 'admin@test.com',
    password_hash: hashedPassword,
    role_id: 1,
    department_id: dept.id,
    location_id: loc.id,
    available_days: 23,
  });

  const loginRes = await request(app)
    .post('/auth/login')
    .send({ email: 'admin@test.com', password: 'admin123' });

  return {
    token: loginRes.body.token,
    adminUserId: adminUser.id,
    deptId: dept.id,
    locId: loc.id,
  };
}
