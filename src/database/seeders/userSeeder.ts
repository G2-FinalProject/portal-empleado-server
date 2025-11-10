import { User } from '../../models/userModel.js';
import { Department } from '../../models/departmentModel.js';

export async function seedUsers() {
  console.log('Seeding users...');


  const hashedPassword = '$2b$10$VuuZExqDhuE6p2FyqQ7YzOunaoiWIHk8TbzVLKg3vp976kiv7Hx4m';

  const users = [
    // ==========================================
    // ADMINISTRADORES
    // ==========================================
    {
      id: 1,
      first_name: 'Ana',
      last_name: 'García',
      email: 'ana.garcia@cohispania.com',
      password_hash: hashedPassword,
      role_id: 1, // Admin
      department_id: 4, // Administración
      location_id: 1, // Madrid
      available_days: 23,
    },
    {
      id: 2,
      first_name: 'Elena',
      last_name: 'Ruiz',
      email: 'elena.ruiz@cohispania.com',
      password_hash: hashedPassword,
      role_id: 1, // Admin
      department_id: 4, // Administración
      location_id: 2, // Barcelona
      available_days: 25,
    },
    {
      id: 3,
      first_name: 'Tomás',
      last_name: 'Iglesias',
      email: 'tomas.iglesias@cohispania.com',
      password_hash: hashedPassword,
      role_id: 1, // Admin
      department_id: 4, // Administración
      location_id: 1, // Madrid
      available_days: 25,
    },

    // ==========================================
    // MANAGERS
    // ==========================================
    {
      id: 4,
      first_name: 'Carlos',
      last_name: 'Rodríguez',
      email: 'carlos.rodriguez@cohispania.com',
      password_hash: hashedPassword,
      role_id: 2, // Manager
      department_id: 1, // I+D
      location_id: 1, // Madrid
      available_days: 22,
    },
    {
      id: 5,
      first_name: 'Iván',
      last_name: 'Méndez',
      email: 'ivan.mendez@cohispania.com',
      password_hash: hashedPassword,
      role_id: 2, // Manager
      department_id: 2, // Sistemas
      location_id: 1, // Madrid
      available_days: 23,
    },
    {
      id: 6,
      first_name: 'Sofía',
      last_name: 'Rey',
      email: 'sofia.rey@cohispania.com',
      password_hash: hashedPassword,
      role_id: 2, // Manager
      department_id: 3, // Contabilidad
      location_id: 2, // Barcelona
      available_days: 22,
    },
    {
      id: 7,
      first_name: 'Javier',
      last_name: 'Fernández',
      email: 'javier.fernandez@cohispania.com',
      password_hash: hashedPassword,
      role_id: 2, // Manager
      department_id: 5, // Gestión
      location_id: 1, // Madrid
      available_days: 22,
    },
    {
      id: 8,
      first_name: 'María',
      last_name: 'Torres',
      email: 'maria.torres@cohispania.com',
      password_hash: hashedPassword,
      role_id: 2, // Manager
      department_id: 6, // Control
      location_id: 2, // Barcelona
      available_days: 23,
    },

    // ==========================================
    // EMPLOYEES - I+D
    // ==========================================
    {
      id: 9,
      first_name: 'Pablo',
      last_name: 'Moreno',
      email: 'pablo.moreno@cohispania.com',
      password_hash: hashedPassword,
      role_id: 3, // Employee
      department_id: 1, // I+D
      location_id: 1, // Madrid
      available_days: 21,
    },
    {
      id: 10,
      first_name: 'Nuria',
      last_name: 'Vega',
      email: 'nuria.vega@cohispania.com',
      password_hash: hashedPassword,
      role_id: 3, // Employee
      department_id: 1, // I+D
      location_id: 1, // Madrid
      available_days: 22,
    },
    {
      id: 11,
      first_name: 'Claudia',
      last_name: 'Pascual',
      email: 'claudia.pascual@cohispania.com',
      password_hash: hashedPassword,
      role_id: 3, // Employee
      department_id: 1, // I+D
      location_id: 2, // Barcelona
      available_days: 18,
    },

    // ==========================================
    // EMPLOYEES - Sistemas
    // ==========================================
    {
      id: 12,
      first_name: 'Sara',
      last_name: 'López',
      email: 'sara.lopez@cohispania.com',
      password_hash: hashedPassword,
      role_id: 3, // Employee
      department_id: 2, // Sistemas
      location_id: 2, // Barcelona
      available_days: 23,
    },
    {
      id: 13,
      first_name: 'Hugo',
      last_name: 'Prieto',
      email: 'hugo.prieto@cohispania.com',
      password_hash: hashedPassword,
      role_id: 3, // Employee
      department_id: 2, // Sistemas
      location_id: 2, // Barcelona
      available_days: 21,
    },

    // ==========================================
    // EMPLOYEES - Contabilidad
    // ==========================================
    {
      id: 14,
      first_name: 'David',
      last_name: 'Gómez',
      email: 'david.gomez@cohispania.com',
      password_hash: hashedPassword,
      role_id: 3, // Employee
      department_id: 3, // Contabilidad
      location_id: 1, // Madrid
      available_days: 20,
    },
    {
      id: 15,
      first_name: 'Isabel',
      last_name: 'Delgado',
      email: 'isabel.delgado@cohispania.com',
      password_hash: hashedPassword,
      role_id: 3, // Employee
      department_id: 3, // Contabilidad
      location_id: 1, // Madrid
      available_days: 23,
    },

    // ==========================================
    // EMPLOYEES - Administración
    // ==========================================
    {
      id: 16,
      first_name: 'Lucía',
      last_name: 'Romero',
      email: 'lucia.romero@cohispania.com',
      password_hash: hashedPassword,
      role_id: 3, // Employee
      department_id: 4, // Administración
      location_id: 2, // Barcelona
      available_days: 19,
    },
    {
      id: 17,
      first_name: 'Raúl',
      last_name: 'Nieto',
      email: 'raul.nieto@cohispania.com',
      password_hash: hashedPassword,
      role_id: 3, // Employee
      department_id: 4, // Administración
      location_id: 2, // Barcelona
      available_days: 19,
    },

    // ==========================================
    // EMPLOYEES - Gestión
    // ==========================================
    {
      id: 18,
      first_name: 'Andrés',
      last_name: 'Castro',
      email: 'andres.castro@cohispania.com',
      password_hash: hashedPassword,
      role_id: 3, // Employee
      department_id: 5, // Gestión
      location_id: 1, // Madrid
      available_days: 18,
    },
    {
      id: 19,
      first_name: 'Patricia',
      last_name: 'León',
      email: 'patricia.leon@cohispania.com',
      password_hash: hashedPassword,
      role_id: 3, // Employee
      department_id: 5, // Gestión
      location_id: 1, // Madrid
      available_days: 20,
    },

    // ==========================================
    // EMPLOYEES - Control
    // ==========================================
    {
      id: 20,
      first_name: 'Beatriz',
      last_name: 'Navarro',
      email: 'beatriz.navarro@cohispania.com',
      password_hash: hashedPassword,
      role_id: 3, // Employee
      department_id: 6, // Control
      location_id: 2, // Barcelona
      available_days: 23,
    },
    {
      id: 21,
      first_name: 'Álvaro',
      last_name: 'Domínguez',
      email: 'alvaro.dominguez@cohispania.com',
      password_hash: hashedPassword,
      role_id: 3, // Employee
      department_id: 6, // Control
      location_id: 2, // Barcelona
      available_days: 24,
    },
  ];

  for (const user of users) {
    await User.findOrCreate({
      where: { id: user.id },
      defaults: user as any,
    });
  }

  // Actualizar los manager_id de los departamentos
  await Department.update({ manager_id: 4 }, { where: { id: 1 } }); // Carlos -> I+D
  await Department.update({ manager_id: 5 }, { where: { id: 2 } }); // Iván -> Sistemas
  await Department.update({ manager_id: 6 }, { where: { id: 3 } }); // Sofía -> Contabilidad
  await Department.update({ manager_id: 7 }, { where: { id: 5 } }); // Javier -> Gestión
  await Department.update({ manager_id: 8 }, { where: { id: 6 } }); // María -> Control

  console.log('Users seeded successfully');
}
