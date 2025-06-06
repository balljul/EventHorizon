import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { DatabaseSeeder } from './database.seeder';

/**
 * Script to run database seeding.
 * Can be executed with: npm run seed
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederModule);
  
  const seeder = app.get(DatabaseSeeder);
  
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'seed':
        await seeder.seed();
        break;
      case 'clear':
        await seeder.clear();
        break;
      case 'reset':
        await seeder.clear();
        await seeder.seed();
        break;
      default:
        console.log('Available commands:');
        console.log('  npm run seed:run        - Seed the database with dummy data');
        console.log('  npm run seed:clear      - Clear all data from database');
        console.log('  npm run seed:reset      - Clear and re-seed the database');
        break;
    }
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();