import { ApiProperty } from '@nestjs/swagger';
import { Ticket } from '../entities/ticket.entity';

/**
 * Data Transfer Object for ticket responses.
 * Used to format ticket data in API responses.
 * 
 * @class TicketResponseDto
 * @author Philipp Borkovic
 */
export class TicketResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the ticket',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the ticket type',
    example: 'General Admission',
  })
  name: string;

  @ApiProperty({
    description: 'The price of the ticket',
    example: 29.99,
  })
  price: number;

  @ApiProperty({
    description: 'The quantity of tickets available',
    example: 100,
  })
  quantity: number;

  @ApiProperty({
    description: 'The ID of the event this ticket belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  eventId: string;

  @ApiProperty({
    description: 'The date when the ticket was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date when the ticket was last updated',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;

  constructor(ticket: Ticket) {
    this.id = ticket.id;
    this.name = ticket.name;
    this.price = ticket.price;
    this.quantity = ticket.quantity;
    this.eventId = ticket.eventId;
    this.createdAt = ticket.createdAt;
    this.updatedAt = ticket.updatedAt;
  }
}