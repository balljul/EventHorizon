import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { EventRepository } from '../repositories/event.repository';
import { UserService } from '../../users/services/user.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';

/**
 * Service class for handling event-related business logic.
 * Provides methods for managing events and their relationships.
 * 
 * @class EventService
 * @author Philipp Borkovic
 */
@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly userService: UserService,
  ) {}

  /**
   * Retrieves all events.
   * 
   * @returns {Promise<Event[]>} Array of all events
   * @author Philipp Borkovic
   */
  async findAll(): Promise<Event[]> {
    return this.eventRepository.find();
  }

  /**
   * Retrieves an event by its ID.
   * 
   * @param {string} id - The UUID of the event
   * @returns {Promise<Event>} The found event
   * @throws {NotFoundException} If the event is not found
   * @author Philipp Borkovic
   */
  async findById(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  /**
   * Retrieves events by organizer ID.
   * 
   * @param {string} organizerId - The UUID of the organizer
   * @returns {Promise<Event[]>} Array of events organized by the specified user
   * @author Philipp Borkovic
   */
  async findByOrganizerId(organizerId: string): Promise<Event[]> {
    await this.userService.findById(organizerId); // Verify organizer exists
    return this.eventRepository.findByOrganizerId(organizerId);
  }

  /**
   * Creates a new event.
   * 
   * @param {CreateEventDto} createEventDto - The event data
   * @returns {Promise<Event>} The created event
   * @throws {BadRequestException} If the dates are invalid
   * @author Philipp Borkovic
   */
  async create(createEventDto: CreateEventDto): Promise<Event> {
    const { startDate, endDate } = createEventDto;

    if (startDate >= endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    await this.userService.findById(createEventDto.organizerId); // Verify organizer exists

    const event = this.eventRepository.create(createEventDto);
    return this.eventRepository.save(event);
  }

  /**
   * Updates an existing event.
   * 
   * @param {string} id - The UUID of the event to update
   * @param {UpdateEventDto} updateEventDto - The updated event data
   * @returns {Promise<Event>} The updated event
   * @throws {NotFoundException} If the event is not found
   * @throws {BadRequestException} If the dates are invalid
   * @author Philipp Borkovic
   */
  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findById(id);

    if (updateEventDto.startDate && updateEventDto.endDate) {
      if (updateEventDto.startDate >= updateEventDto.endDate) {
        throw new BadRequestException('End date must be after start date');
      }
    } else if (updateEventDto.startDate && event.endDate) {
      if (updateEventDto.startDate >= event.endDate) {
        throw new BadRequestException('End date must be after start date');
      }
    } else if (updateEventDto.endDate && event.startDate) {
      if (event.startDate >= updateEventDto.endDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    await this.eventRepository.update(id, updateEventDto);
    return this.findById(id);
  }

  /**
   * Deletes an event.
   * 
   * @param {string} id - The UUID of the event to delete
   * @returns {Promise<void>}
   * @throws {NotFoundException} If the event is not found
   * @author Philipp Borkovic
   */
  async delete(id: string): Promise<void> {
    await this.findById(id); // Verify event exists
    await this.eventRepository.delete(id);
  }

  /**
   * Retrieves events within a date range.
   * 
   * @param {Date} startDate - The start date of the range
   * @param {Date} endDate - The end date of the range
   * @returns {Promise<Event[]>} Array of events within the date range
   * @throws {BadRequestException} If the dates are invalid
   * @author Philipp Borkovic
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    if (startDate >= endDate) {
      throw new BadRequestException('End date must be after start date');
    }
    return this.eventRepository.findByDateRange(startDate, endDate);
  }

  /**
   * Retrieves active events.
   * 
   * @returns {Promise<Event[]>} Array of active events
   * @author Philipp Borkovic
   */
  async findActive(): Promise<Event[]> {
    return this.eventRepository.findActive();
  }

  /**
   * Updates the active status of an event.
   * 
   * @param {string} id - The UUID of the event
   * @param {boolean} isActive - The new active status
   * @returns {Promise<Event>} The updated event
   * @throws {NotFoundException} If the event is not found
   * @author Philipp Borkovic
   */
  async updateStatus(id: string, isActive: boolean): Promise<Event> {
    await this.findById(id); // Verify event exists
    await this.eventRepository.update(id, { isActive });
    return this.findById(id);
  }

  /**
   * Retrieves events by venue ID.
   * 
   * @param {string} venueId - The UUID of the venue
   * @returns {Promise<Event[]>} Array of events at the specified venue
   * @author Philipp Borkovic
   */
  async findByVenueId(venueId: string): Promise<Event[]> {
    return this.eventRepository.findByVenueId(venueId);
  }

  /**
   * Retrieves events by category ID.
   * 
   * @param {string} categoryId - The UUID of the category
   * @returns {Promise<Event[]>} Array of events in the specified category
   * @author Philipp Borkovic
   */
  async findByCategoryId(categoryId: string): Promise<Event[]> {
    return this.eventRepository.findByCategoryId(categoryId);
  }
} 