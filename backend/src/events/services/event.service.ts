import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { Event } from '../entities/event.entity';

/**
 * Service for handling event-related business logic.
 * Implements the service pattern for event management.
 * 
 * @class EventService
 * @author Philipp Borkovic
 */
@Injectable()
export class EventService{
  constructor(private readonly eventRepository: EventRepository) {}

  /**
   * Creates a new event.
   * 
   * @param {CreateEventDto} createEventDto - The event creation data
   * @returns {Promise<Event>} The created event
   * @throws {BadRequestException} If event dates are invalid
   */
  async create(createEventDto: CreateEventDto): Promise<Event> {
    if (createEventDto.endDate <= createEventDto.startDate) {
      throw new BadRequestException('End date must be after start date');
    }
    return this.eventRepository.create(createEventDto);
  }

  /**
   * Retrieves all events.
   * 
   * @returns {Promise<Event[]>} Array of all events
   */
  async findAll(): Promise<Event[]> {
    return this.eventRepository.findAll();
  }

  /**
   * Retrieves an event by ID.
   * 
   * @param {string} id - The UUID of the event
   * @returns {Promise<Event>} The found event
   * @throws {NotFoundException} If event is not found
   */
  async findById(id: string): Promise<Event> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  /**
   * Updates an event.
   * 
   * @param {string} id - The UUID of the event to update
   * @param {UpdateEventDto} updateEventDto - The event update data
   * @returns {Promise<Event>} The updated event
   * @throws {NotFoundException} If event is not found
   * @throws {BadRequestException} If event dates are invalid
   */
  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    if (updateEventDto.endDate && updateEventDto.startDate && 
        updateEventDto.endDate <= updateEventDto.startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const event = await this.eventRepository.update(id, updateEventDto);
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  /**
   * Deletes an event.
   * 
   * @param {string} id - The UUID of the event to delete
   * @returns {Promise<void>}
   * @throws {NotFoundException} If event is not found
   */
  async delete(id: string): Promise<void> {
    const deleted = await this.eventRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
  }

  /**
   * Finds events by date range.
   * 
   * @param {Date} startDate - The start date
   * @param {Date} endDate - The end date
   * @returns {Promise<Event[]>} Array of events within the date range
   * @throws {BadRequestException} If date range is invalid
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }
    return this.eventRepository.findByDateRange(startDate, endDate);
  }

  /**
   * Finds active events.
   * 
   * @returns {Promise<Event[]>} Array of active events
   */
  async findActive(): Promise<Event[]> {
    return this.eventRepository.findActive();
  }

  /**
   * Finds events by organizer ID.
   * 
   * @param {string} organizerId - The UUID of the organizer
   * @returns {Promise<Event[]>} Array of events for the organizer
   */
  async findByOrganizerId(organizerId: string): Promise<Event[]> {
    return this.eventRepository.findByOrganizerId(organizerId);
  }

  /**
   * Finds events by venue ID.
   * 
   * @param {string} venueId - The UUID of the venue
   * @returns {Promise<Event[]>} Array of events at the venue
   */
  async findByVenueId(venueId: string): Promise<Event[]> {
    return this.eventRepository.findByVenueId(venueId);
  }

  /**
   * Finds events by category ID.
   * 
   * @param {string} categoryId - The UUID of the category
   * @returns {Promise<Event[]>} Array of events in the category
   */
  async findByCategoryId(categoryId: string): Promise<Event[]> {
    return this.eventRepository.findByCategoryId(categoryId);
  }

  /**
   * Updates an event's active status.
   * 
   * @param {string} id - The UUID of the event
   * @param {boolean} isActive - The new active status
   * @returns {Promise<Event>} The updated event
   * @throws {NotFoundException} If event is not found
   */
  async updateStatus(id: string, isActive: boolean): Promise<Event> {
    const event = await this.eventRepository.update(id, { isActive });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }
} 