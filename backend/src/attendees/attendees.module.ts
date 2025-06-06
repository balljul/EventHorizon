import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendeeController } from './controllers/attendee.controller';
import { AttendeeService } from './services/attendee.service';
import { AttendeeRepository } from './repositories/attendee.repository';
import { Attendee } from './entities/attendee.entity';
import { UsersModule } from '../users/users.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendee]),
    UsersModule,
    EventsModule,
  ],
  controllers: [AttendeeController],
  providers: [AttendeeService, AttendeeRepository],
  exports: [AttendeeService, AttendeeRepository],
})
export class AttendeesModule {}