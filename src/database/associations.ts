// src/db/associateModels.ts
import { User } from '../models/userModel.js';
import { VacationRequest } from '../models/vacationRequestModel.js';
import { Department } from '../models/departmentModel.js';
import { Role } from '../models/roleModel.js';
import { Location } from '../models/locationModel.js';
import { Holiday } from '../models/holidayModel.js';

export function associateModels(_sequelize: unknown) {
  // User ↔ Role
  Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
  User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

  // User ↔ Department
  Department.hasMany(User, { foreignKey: 'department_id', as: 'users' });
  User.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

  // User ↔ Location
  Location.hasMany(User, { foreignKey: 'location_id', as: 'users' });
  User.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });

  // Department.manager (manager_id → users.id)
  Department.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });
  User.hasMany(Department, { foreignKey: 'manager_id', as: 'manager' });

  // Holiday ↔ Location
  Location.hasMany(Holiday, { foreignKey: 'location_id', as: 'holidays' });
  Holiday.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });

  // VacationRequest ↔ User (requester)
  User.hasMany(VacationRequest, { foreignKey: 'requester_id', as: 'vacation_requests' });
  VacationRequest.belongsTo(User, { foreignKey: 'requester_id', as: 'requester' });
}
