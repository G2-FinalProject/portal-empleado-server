import { Department } from '../../models/departmentModel.js';

export async function seedDepartments() {
  console.log('Seeding departments...');

  const departments = [
    { id: 1, department_name: 'I+D', manager_id: null },
    { id: 2, department_name: 'Sistemas', manager_id: null },
    { id: 3, department_name: 'Contabilidad', manager_id: null },
    { id: 4, department_name: 'Administración', manager_id: null },
    { id: 5, department_name: 'Gestión', manager_id: null },
    { id: 6, department_name: 'Control', manager_id: null },
  ];

  for (const dept of departments) {
    await Department.findOrCreate({
      where: { id: dept.id },
      defaults: dept as any,
    });
  }

  console.log('Departments seeded successfully');
}