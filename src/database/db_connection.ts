import { Sequelize } from 'sequelize-typescript';
import config from '../config/config.js';
import { User } from '../models/userModel.js';
import { VacationRequest } from '../models/vacationRequestModel.js';
import { Department } from '../models/departmentModel.js';
import { Holiday } from '../models/holidayModel.js';
import { Role } from '../models/roleModel.js';
import { Location } from '../models/locationModel.js';


// const db = config.development;

const env = (process.env.NODE_ENV || 'development') as 'development' | 'test';


const db = config[env]; 

if (!db) {
  throw new Error(`Configuración para el entorno '${env}' no encontrada.`);
}

export const sequelize = new Sequelize({
  database: db.database,
  username: db.username,
  password: db.password,
  host: db.host,
  port: db.port,
  dialect: db.dialect, // 'mysql'
  define: { timestamps: true, underscored: true },
  models: [User, VacationRequest, Department, Holiday, Role, Location], 
  logging: process.env.NODE_ENV === 'test' ? false : console.log,
});
