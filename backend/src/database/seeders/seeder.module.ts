import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DatabaseSeeder } from './database.seeder';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';
import { Category } from '../../categories/entities/category.entity';
import { Venue } from '../../venues/entities/venue.entity';
import { Event } from '../../events/entities/event.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

/**
 * Module for database seeding functionality.
 * Provides seeder services and database connections.
 * 
 * @class SeederModule
 * @author Philipp Borkovic
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'EventHz_Pg_28!9x',
      database: process.env.DB_DATABASE || 'eventhorizon',
      entities: [User, Role, Category, Venue, Event, Ticket],
      synchronize: false, // Don't auto-sync in seeder
    }),
    TypeOrmModule.forFeature([
      User,
      Role,
      Category,
      Venue,
      Event,
      Ticket,
    ]),
  ],
  providers: [DatabaseSeeder],
  exports: [DatabaseSeeder],
})
export class SeederModule {}