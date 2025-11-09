import { Sequelize } from 'sequelize-typescript';
import config from '../config/config.js';
import { User } from '../models/userModel.js';
import { VacationRequest } from '../models/vacationRequestModel.js';
import { Department } from '../models/departmentModel.js';
import { Holiday } from '../models/holidayModel.js';
import { Role } from '../models/roleModel.js';
import { Location } from '../models/locationModel.js';
import mysql2 from 'mysql2'; // 👈 Añadido: TiDB usa el driver mysql2

const db = config.development;

export const sequelize = new Sequelize({
  database: db.database,
  username: db.username,
  password: db.password,
  host: db.host,
  port: db.port,
  dialect: db.dialect, // 'mysql'
  dialectModule: mysql2 as any, // 👈 Importante para compatibilidad con TiDB
  define: { timestamps: true, underscored: true },
  models: [User, VacationRequest, Department, Holiday, Role, Location],

  // 🔐 CONFIGURACIÓN SSL PARA TiDB CLOUD
  dialectOptions: {
    ssl: {
      // En TiDB Cloud Serverless, TLS es obligatorio
      // "require: true" fuerza conexión segura
      // "rejectUnauthorized: true" valida el cert de Let's Encrypt (recomendado)
      require: true,
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2',
    },
  },

  logging:
    process.env.NODE_ENV === 'test'
      ? false
      : console.log, // puedes comentar esto si el log te molesta
  logQueryParameters: true,
  pool: { max: 5, min: 0, idle: 10000 },
});
