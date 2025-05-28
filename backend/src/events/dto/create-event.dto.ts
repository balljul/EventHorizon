import { IsString, IsNotEmpty, IsDate, IsNumber, IsOptional, IsBoolean, IsUUID, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Data Transfer Object for creating a new event.
 * 
 * @class CreateEventDto
 * @author Philipp Borkovic
 */
export class CreateEventDto {
  @ApiProperty({
    description: 'The title of the event',
    example: 'Tech Conference 2024',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Detailed description of the event',
    example: 'Join us for the biggest tech conference of the year...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'The location where the event will take place',
    example: 'Convention Center, New York',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'The date and time when the event starts',
    example: '2024-03-15T09:00:00Z',
  })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: 'The date and time when the event ends',
    example: '2024-03-17T18:00:00Z',
  })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({
    description: 'The price of the event ticket',
    example: 299.99,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'Maximum number of attendees allowed',
    example: 500,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiProperty({
    description: 'Whether the event is currently active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'The ID of the user organizing the event',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  organizerId: string;

  @ApiProperty({
    description: 'The ID of the venue where the event will take place',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  venueId?: string;

  @ApiProperty({
    description: 'The ID of the event category',
    example: '123e4567-e89b-12d3-a456-426614174002',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;
} 