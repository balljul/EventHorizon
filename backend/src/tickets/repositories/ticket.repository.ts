import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';

/**
 * Repository for handling ticket-related database operations.
 * Implements the repository pattern for ticket management.
 * 
 * @class TicketRepository
 * @author Philipp Borkovic
 */
@Injectable()
export class TicketRepository {
  constructor(
    @InjectRepository(Ticket)
    private readonly repository: Repository<Ticket>,
  ) {}

  /**
   * Retrieves all tickets with their related entities.
   * 
   * @returns {Promise<Ticket[]>} Array of tickets with their relations
   */
  async findAll(): Promise<Ticket[]> {
    return this.repository.find({
      relations: ['event'],
    });
  }

  /**
   * Retrieves a ticket by its ID with all related entities.
   * 
   * @param {string} id - The UUID of the ticket
   * @returns {Promise<Ticket | null>} The ticket if found, null otherwise
   */
  async findById(id: string): Promise<Ticket | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['event'],
    });
  }

  /**
   * Retrieves tickets by event ID.
   * 
   * @param {string} eventId - The UUID of the event
   * @returns {Promise<Ticket[]>} Array of tickets for the event
   */
  async findByEventId(eventId: string): Promise<Ticket[]> {
    return this.repository.find({
      where: { eventId },
      relations: ['event'],
    });
  }

  /**
   * Creates a new ticket.
   * 
   * @param {Partial<Ticket>} ticketData - The ticket data to create
   * @returns {Promise<Ticket>} The created ticket
   */
  async create(ticketData: Partial<Ticket>): Promise<Ticket> {
    const ticket = this.repository.create(ticketData);
    return this.repository.save(ticket);
  }

  /**
   * Updates an existing ticket.
   * 
   * @param {string} id - The UUID of the ticket to update
   * @param {Partial<Ticket>} ticketData - The ticket data to update
   * @returns {Promise<Ticket | null>} The updated ticket if found, null otherwise
   */
  async update(id: string, ticketData: Partial<Ticket>): Promise<Ticket | null> {
    await this.repository.update(id, ticketData);
    return this.findById(id);
  }

  /**
   * Deletes a ticket.
   * 
   * @param {string} id - The UUID of the ticket to delete
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  /**
   * Saves a ticket entity.
   * 
   * @param {Ticket} ticket - The ticket entity to save
   * @returns {Promise<Ticket>} The saved ticket
   */
  async save(ticket: Ticket): Promise<Ticket> {
    return this.repository.save(ticket);
  }

  /**
   * Finds tickets with available quantity (quantity > 0).
   * 
   * @returns {Promise<Ticket[]>} Array of tickets with available quantity
   */
  async findAvailable(): Promise<Ticket[]> {
    return this.repository.find({
      where: { quantity: MoreThan(0) },
      relations: ['event'],
    });
  }

  /**
   * Finds tickets with available quantity for a specific event.
   * 
   * @param {string} eventId - The UUID of the event
   * @returns {Promise<Ticket[]>} Array of available tickets for the event
   */
  async findAvailableByEventId(eventId: string): Promise<Ticket[]> {
    return this.repository.find({
      where: { 
        eventId,
        quantity: MoreThan(0) 
      },
      relations: ['event'],
    });
  }

  /**
   * Updates the quantity of a ticket.
   * 
   * @param {string} id - The UUID of the ticket
   * @param {number} quantity - The new quantity
   * @returns {Promise<Ticket | null>} The updated ticket if found, null otherwise
   */
  async updateQuantity(id: string, quantity: number): Promise<Ticket | null> {
    await this.repository.update(id, { quantity });
    return this.findById(id);
  }
}