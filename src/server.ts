import app from './app.js';
import { sequelize } from './database/db_connection.js';
import { associateModels } from './database/associations.js';


const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

associateModels(sequelize);


(async () => {
  try {
   
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    await sequelize.sync();
    console.log('📦 Tablas sincronizadas');

    const server = app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });

    process.on('SIGINT', async () => {
      console.log('\n🔌 Cerrando conexión…');
      await sequelize.close().catch(() => { });
      server.close(() => process.exit(0));
    });
  } catch (err) {
    console.error('❌ Error al conectar con la base de datos:', err);
    process.exit(1);
  }
})();
