import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { Between } from 'typeorm';

/**
 * Repository class for handling Event entity database operations.
 * Provides methods for CRUD operations and custom queries.
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
   * @author Philipp Borkovic
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
   * @returns {Promise<Event>} The found event with its relations
   * @author Philipp Borkovic
   */
  async findById(id: string): Promise<Event> {
    return this.repository.findOne({
      where: { id },
      relations: ['organizer', 'venue', 'category', 'attendees'],
    });
  }

  /**
   * Retrieves events by organizer ID.
   * 
   * @param {string} organizerId - The UUID of the organizer
   * @returns {Promise<Event[]>} Array of events organized by the specified user
   * @author Philipp Borkovic
   */
  async findByOrganizerId(organizerId: string): Promise<Event[]> {
    return this.repository.find({
      where: { organizer: { id: organizerId } },
      relations: ['venue', 'category', 'attendees'],
    });
  }

  /**
   * Retrieves events by venue ID.
   * 
   * @param {string} venueId - The UUID of the venue
   * @returns {Promise<Event[]>} Array of events at the specified venue
   * @author Philipp Borkovic
   */
  async findByVenueId(venueId: string): Promise<Event[]> {
    return this.repository.find({
      where: { venue: { id: venueId } },
      relations: ['organizer', 'category', 'attendees'],
    });
  }

  /**
   * Retrieves events by category ID.
   * 
   * @param {string} categoryId - The UUID of the category
   * @returns {Promise<Event[]>} Array of events in the specified category
   * @author Philipp Borkovic
   */
  async findByCategoryId(categoryId: string): Promise<Event[]> {
    return this.repository.find({
      where: { category: { id: categoryId } },
      relations: ['organizer', 'venue', 'attendees'],
    });
  }

  /**
   * Creates a new event.
   * 
   * @param {Partial<Event>} eventData - The event data to create
   * @returns {Promise<Event>} The created event
   * @author Philipp Borkovic
   */
  async create(eventData: Partial<Event>): Promise<Event> {
    const event = this.repository.create(eventData);
    return this.repository.save(event);
  }

  /**
   * Updates an existing event.
   * 
   * @param {string} id - The UUID of the event to update
   * @param {Partial<Event>} eventData - The updated event data
   * @returns {Promise<Event>} The updated event
   * @author Philipp Borkovic
   */
  async update(id: string, eventData: Partial<Event>): Promise<Event> {
    await this.repository.update(id, eventData);
    return this.findById(id);
  }

  /**
   * Deletes an event.
   * 
   * @param {string} id - The UUID of the event to delete
   * @returns {Promise<void>}
   * @author Philipp Borkovic
   */
  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * Saves an event entity.
   * 
   * @param {Event} event - The event entity to save
   * @returns {Promise<Event>} The saved event
   * @author Philipp Borkovic
   */
  async save(event: Event): Promise<Event> {
    return this.repository.save(event);
  }

  /**
   * Finds events within a date range.
   * 
   * @param {Date} startDate - The start date of the range
   * @param {Date} endDate - The end date of the range
   * @returns {Promise<Event[]>} Array of events within the date range
   * @author Philipp Borkovic
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
   * @author Philipp Borkovic
   */
  async findActive(): Promise<Event[]> {
    return this.repository.find({
      where: { isActive: true },
      relations: ['organizer', 'venue', 'category', 'attendees'],
    });
  }
} 