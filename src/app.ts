import 'reflect-metadata';
import express from 'express';
import { sequelize } from './database/db_connection.js'; // tu instancia única
import  userRouter from "./routes/userRoutes.js"
import authRouter from './routes/authRoutes.js';
import departmentRouter from './routes/departmentRoutes.js';

const app = express();

app.use(express.json());
app.use("/users", userRouter); 
app.use("/auth", authRouter);
app.use("/departments", departmentRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.get('/', (_req, res) => res.send('Servidor funcionando 🚀'));


async function bootstrap() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Solo durante desarrollo
    await sequelize.sync({ alter : true });

    console.log('📦 Tablas sincronizadas');

       app.listen(PORT, () =>
      console.log(`Servidor escuchando en http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('❌ Error al conectar con la base de datos:', err);
    process.exit(1);
  }
}

bootstrap();

process.on('SIGINT', async () => {
  console.log('\n🔌 Cerrando conexión…');
  await sequelize.close().catch(() => {});
  process.exit(0);
});
