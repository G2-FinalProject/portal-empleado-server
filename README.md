# Portal del Empleado - Backend

## Descripción
API REST para la gestión de usuarios, vacaciones, roles y festivos.

## Tecnologías
Node.js · Express · TypeScript · Sequelize · TiDB/MySQL

## Instalación
1. npm install
2. Crear archivo .env siguiendo el .env.example
3. docker-compose up o npm run dev

## Estructura de Carpetas
src/
 ┣ database/
 ┣ models/
 ┣ controllers/
 ┣ routes/
 ┣ middlewares/
 ┣ scripts/
 ┣ seeders/
 ┣ validators/
 ┣ utils/
 ┣ types/
 ┗ config/
 


## Endpoints Principales
- POST /api/auth/login
- GET /api/users
- GET /api/holidays

## Base de Datos
Explicación de relaciones y claves foráneas.

## Testing
Jest / Supertest: cómo ejecutar los tests.

## Autoras
Equipo del Bootcamp FemCoders Factoría F5
