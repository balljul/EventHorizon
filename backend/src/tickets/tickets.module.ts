import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketController } from './controllers/ticket.controller';
import { TicketService } from './services/ticket.service';
import { TicketRepository } from './repositories/ticket.repository';
import { EventsModule } from '../events/events.module';

/**
 * Module for managing tickets in the application.
 * Provides ticket management functionality and role-based access control.
 * 
 * @class TicketsModule
 * @author Philipp Borkovic
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    EventsModule,
  ],
  controllers: [TicketController],
  providers: [TicketService, TicketRepository],
  exports: [TicketService],
})
export class TicketsModule {}