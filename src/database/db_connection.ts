import { Sequelize } from 'sequelize-typescript';
import config from '../config/config.js';
import { User } from '../models/userModel.js';
import { VacationRequest } from '../models/vacationRequestModel.js';


const db = config.development;

export const sequelize = new Sequelize({
  database: db.database,
  username: db.username,
  password: db.password,
  host: db.host,
  port: db.port,
  dialect: db.dialect, // 'mysql'
  define: { timestamps: true, underscored: true },
  models: [User, VacationRequest], // añade tus otros modelos
  logging: process.env.NODE_ENV === 'test' ? false : console.log,
});
