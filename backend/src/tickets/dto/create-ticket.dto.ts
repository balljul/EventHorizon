import { IsString, IsNotEmpty, IsNumber, IsUUID, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for creating a new ticket.
 * 
 * @class CreateTicketDto
 * @author Philipp Borkovic
 */
export class CreateTicketDto {
  @ApiProperty({
    description: 'The name of the ticket type',
    example: 'General Admission',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'The price of the ticket',
    example: 29.99,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'The quantity of tickets available',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({
    description: 'The ID of the event this ticket belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  eventId: string;
}