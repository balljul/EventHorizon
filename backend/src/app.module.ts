import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { TicketsModule } from './tickets/tickets.module';
import { VenuesModule } from './venues/venues.module';
import { CategoriesModule } from './categories/categories.module';
import { AttendeesModule } from './attendees/attendees.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      }),
    }),
    UsersModule,
    AuthModule,
    EventsModule,
    TicketsModule,
    VenuesModule,
    CategoriesModule,
    AttendeesModule,
  ],
})
export class AppModule {}