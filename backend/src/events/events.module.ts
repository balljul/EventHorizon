import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventController } from './controllers/event.controller';
import { EventService } from './services/event.service';
import { EventRepository } from './repositories/event.repository';
import { UsersModule } from '../users/users.module';

/**
 * Module for managing events.
 * Provides event-related functionality including CRUD operations.
 * 
 * @class EventsModule
 * @author Philipp Borkovic
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    UsersModule,
  ],
  controllers: [EventController],
  providers: [EventService, EventRepository],
  exports: [EventService],
})
export class EventsModule {} 