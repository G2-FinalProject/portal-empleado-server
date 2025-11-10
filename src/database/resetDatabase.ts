import { sequelize } from './db_connection.js';
import { associateModels } from './associations.js';

async function resetDatabase() {
  try {
    console.log('Resetting database...\n');

    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    associateModels(sequelize);

    await sequelize.sync({ force: true });
    console.log('✅ All tables dropped and recreated\n');

    console.log('Database reset completed!\n');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

resetDatabase()
  .then(() => {
    console.log('✅ Reset completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  });


