import { Sequelize } from 'sequelize-typescript';
import config from '../config/config.js';
import { User } from '../models/userModel.js';
import { VacationRequest } from '../models/vacationRequestModel.js';
import { Department } from '../models/departmentModel.js';
import { Holiday } from '../models/holidayModel.js';
import { Role } from '../models/roleModel.js';


const db = config.development;

export const sequelize = new Sequelize({
  database: db.database,
  username: db.username,
  password: db.password,
  host: db.host,
  port: db.port,
  dialect: db.dialect, // 'mysql'
  define: { timestamps: true, underscored: true },
  models: [User, VacationRequest, Department, Holiday, Role], 
  logging: process.env.NODE_ENV === 'test' ? false : console.log,
});
