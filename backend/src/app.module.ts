import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { EventsModule } from './events/events.module';
import { VenuesModule } from './venues/venues.module';
import { CategoriesModule } from './categories/categories.module';
import { TicketsModule } from './tickets/tickets.module';
import { AttendeesModule } from './attendees/attendees.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { Event } from './events/entities/event.entity';
import { Venue } from './venues/entities/venue.entity';
import { Category } from './categories/entities/category.entity';
import { Ticket } from './tickets/entities/ticket.entity';
import { Attendee } from './attendees/entities/attendee.entity';

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
      entities: [User, Role, Event, Venue, Category, Ticket, Attendee],
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'development',
    }),
    UsersModule,
    RolesModule,
    EventsModule,
    VenuesModule,
    CategoriesModule,
    TicketsModule,
    AttendeesModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
