import { Sequelize } from 'sequelize-typescript';
import config from '../config/config.js';
import { User } from '../models/userModel.js';
import { VacationRequest } from '../models/vacationRequestModel.js';
import { Department } from '../models/departmentModel.js';
import { Holiday } from '../models/holidayModel.js';
import { Role } from '../models/roleModel.js';
import { Location } from '../models/locationModel.js';
import { associateModels } from './associations.js';


const env = process.env.NODE_ENV ?? 'development';
const cfg = (config as any)[env] ?? (config as any).development;

export const sequelize = new Sequelize({
  models: [User, VacationRequest, Department, Holiday, Role, Location],

  database: cfg.database,
  username: cfg.username,
  password: cfg.password,
  host: cfg.host,
  port: cfg.port,
  dialect: cfg.dialect, // 'mysql'
  define: { timestamps: true, underscored: true },

  logging: cfg.logging ?? false,
  logQueryParameters: cfg.logQueryParameters ?? false,
});


export async function initDb() {
  await sequelize.authenticate();
  // asociaciones DESPUÉS de addModels y ANTES de sync:
  associateModels(sequelize);
  await sequelize.sync();
}
export async function resetDb() {
  const { models } = sequelize;
  await Promise.all(Object.values(models).map((m: any) => m.truncate({ cascade: true })));
}
export async function closeDb() {
  await sequelize.close();
}