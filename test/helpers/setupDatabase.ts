import { sequelize, closeDb } from '../../src/database/db_connection';
import { associateModels } from '../../src/database/associations';

export async function setupTestDatabase() {
  
  await sequelize.authenticate();
  associateModels(sequelize);

  // Sync sin force - solo crea tablas si no existen
  await sequelize.sync({ alter: false });

  return sequelize;
}

export async function cleanupTestDatabase() {
  await closeDb();
}