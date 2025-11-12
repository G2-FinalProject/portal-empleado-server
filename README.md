# Vacation Portal - Cohispania Server

API para la gestión de solicitudes de vacaciones de empleados, desarrollada como proyecto final del bootcamp de Factoría F5. Sistema multi-rol (admin/manager/employee) con autenticación JWT, validaciones y testing de integración.

---

## Descripción General

**Vacation Portal** permite a los empleados solicitar vacaciones, a los managers aprobarlas/rechazarlas según su departamento, y a los administradores gestionar todo el sistema.

### Roles y permisos:

| Rol          | Permisos principales      | Acciones permitidas                                                                                                | Nivel de acceso                            |
| ------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| **Admin**    | Gestión total del sistema | Crear/editar/eliminar usuarios, departamentos, ubicaciones y festivos. Ver y gestionar todas las solicitudes.      | **Global** (todas las áreas y ubicaciones) |
| **Manager**  | Supervisión y aprobación  | Ver solicitudes **solo del departamento que gestiona**. Aprobar o rechazar solicitudes dejando comentario.         | **Departamental**                          |
| **Employee** | Solicitud personal        | Crear solicitudes de vacaciones, consultar estado y su saldo de días disponibles. Ver festivos según su ubicación. | **Individual**                             |

El sistema permite crear ubicaciones y asociar festivos específicos a cada una, con el fin de restar automáticamente los días festivos del cómputo de días solicitados. Los usuarios pertenecen a un departamento y a una ubicación, lo que permite aplicar reglas de negocio como la aprobación jerárquica y la disponibilidad de festivos según sede.

Cada usuario cuenta con un saldo anual de días disponibles, que se descuenta automáticamente cuando una solicitud es aprobada. Tanto los empleados como los managers pueden añadir comentarios contextualizados en el flujo.

Posibles mejoras futuras:
— Automatizar el “reset” anual o por ciclo de los días disponibles de cada empleado, con un cron job o evento programado.
— Implementar un módulo de “carry-over” para permitir acumular días no usados entre años, con reglas de negocio personalizadas.

---

## Stack Tecnológico

- **Runtime**: Node.js 
- **Framework**: Express 5
- **Lenguaje**: TypeScript
- **ORM**: Sequelize + Sequelize-TypeScript (decoradores)
- **Base de datos**: MySQL 
- **Testing**: Jest + Supertest (integración)
- **Autenticación**: JWT (jsonwebtoken)
- **Validación**: express-validator
- **Otros**: dotenv, CORS, helmet, bcrypt

---

## 📁 Estructura del Proyecto
```
portal-empleado-server/
├── src/
│   ├── app.ts                    # Configuración de Express (middlewares, rutas)
│   ├── server.ts                 # Punto de entrada (DB + servidor HTTP)
│   ├── config/
│   │   └── config.ts             # Variables de entorno por ambiente
│   ├── controllers/              # Lógica de negocio
│   ├── database/
│   │   ├── db_connection.ts      # Instancia de Sequelize
│   │   └── associations.ts       # Relaciones entre modelos
│   ├── middlewares/              # Auth, validación, errores
│   ├── models/                   # Modelos Sequelize-TypeScript
│   ├── routes/                   # Definición de endpoints
│   ├── types/                    # Interfaces TypeScript
│   ├── utils/  
│   └── validators/               # Validaciones con express-validator
├── test/
│   ├── controllers/              # Tests de integración
│   └── helpers/                  # Utilidades (seedAdminAndToken, setupDatabase...)
├── .env                          # Variables de entorno (desarrollo)
├── .env.test                     # Variables para testing
├── .git.ignore                   # Asegura que archivos sensibles y generados automáticamente no se versionen.
├── docker-compose.yml
├── Dockerfile
├── jest.config.cjs               # Configuración de Jest
├── tsconfig.json                 # Configuración de TypeScript
└── package.json
```

### Diferencia entre `app.ts` y `server.ts`:

- **`app.ts`**: Exporta la aplicación Express configurada (middlewares, rutas). No inicia el servidor.
- **`server.ts`**: Importa `app.ts`, conecta a la base de datos, registra asociaciones y arranca el servidor HTTP.

---

## 🗄️ Modelo de Datos

### Diagrama de relaciones:
```
users (empleados)
├── role_id          → roles (admin/manager/employee)
├── department_id    → departments
├── location_id      → locations
└── available_days   (días de vacaciones disponibles)

vacation_requests (solicitudes)
├── requester_id         → users (quien solicita)
├── start_date / end_date
├── requested_days
├── request_status       (pending / approved / rejected)
├── requester_comment    ← Comentario del empleado al crear la solicitud
└── approver_comment     ← Comentario del manager/admin al aprobar/rechazar

departments
└── manager_id       → users (manager del departamento)

holidays (festivos por ubicación)
└── location_id      → locations
```

### Campos clave de comentarios:

- **`requester_comment`**: Texto opcional del empleado al crear la solicitud (ej: "Vacaciones de Navidad").
- **`approver_comment`**: Texto opcional del manager/admin al aprobar/rechazar (ej: "Aprobado por necesidad de proyecto").

---

## Configuración Local

### Prerrequisitos:

- Node.js 18+ y npm
- MySQL en ejecución
- Git

### 1. Clonar el repositorio:
```bash
git clone https://github.com/G2-FinalProject/portal-empleado-server.git
cd portal-empleado-server
```

### 2. Instalar dependencias:
```bash
npm install
```

### 3. Configurar variables de entorno:

Crea `.env` en la raíz del proyecto:
```bash
# Base de datos
DB_NAME=vacation_portal
USER_DB=root
PASSWORD_DB=tu_password_mysql
HOST=localhost
DB_DIALECT=mysql

# Autenticación
JWT_SECRET=tu_secret_jwt_super_seguro_aqui
JWT_EXPIRES=7d

# Servidor
PORT=3000
CORS_ORIGIN=http://localhost:5173

# Logs (opcional)
NODE_ENV=development
```

Para testing, crea `.env.test`:
```bash
DB_NAME=vacation_portal_test
USER_DB=root
PASSWORD_DB=tu_password_mysql
HOST=localhost
DB_DIALECT=mysql
JWT_SECRET=test_secret
PORT=3001
```

### 4. Crear la base de datos:
```sql
CREATE DATABASE vacation_portal;
CREATE DATABASE vacation_portal_test;
```

### 5. Iniciar el servidor:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`.

**Primera ejecución**: Sequelize crea las tablas automáticamente (`sync()`). Puedes cargar datos iniciales manualmente o con un script de seeders.

---

## 🧪 Testing

### Ejecutar tests:
```bash
# Todos los tests
npm test

# Con cobertura
npm run test:coverage

# Modo watch (solo archivos cambiados)
npm run test:watch
```

### Configuración de testing:

- **Base de datos separada**: Los tests usan `vacation_portal_test` (definida en `.env.test`).
- **Limpieza automática**: Cada test limpia los datos con `beforeEach` para aislamiento.
- **Helpers**:
  - `setupTestDatabase()`: Inicializa la DB de test.
  - `cleanupTestDatabase()`: Cierra la conexión.
  - `seedAdminAndToken(app)`: Crea un admin y devuelve su token JWT.

### Problemas conocidos (Jest + ES Modules):

#### 1. Error: `Cannot use import statement outside a module`

**Solución**: Asegúrate de tener en `jest.config.cjs`:
```javascript
module.exports = {
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
```

#### 2. Error: `ReferenceError: Cannot access 'User' before initialization`

Causa: Importaciones circulares entre modelos.
Solución en este proyecto:

Mantén los modelos “limpios” (sin import de otros modelos).

Define las asociaciones en src/database/associations.ts.

Orden correcto en el boot:
Cuando hagas include, usa el as que declaraste en las asociaciones:

```

include: [
  { model: User, as: 'users' },
  { model: Holiday, as: 'holidays' },
]
```

#### 3. Error: `Jest has detected open handles`

**Causa**: Conexiones de Sequelize no cerradas.

**Solución**: Usa `afterAll` en tus tests:
```typescript
afterAll(async () => {
  await cleanupTestDatabase();
});
```

---

## Docker

### Requisitos:

- Docker 20+
- Docker Compose 2+

### Archivo `docker-compose.yml` (ejemplo):
```yaml
version: '3.8'

services:
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: vacation_portal
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DB_NAME: vacation_portal
      USER_DB: root
      PASSWORD_DB: rootpassword
      HOST: db
      DB_DIALECT: mysql
      JWT_SECRET: docker_secret
      CORS_ORIGIN: http://localhost:5173
    depends_on:
      - db
    command: npm run dev

volumes:
  mysql_data:
```

### Uso:
```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Detener
docker-compose down

# Limpiar todo (incluye volúmenes)
docker-compose down -v
```

### Primera ejecución:

1. Espera a que MySQL esté listo (~10-15 segundos).
2. Sequelize creará las tablas automáticamente.
3. Carga datos iniciales (roles, locations) manualmente o con seeders.

---

## Guía Rápida de la API

### Flujo de autenticación:

1. **Login**: `POST /auth/login` → Devuelve token JWT.
2. **Incluir token** en headers: `Authorization: Bearer <token>`.
3. El middleware `requireAuth` valida el token en cada petición protegida.

### Ejemplos de Endpoints:

#### 1. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@test.com",
    "role": { "id": 1, "role_name": "admin" }
  }
}
```

---

#### 2. Listar Locations (Admin)
```bash
curl -X GET http://localhost:3000/locations \
  -H "Authorization: Bearer <tu_token>"
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "location_name": "Madrid",
    "users": [...],
    "holidays": [...]
  }
]
```

---

#### 3. Crear Location (Admin)
```bash
curl -X POST http://localhost:3000/locations \
  -H "Authorization: Bearer <tu_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "location_name": "Barcelona"
  }'
```

---

#### 4. Crear Solicitud de Vacaciones (Employee)
```bash
curl -X POST http://localhost:3000/vacations/request \
  -H "Authorization: Bearer <tu_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2025-07-20",
    "end_date": "2025-07-30",
    "requested_days": 10,
    "requester_comment": "Vacaciones de verano"
  }'
```

**Respuesta:**
```json
{
  "id": 5,
  "requester_id": 3,
  "start_date": "2025-07-20",
  "end_date": "2025-07-30",
  "requested_days": 10,
  "request_status": "pending",
  "requester_comment": "Vacaciones de verano",
  "approver_comment": null,
  "created_at": "2025-11-10T10:30:00.000Z"
}
```

---

#### 5. Aprobar Solicitud (Manager/Admin)
```bash
curl -X PATCH http://localhost:3000/vacations/request/5 \
  -H "Authorization: Bearer <tu_token_manager>" \
  -H "Content-Type: application/json" \
  -d '{
    "request_status": "approved",
    "approver_comment": "Aprobado, disfruta tus vacaciones"
  }'
```

**Efecto**: 
- `request_status` → `approved`
- `available_days` del empleado se reduce en 10
- `approver_comment` se guarda

---

#### 6. Rechazar Solicitud (Manager/Admin)
```bash
curl -X PATCH http://localhost:3000/vacations/request/5 \
  -H "Authorization: Bearer <tu_token_manager>" \
  -H "Content-Type: application/json" \
  -d '{
    "request_status": "rejected",
    "approver_comment": "No se puede aprobar en estas fechas debido a carga de trabajo"
  }'
```

**Efecto**: 
- `request_status` → `rejected`
- `available_days` del empleado **NO cambian**
- `approver_comment` se guarda

---

## ⚙️ Configuración Adicional

### CORS:

Definido en `.env` con la variable `CORS_ORIGIN`:
```typescript
// src/app.ts
app.use(cors({ origin: config.cors.corsOrigin }));
```

**Producción**: Cambia a la URL de tu frontend.

### JWT:

- **Secret**: Variable `JWT_SECRET` (debe ser segura en producción).
- **Expiración**: Variable `JWT_EXPIRES` (por defecto `7d`).

### Nivel de logs:

En `src/database/db_connection.ts`:
```typescript
logging: cfg.logging ?? false,  // false = sin logs SQL
```

Cambia a `console.log` para debug.

---

## Troubleshooting

### 1. Error: `Dialect needs to be explicitly supplied as of v4.0.0`

**Solución**: Verifica que `.env` tenga `DB_DIALECT=mysql`.

### 2. Sequelize sync no crea tablas

- Verifica que las credenciales en `.env` sean correctas.
- Comprueba que la base de datos existe: `SHOW DATABASES;` en MySQL.

### 3. Tests fallan con `Cannot access 'User' before initialization`

- Asegúrate de que los imports de modelos estén **al final** del archivo (después de la clase).
- Verifica que `associations.ts` se llame en `setupTestDatabase()`.

### 4. ESM vs CommonJS

Este proyecto usa **ES Modules** (`"type": "module"` en `package.json`). Si usas librerías antiguas que requieren CommonJS:
```typescript
// Usa import() dinámico
const oldLib = await import('old-commonjs-lib');
```

---

## Metodología de Trabajo

El desarrollo del proyecto se realizó siguiendo un flujo colaborativo basado en GitHub Projects e Issues, donde cada tarea se registraba, estimaba y se autoasignaba por cada integrante al completarse la anterior. Esto permitió mantener una visión clara del estado del proyecto y evitar bloqueos.

### Flujo de trabajo adoptado

Cada funcionalidad o corrección se definía primero en una Issue dentro del repositorio.

Se creaba una rama a partir de develop siguiendo el formato:

git switch -c feature/nombre-de-la-funcionalidad


### Los commits seguían el estándar Conventional Commits:

Tipo	Uso
feat:	Nueva funcionalidad
fix:	Corrección de errores
test:	Añadir o actualizar tests
docs:	Cambios en documentación
refactor:	Cambio de código sin alterar funcionalidad

Se subía la rama y se abría un Pull Request hacia develop (nunca directo a main).

El PR requería al menos una aprobación antes de mergearse.

main se reservaba exclusivamente para versiones listas para despliegue.

### Ejemplo de commit:
```bash
git commit -m "feat: add vacation approval endpoint with manager role validation"
```

---

## Licencia y Desarrolladoras

- **Ana Muruzabal Gómez**  
  [LinkedIn](https://www.linkedin.com/in/anamuruzabal)  

- **Gabriela Hernández Berbesi**  
  [LinkedIn](https://www.linkedin.com/in/gabriela-hernandez-67aa491b3/) | [GitHub](https://github.com/gabriela-her)

- **Gema Yébenes Caballero**  
  [LinkedIn](https://www.linkedin.com/in/gema-yébenes-caballero-83b6a6100/) | [GitHub](https://github.com/gemayc)

- **Maryori Cruz Eguizabal**  
  [LinkedIn](https://www.linkedin.com/in/maryori-cruz-6b440116b/) | [GitHub](https://github.com/MaryoriCruz?tab=repositories)

- **Olga Ramírez Rodríguez**  
  [LinkedIn](https://www.linkedin.com/in/olga-ramirez-rodriguez) | [GitHub](https://github.com/olgararo)

- **Rocío Alondra Omonte Coronel**  
  [GitHub](https://github.com/Rocio-Coronel)

 Proyecto educativo de FemCoders de Factoría F5 Madrid.

---

## Agradecimientos

Factoría F5, por su acompañamiento y enfoque orientado a proyectos reales.

Cohispania, por brindarnos un caso de uso auténtico y permitirnos trabajar sobre una necesidad empresarial concreta.

A las personas que participaron en las sesiones de feedback y validación funcional, contribuyendo a que el producto esté alineado con la experiencia real del usuario final.

---
## Documentación de la API
Puedes consultar la documentación completa de la API en el siguiente enlace:

🔗 [Ver en Postman](https://documenter.getpostman.com/view/48320294/2sB3WtseBW#97b057b0-d973-4ba9-86fc-4a77f9dcb1ae)
