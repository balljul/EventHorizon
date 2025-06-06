import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TicketRepository } from '../repositories/ticket.repository';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { Ticket } from '../entities/ticket.entity';

/**
 * Service for handling ticket-related business logic.
 * Implements the service pattern for ticket management.
 * 
 * @class TicketService
 * @author Philipp Borkovic
 */
@Injectable()
export class TicketService {
  constructor(private readonly ticketRepository: TicketRepository) {}

  /**
   * Creates a new ticket.
   * 
   * @param {CreateTicketDto} createTicketDto - The ticket creation data
   * @returns {Promise<Ticket>} The created ticket
   * @throws {BadRequestException} If ticket data is invalid
   */
  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    if (createTicketDto.price < 0) {
      throw new BadRequestException('Ticket price cannot be negative');
    }
    
    if (createTicketDto.quantity < 0) {
      throw new BadRequestException('Ticket quantity cannot be negative');
    }
    
    return this.ticketRepository.create(createTicketDto);
  }

  /**
   * Retrieves all tickets.
   * 
   * @returns {Promise<Ticket[]>} Array of all tickets
   */
  async findAll(): Promise<Ticket[]> {
    return this.ticketRepository.findAll();
  }

  /**
   * Retrieves a ticket by ID.
   * 
   * @param {string} id - The UUID of the ticket
   * @returns {Promise<Ticket>} The found ticket
   * @throws {NotFoundException} If ticket is not found
   */
  async findById(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return ticket;
  }

  /**
   * Retrieves tickets by event ID.
   * 
   * @param {string} eventId - The UUID of the event
   * @returns {Promise<Ticket[]>} Array of tickets for the event
   */
  async findByEventId(eventId: string): Promise<Ticket[]> {
    return this.ticketRepository.findByEventId(eventId);
  }

  /**
   * Updates a ticket.
   * 
   * @param {string} id - The UUID of the ticket to update
   * @param {UpdateTicketDto} updateTicketDto - The ticket update data
   * @returns {Promise<Ticket>} The updated ticket
   * @throws {NotFoundException} If ticket is not found
   * @throws {BadRequestException} If ticket data is invalid
   */
  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    if (updateTicketDto.price !== undefined && updateTicketDto.price < 0) {
      throw new BadRequestException('Ticket price cannot be negative');
    }
    
    if (updateTicketDto.quantity !== undefined && updateTicketDto.quantity < 0) {
      throw new BadRequestException('Ticket quantity cannot be negative');
    }

    const ticket = await this.ticketRepository.update(id, updateTicketDto);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return ticket;
  }

  /**
   * Deletes a ticket.
   * 
   * @param {string} id - The UUID of the ticket to delete
   * @returns {Promise<void>}
   * @throws {NotFoundException} If ticket is not found
   */
  async delete(id: string): Promise<void> {
    const deleted = await this.ticketRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
  }

  /**
   * Finds tickets with available quantity.
   * 
   * @returns {Promise<Ticket[]>} Array of available tickets
   */
  async findAvailable(): Promise<Ticket[]> {
    return this.ticketRepository.findAvailable();
  }

  /**
   * Finds available tickets for a specific event.
   * 
   * @param {string} eventId - The UUID of the event
   * @returns {Promise<Ticket[]>} Array of available tickets for the event
   */
  async findAvailableByEventId(eventId: string): Promise<Ticket[]> {
    return this.ticketRepository.findAvailableByEventId(eventId);
  }

  /**
   * Updates the quantity of a ticket.
   * 
   * @param {string} id - The UUID of the ticket
   * @param {number} quantity - The new quantity
   * @returns {Promise<Ticket>} The updated ticket
   * @throws {NotFoundException} If ticket is not found
   * @throws {BadRequestException} If quantity is invalid
   */
  async updateQuantity(id: string, quantity: number): Promise<Ticket> {
    if (quantity < 0) {
      throw new BadRequestException('Ticket quantity cannot be negative');
    }

    const ticket = await this.ticketRepository.updateQuantity(id, quantity);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return ticket;
  }

  /**
   * Decreases the quantity of a ticket by a specified amount.
   * Used when tickets are purchased.
   * 
   * @param {string} id - The UUID of the ticket
   * @param {number} amount - The amount to decrease the quantity by
   * @returns {Promise<Ticket>} The updated ticket
   * @throws {NotFoundException} If ticket is not found
   * @throws {BadRequestException} If not enough tickets available
   */
  async decreaseQuantity(id: string, amount: number): Promise<Ticket> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const ticket = await this.findById(id);
    
    if (ticket.quantity < amount) {
      throw new BadRequestException(`Not enough tickets available. Only ${ticket.quantity} tickets remaining`);
    }

    const newQuantity = ticket.quantity - amount;
    return this.updateQuantity(id, newQuantity);
  }

  /**
   * Increases the quantity of a ticket by a specified amount.
   * Used when tickets are returned or added.
   * 
   * @param {string} id - The UUID of the ticket
   * @param {number} amount - The amount to increase the quantity by
   * @returns {Promise<Ticket>} The updated ticket
   * @throws {NotFoundException} If ticket is not found
   * @throws {BadRequestException} If amount is invalid
   */
  async increaseQuantity(id: string, amount: number): Promise<Ticket> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const ticket = await this.findById(id);
    const newQuantity = ticket.quantity + amount;
    return this.updateQuantity(id, newQuantity);
  }
}