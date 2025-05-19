import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsDateString,
} from 'class-validator';

/**
 * Data Transfer Object for creating a new event.
 */
export class CreateEventDto {
  /**
   * @property {string} title - Title of the event
   *
   * @ApiProperty({ description: 'Title of the event' })
   * @IsString()
   * @IsNotEmpty()
   *
   * @author Philipp Borkovic
   */
  @ApiProperty({ description: 'Title of the event' })
  @IsString()
  @IsNotEmpty()
  title: string;

  /**
   * Optional detailed description of the event.
   *
   * @property {string} [description] - Detailed description of the event
   *
   * @ApiProperty({ description: 'Detailed description of the event', required: false })
   * @IsString()
   * @IsOptional()
   *
   * @author Philipp Borkovic
   */
  @ApiProperty({ description: 'Detailed description of the event', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  /**
   * ISO-formatted start datetime of the event.
   *
   * @property {string} startDate - ISO start datetime of the event
   *
   * @ApiProperty({ description: 'ISO start datetime of the event' })
   * @IsDateString()
   *
   * @author Philipp Borkovic
   */
  @ApiProperty({ description: 'ISO start datetime of the event' })
  @IsDateString()
  startDate: string;

  /**
   * ISO-formatted end datetime of the event.
   *
   * @property {string} endDate - ISO end datetime of the event
   *
   * @ApiProperty({ description: 'ISO end datetime of the event' })
   * @IsDateString()
   *
   * @author Philipp Borkovic
   */
  @ApiProperty({ description: 'ISO end datetime of the event' })
  @IsDateString()
  endDate: string;

  /**
   * Whether the event should repeat on a scheduled basis.
   *
   * @property {boolean} [isRecurring] - Flag for recurring events
   *
   * @ApiProperty({ description: 'Flag for recurring events', default: false })
   * @IsBoolean()
   * @IsOptional()
   *
   * @author Philipp Borkovic
   */
  @ApiProperty({ description: 'Flag for recurring events', default: false })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  /**
   * Recurrence rule (RRULE) for scheduling repeating events.
   *
   * @property {string} [recurrenceRule] - Recurrence rule (RRULE) string
   *
   * @ApiProperty({ description: 'Recurrence rule (RRULE) string', required: false })
   * @IsString()
   * @IsOptional()
   *
   * @author Philipp Borkovic
   */
  @ApiProperty({ description: 'Recurrence rule (RRULE) string', required: false })
  @IsString()
  @IsOptional()
  recurrenceRule?: string;

  /**
   * UUID of the venue where the event will take place.
   *
   * @property {string} venueId - UUID of the venue
   *
   * @ApiProperty({ description: 'UUID of the venue' })
   * @IsUUID()
   *
   * @author Philipp Borkovic
   */
  @ApiProperty({ description: 'UUID of the venue' })
  @IsUUID()
  venueId: string;

  /**
   * UUID of the category to which the event belongs.
   *
   * @property {string} categoryId - UUID of the category
   *
   * @ApiProperty({ description: 'UUID of the category' })
   * @IsUUID()
   *
   * @author Philipp Borkovic
   */
  @ApiProperty({ description: 'UUID of the category' })
  @IsUUID()
  categoryId: string;

  /**
   * UUID of the user organizing the event.
   *
   * @property {string} organizerId - UUID of the event organizer (user)
   *
   * @ApiProperty({ description: 'UUID of the event organizer (user)' })
   * @IsUUID()
   *
   * @author Philipp Borkovic
   */
  @ApiProperty({ description: 'UUID of the event organizer (user)' })
  @IsUUID()
  organizerId: string;
}