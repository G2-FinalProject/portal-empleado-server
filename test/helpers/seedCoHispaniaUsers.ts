
import bcrypt from 'bcrypt';
import { Role } from '../../src/models/roleModel';
import { Department } from '../../src/models/departmentModel';
import { Location } from '../../src/models/locationModel';
import { User } from '../../src/models/userModel';
import { tokenFor } from '../utils';

/**
 * Crea un escenario completo de CoHispania para tests
 * 
 * Estructura:
 * - 3 Roles (Admin, Manager, Employee)
 * - 6 Departamentos (I+D, Sistemas, Contabilidad, Administración, Gestión, Control)
 * - 3 Ubicaciones (Madrid, Barcelona, Pontevedra)
 * - 7 Usuarios representativos:
 *   - 1 Admin (global)
 *   - 2 Managers (uno de I+D, uno de Sistemas)
 *   - 4 Employees (distribuidos en diferentes departamentos y ubicaciones)
 */
export async function seedCoHispaniaUsers() {
  const hashedPassword = await bcrypt.hash('CoHispania2025', 10);

  // ==========================================
  // ROLES (con IDs fijos para los middlewares)
  // ==========================================
  await Role.findOrCreate({ 
    where: { id: 1 }, 
    defaults: { id: 1, role_name: 'Admin' } as any 
  });
  await Role.findOrCreate({ 
    where: { id: 2 }, 
    defaults: { id: 2, role_name: 'Manager' } as any 
  });
  await Role.findOrCreate({ 
    where: { id: 3 }, 
    defaults: { id: 3, role_name: 'Employee' } as any 
  });

  // ==========================================
  // DEPARTAMENTOS (estructura real de CoHispania)
  // ==========================================
  const deptID = await Department.create({ department_name: 'I+D' });
  const deptSistemas = await Department.create({ department_name: 'Sistemas' });
  const deptContabilidad = await Department.create({ department_name: 'Contabilidad' });
  const deptAdministracion = await Department.create({ department_name: 'Administración' });
  const deptGestion = await Department.create({ department_name: 'Gestión' });
  const deptControl = await Department.create({ department_name: 'Control' });

  // ==========================================
  // UBICACIONES (poblaciones reales)
  // ==========================================
  const locMadrid = await Location.create({ location_name: 'Madrid' });
  const locBarcelona = await Location.create({ location_name: 'Barcelona' });
  const locPontevedra = await Location.create({ location_name: 'Pontevedra' });

  // ==========================================
  // USUARIOS
  // ==========================================

  // ADMIN - Adela (Administradora global)
  const admin = await User.create({
    first_name: 'Adela',
    last_name: 'Test',
    email: 'adela@test.com',
    password_hash: hashedPassword,
    role_id: 1, // Admin
    department_id: deptAdministracion.id,
    location_id: locMadrid.id,
    available_days: 23,
  });

  // MANAGER I+D - Manuel (Responsable de I+D en Madrid)
  const managerID = await User.create({
    first_name: 'Manuel',
    last_name: 'Test',
    email: 'manuel@test.com',
    password_hash: hashedPassword,
    role_id: 2, // Manager
    department_id: deptID.id,
    location_id: locMadrid.id,
    available_days: 22,
  });

  // MANAGER Sistemas - Mariana (Responsable de Sistemas en Barcelona)
  const managerSistemas = await User.create({
    first_name: 'Mariana',
    last_name: 'Test',
    email: 'mariana@test.com',
    password_hash: hashedPassword,
    role_id: 2, // Manager
    department_id: deptSistemas.id,
    location_id: locBarcelona.id,
    available_days: 22,
  });

  // EMPLOYEE I+D - Elena  (Empleada de I+D en Madrid)
  const employeeID = await User.create({
    first_name: 'Elena',
    last_name: 'Test',
    email: 'elena@test.com',
    password_hash: hashedPassword,
    role_id: 3, // Employee
    department_id: deptID.id,
    location_id: locMadrid.id,
    available_days: 23,
  });

  // EMPLOYEE Sistemas - Ernesto (Empleado de Sistemas en Barcelona)
  const employeeSistemas = await User.create({
    first_name: 'Ernesto',
    last_name: 'Test',
    email: 'ernesto@test.com',
    password_hash: hashedPassword,
    role_id: 3, // Employee
    department_id: deptSistemas.id,
    location_id: locBarcelona.id,
    available_days: 23,
  });

  // EMPLOYEE Contabilidad - Elisa (Empleada de Contabilidad en Pontevedra)
  const employeeContabilidad = await User.create({
    first_name: 'Elisa',
    last_name: 'Test',
    email: 'elisa@test.com',
    password_hash: hashedPassword,
    role_id: 3, // Employee
    department_id: deptContabilidad.id,
    location_id: locPontevedra.id,
    available_days: 23,
  });

  // EMPLOYEE Gestión - Eduardo (Empleado de Gestión en Madrid)
  const employeeGestion = await User.create({
    first_name: 'Eduardo',
    last_name: 'Test',
    email: 'eduardo@test.com',
    password_hash: hashedPassword,
    role_id: 3, // Employee
    department_id: deptGestion.id,
    location_id: locMadrid.id,
    available_days: 23,
  });

  // ==========================================
  // GENERAR TOKENS
  // ==========================================
  const adminToken = tokenFor({ id: admin.id, role: 1 });
  const managerIDToken = tokenFor({ id: managerID.id, role: 2 });
  const managerSistemasToken = tokenFor({ id: managerSistemas.id, role: 2 });
  const employeeIDToken = tokenFor({ id: employeeID.id, role: 3 });
  const employeeSistemasToken = tokenFor({ id: employeeSistemas.id, role: 3 });
  const employeeContabilidadToken = tokenFor({ id: employeeContabilidad.id, role: 3 });
  const employeeGestionToken = tokenFor({ id: employeeGestion.id, role: 3 });

  // ==========================================
  // RETURN - Datos organizados
  // ==========================================
  return {
    // USUARIOS (objetos completos)
    users: {
      admin,
      managerID,
      managerSistemas,
      employeeID,
      employeeSistemas,
      employeeContabilidad,
      employeeGestion,
    },

    // IDs de usuarios (para queries)
    userIds: {
      adminId: admin.id,
      managerIDId: managerID.id,
      managerSistemasId: managerSistemas.id,
      employeeIDId: employeeID.id,
      employeeSistemasId: employeeSistemas.id,
      employeeContabilidadId: employeeContabilidad.id,
      employeeGestionId: employeeGestion.id,
    },

    // DEPARTAMENTOS
    departments: {
      deptID,
      deptSistemas,
      deptContabilidad,
      deptAdministracion,
      deptGestion,
      deptControl,
    },

    // IDs de departamentos
    departmentIds: {
      deptIDId: deptID.id,
      deptSistemasId: deptSistemas.id,
      deptContabilidadId: deptContabilidad.id,
      deptAdministracionId: deptAdministracion.id,
      deptGestionId: deptGestion.id,
      deptControlId: deptControl.id,
    },

    // UBICACIONES
    locations: {
      locMadrid,
      locBarcelona,
      locPontevedra,
    },

    // IDs de ubicaciones
    locationIds: {
      locMadridId: locMadrid.id,
      locBarcelonaId: locBarcelona.id,
      locPontevedraId: locPontevedra.id,
    },

    // TOKENS (listos para usar en Authorization headers)
    tokens: {
      adminToken,
      managerIDToken,
      managerSistemasToken,
      employeeIDToken,
      employeeSistemasToken,
      employeeContabilidadToken,
      employeeGestionToken,
    },
  };
}
