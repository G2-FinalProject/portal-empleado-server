// src/app.ts
import 'reflect-metadata'; // 👈 siempre lo primero
import express from 'express';
import cors from 'cors';
import { sequelize } from './database/db_connection.js';
import roleRouter from './routes/roleRoutes.js';
import vacationRequestRoutes from './routes/vacationRequestRoutes.js';
import userRouter from './routes/userRoutes.js';
import authRouter from './routes/authRoutes.js';
import departmentRouter from './routes/departmentRoutes.js';
import locationRouter from './routes/locationRoutes.js';
import holidayRouter from './routes/holidayRoutes.js';
import vacationApprovalRoutes from './routes/vacationApprovalRoutes.js';
import config from './config/config.js';

const app = express();

// 🟦 CORS
const corsOptions = {
  origin: config.cors.corsOrigin,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

// 🟩 Rutas
app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use('/departments', departmentRouter);
app.use('/locations', locationRouter);
app.use('/roles', roleRouter);
app.use('/holidays', holidayRouter);
app.use('/vacations', vacationRequestRoutes);
app.use('/vacation-approvals', vacationApprovalRoutes); // 👈 antes era duplicado

// 🟨 Healthcheck (útil para despliegues)
app.get('/healthz', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: (e as Error).message });
  }
});

// 🟧 Home
app.get('/', (_req, res) => res.send('Servidor funcionando 🚀'));

const PORT = Number(process.env.PORT || 3000);

// 🟥 Bootstrap
async function bootstrap() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Solo sincroniza en desarrollo
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('📦 Tablas sincronizadas');
    }

    app.listen(PORT, () =>
      console.log(`Servidor escuchando en http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('❌ Error al conectar con la base de datos:', err);
    process.exit(1);
  }
}

bootstrap();

// 🧹 Cierre ordenado
process.on('SIGINT', async () => {
  console.log('\n🔌 Cerrando conexión…');
  await sequelize.close().catch(() => {});
  process.exit(0);
});
