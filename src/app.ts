import 'reflect-metadata';
import express from 'express';
import { sequelize } from './database/db_connection.js'; // tu instancia única

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.get('/', (_req, res) => res.send('Servidor funcionando 🚀'));

async function bootstrap() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Solo durante desarrollo, si quieres crear/actualizar tablas:
    await sequelize.sync({ alter: true });
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

// Cierre ordenado cuando pares el proceso
process.on('SIGINT', async () => {
  console.log('\n🔌 Cerrando conexión…');
  await sequelize.close().catch(() => {});
  process.exit(0);
});
