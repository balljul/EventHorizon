import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Event } from '../entities/event.entity';

/**
 * Repository for handling event-related database operations.
 * Implements the repository pattern for event management.
 * 
 * @class EventRepository
 * @author Philipp Borkovic
 */
@Injectable()
export class EventRepository {
  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
  ) {}

  /**
   * Retrieves all events with their related entities.
   * 
   * @returns {Promise<Event[]>} Array of events with their relations
   */
  async findAll(): Promise<Event[]> {
    return this.repository.find({
      relations: ['organizer', 'venue', 'category', 'attendees'],
    });
  }

  /**
   * Retrieves an event by its ID with all related entities.
   * 
   * @param {string} id - The UUID of the event
   * @returns {Promise<Event | null>} The event if found, null otherwise
   */
  async findById(id: string): Promise<Event | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['organizer', 'venue', 'category', 'attendees'],
    });
  }

  /**
   * Retrieves events by organizer ID.
   * 
   * @param {string} organizerId - The UUID of the organizer
   * @returns {Promise<Event[]>} Array of events for the organizer
   */
  async findByOrganizerId(organizerId: string): Promise<Event[]> {
    return this.repository.find({
      where: { organizerId },
      relations: ['organizer', 'venue', 'category', 'attendees'],
    });
  }

  /**
   * Retrieves events by venue ID.
   * 
   * @param {string} venueId - The UUID of the venue
   * @returns {Promise<Event[]>} Array of events at the venue
   */
  async findByVenueId(venueId: string): Promise<Event[]> {
    return this.repository.find({
      where: { venueId },
      relations: ['organizer', 'venue', 'category', 'attendees'],
    });
  }

  /**
   * Retrieves events by category ID.
   * 
   * @param {string} categoryId - The UUID of the category
   * @returns {Promise<Event[]>} Array of events in the category
   */
  async findByCategoryId(categoryId: string): Promise<Event[]> {
    return this.repository.find({
      where: { categoryId },
      relations: ['organizer', 'venue', 'category', 'attendees'],
    });
  }

  /**
   * Creates a new event.
   * 
   * @param {Partial<Event>} eventData - The event data to create
   * @returns {Promise<Event>} The created event
   */
  async create(eventData: Partial<Event>): Promise<Event> {
    const event = this.repository.create(eventData);
    return this.repository.save(event);
  }

  /**
   * Updates an existing event.
   * 
   * @param {string} id - The UUID of the event to update
   * @param {Partial<Event>} eventData - The event data to update
   * @returns {Promise<Event | null>} The updated event if found, null otherwise
   */
  async update(id: string, eventData: Partial<Event>): Promise<Event | null> {
    await this.repository.update(id, eventData);
    return this.findById(id);
  }

  /**
   * Deletes an event.
   * 
   * @param {string} id - The UUID of the event to delete
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  /**
   * Saves an event entity.
   * 
   * @param {Event} event - The event entity to save
   * @returns {Promise<Event>} The saved event
   */
  async save(event: Event): Promise<Event> {
    return this.repository.save(event);
  }

  /**
   * Finds events within a date range.
   * 
   * @param {Date} startDate - The start date
   * @param {Date} endDate - The end date
   * @returns {Promise<Event[]>} Array of events within the date range
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    return this.repository.find({
      where: {
        startDate: Between(startDate, endDate),
      },
      relations: ['organizer', 'venue', 'category', 'attendees'],
    });
  }

  /**
   * Finds active events.
   * 
   * @returns {Promise<Event[]>} Array of active events
   */
  async findActive(): Promise<Event[]> {
    return this.repository.find({
      where: { isActive: true },
      relations: ['organizer', 'venue', 'category', 'attendees'],
    });
  }
} 