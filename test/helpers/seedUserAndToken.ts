import request from 'supertest';
import bcrypt from 'bcrypt';
import { Role } from '../../src/models/roleModel';
import { User } from '../../src/models/userModel';

type Params = {
  app: any;
  deptId: number;
  locId: number;
  email?: string;
  password?: string;
  roleId?: number;   // por congruencia con vuestra semilla: 3 = employee
};

export async function seedUserAndToken({
  app,
  deptId,
  locId,
  email = 'employee@test.com',
  password = 'employee123',
  roleId = 3,
}: Params) {
  // asegura rol employee
  await Role.findOrCreate({
    where: { id: roleId },
    defaults: { id: roleId, role_name: 'employee' } as any,
  });

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    first_name: 'Employee',
    last_name: 'Test',
    email,
    password_hash: hashed,
    role_id: roleId,
    department_id: deptId,
    location_id: locId,
    available_days: 23,
  });

  const loginRes = await request(app)
    .post('/auth/login')
    .send({ email, password });

  return { token: loginRes.body.token as string, userId: user.id as number };
}
