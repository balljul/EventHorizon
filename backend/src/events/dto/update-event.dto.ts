import { IsString, IsOptional, IsDate, IsNumber, IsBoolean, IsUUID, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Data Transfer Object for updating an existing event.
 * All fields are optional as this is used for partial updates.
 * 
 * @class UpdateEventDto
 * @author Philipp Borkovic
 */
export class UpdateEventDto {
  @ApiProperty({
    description: 'The title of the event',
    example: 'Tech Conference 2024 - Updated',
    maxLength: 100,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @ApiProperty({
    description: 'Detailed description of the event',
    example: 'Join us for the biggest tech conference of the year with new speakers...',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The location where the event will take place',
    example: 'New Convention Center, New York',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: 'The date and time when the event starts',
    example: '2024-03-15T09:00:00Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    description: 'The date and time when the event ends',
    example: '2024-03-17T18:00:00Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @ApiProperty({
    description: 'The price of the event ticket',
    example: 349.99,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'Maximum number of attendees allowed',
    example: 750,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiProperty({
    description: 'Whether the event is currently active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

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