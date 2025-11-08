import dotenv from 'dotenv';
dotenv.config();

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

export default {
  development: {
    database: process.env['DB_NAME']!,
    username: process.env['USER_DB']!,
    password: process.env['PASSWORD_DB']!,
    host: process.env['HOST']!,
    port: 3306,
    dialect: process.env['DB_DIALECT'] as 'mysql',
  },

  test: {  
    database: process.env['DB_NAME']!,
    username: process.env['USER_DB']!,
    password: process.env['PASSWORD_DB']!,
    host: process.env['HOST']!,
    port: 3306,
    dialect: process.env['DB_DIALECT'] as 'mysql',
  },

  jwt: {
    jwtSecret: process.env['JWT_SECRET'] as string,
    jwtExpires: process.env['JWT_EXPIRES'] as '7d',
  },

 cors: {
    corsOrigin: process.env['CORS_ORIGIN'] as string,
  }
};

