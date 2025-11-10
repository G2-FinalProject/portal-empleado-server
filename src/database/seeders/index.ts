import { sequelize } from '../db_connection.js';
import { associateModels } from '../associations.js';
import { seedRoles } from './roleSeeder.js';
import { seedDepartments } from './departmentSeeder.js';
import { seedLocations } from './locationSeeder.js';
import { seedUsers } from './userSeeder.js';
import { seedHolidays } from './holidaySeeder.js';

export async function runSeeders() {
  try {
    console.log('🌱 Starting database seeding...\n');

    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    associateModels(sequelize);

    await sequelize.sync({ alter: false });
    console.log('✅ Tables synchronized\n');

    await seedRoles();
    await seedDepartments();
    await seedLocations();
    await seedUsers();
    await seedHolidays();

    console.log('\n🎉 All seeders executed successfully!');
    console.log('\n📊 Summary:');
    console.log('  - 3 Roles');
    console.log('  - 6 Departments');
    console.log('  - 3 Locations');
    console.log('  - 13 Users (1 Admin, 3 Managers, 9 Employees)');
    console.log('  - ~40 Holidays (National + Regional)');
    console.log('\n🔑 Default password for all users: 12345678');

  } catch (error) {
    console.error('❌ Error running seeders:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}