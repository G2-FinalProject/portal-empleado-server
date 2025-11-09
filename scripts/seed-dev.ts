import 'dotenv/config';
import { sequelize } from '../src/database/db_connection.js';
import { Role } from '../src/models/roleModel.js';
import { Location } from '../src/models/locationModel.js';
import { Department } from '../src/models/departmentModel.js';
import { User } from '../src/models/userModel.js';
import bcrypt from 'bcrypt';

async function main() {
  await sequelize.authenticate();

  const [adminRole] = await Role.findOrCreate({ where: { role_name: 'admin' } });
  const [mgrRole] = await Role.findOrCreate({ where: { role_name: 'manager' } });
  const [empRole] = await Role.findOrCreate({ where: { role_name: 'employee' } });

  const [loc] = await Location.findOrCreate({ where: { location_name: 'Madrid' } });
  const [dep] = await Department.findOrCreate({ where: { department_name: 'IT' } });

  const password_hash = await bcrypt.hash('Admin1234!', 10);
  await User.findOrCreate({
    where: { email: 'admin@empresa.com' },
    defaults: {
      first_name: 'Admin',
      last_name: 'Portal',
      password_hash,
      role_id: adminRole.id,
      department_id: dep.id,
      location_id: loc.id,
      available_days: 22,
    },
  });

  console.log('✓ Seed ok');
  await sequelize.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
