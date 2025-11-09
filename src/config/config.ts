// src/config/config.ts
import 'dotenv/config';

function requireEnv(key: string): string {
  const v = process.env[key];
  if (!v || v.trim() === '') {
    throw new Error(`Missing required env: ${key}`);
  }
  return v;
}

const config = {
  development: {
    database: requireEnv('DB_NAME'),
    username: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
    host: requireEnv('DB_HOST'),
    port: parseInt(process.env.DB_PORT || '4000', 10),
    dialect: (process.env.DB_DIALECT || 'mysql') as 'mysql',
  },
  jwt: {
    jwtSecret: requireEnv('JWT_SECRET'),
    jwtExpires: process.env.JWT_EXPIRES || '7d',
  },
  cors: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
};

export default config;
