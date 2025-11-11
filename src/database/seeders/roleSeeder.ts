import { Role } from '../../models/roleModel.js';

export async function seedRoles() {
  console.log('Seeding roles...');

  const roles = [
    { id: 1, role_name: 'Admin' },
    { id: 2, role_name: 'Manager' },
    { id: 3, role_name: 'Employee' },
  ];

  for (const role of roles) {
    await Role.findOrCreate({
      where: { id: role.id },
      defaults: role as any,
    });
  }

  console.log('Roles seeded successfully');
}