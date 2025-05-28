import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AttendeeRepository } from '../repositories/attendee.repository';
import { UserService } from '../../users/services/user.service';
import { EventService } from '../../events/services/event.service';
import { Attendee } from '../entities/attendee.entity';
import { CreateAttendeeDto } from '../dto/create-attendee.dto';
import { UpdateAttendeeDto } from '../dto/update-attendee.dto';

/**
 * Service class for managing attendee business logic.
 * Handles attendee operations including creation, updates, and status management.
 * 
 * @class AttendeeService
 * @author Philipp Borkovic
 */
@Injectable()
export class AttendeeService {
  constructor(
    private readonly attendeeRepository: AttendeeRepository,
    private readonly userService: UserService,
    private readonly eventService: EventService,
  ) {}

  /**
   * Retrieves all attendees from the system.
   * 
   * @returns {Promise<Attendee[]>} A promise that resolves to an array of all attendees
   * @author Philipp Borkovic
   */
  async findAll(): Promise<Attendee[]> {
    return this.attendeeRepository.findAll();
  }

  /**
   * Finds a specific attendee by their ID.
   * Throws NotFoundException if the attendee is not found.
   * 
   * @param {string} id - The unique identifier of the attendee
   * @returns {Promise<Attendee>} A promise that resolves to the found attendee
   * @throws {NotFoundException} When the attendee is not found
   * @author Philipp Borkovic
   */
  async findById(id: string): Promise<Attendee> {
    const attendee = await this.attendeeRepository.findById(id);
    if (!attendee) {
      throw new NotFoundException(`Attendee with ID ${id} not found`);
    }
    return attendee;
  }

  /**
   * Retrieves all attendees for a specific event.
   * Verifies that the event exists before retrieving attendees.
   * 
   * @param {string} eventId - The unique identifier of the event
   * @returns {Promise<Attendee[]>} A promise that resolves to an array of attendees for the event
   * @author Philipp Borkovic
   */
  async findByEventId(eventId: string): Promise<Attendee[]> {
    await this.eventService.findById(eventId); // Verify event exists
    return this.attendeeRepository.findByEventId(eventId);
  }

  /**
   * Retrieves all events a specific user is attending.
   * Verifies that the user exists before retrieving attendees.
   * 
   * @param {string} userId - The unique identifier of the user
   * @returns {Promise<Attendee[]>} A promise that resolves to an array of attendees for the user
   * @author Philipp Borkovic
   */
  async findByUserId(userId: string): Promise<Attendee[]> {
    await this.userService.findById(userId); // Verify user exists
    return this.attendeeRepository.findByUserId(userId);
  }

  /**
   * Creates a new attendee registration.
   * Verifies that both user and event exist, and checks for duplicate registrations.
   * 
   * @param {CreateAttendeeDto} createAttendeeDto - The data for creating a new attendee
   * @returns {Promise<Attendee>} A promise that resolves to the created attendee
   * @throws {ConflictException} When the user is already registered for the event
   * @author Philipp Borkovic
   */
  async create(createAttendeeDto: CreateAttendeeDto): Promise<Attendee> {
    // Verify user and event exist
    const [user, event] = await Promise.all([
      this.userService.findById(createAttendeeDto.userId),
      this.eventService.findById(createAttendeeDto.eventId),
    ]);

    // Check if user is already registered for this event
    const existingAttendee = await this.attendeeRepository.findByUserAndEvent(
      createAttendeeDto.userId,
      createAttendeeDto.eventId,
    );

    if (existingAttendee) {
      throw new ConflictException('User is already registered for this event');
    }

    const attendeeData = {
      user,
      event,
      status: createAttendeeDto.status,
      notes: createAttendeeDto.notes,
      isPaid: createAttendeeDto.isPaid,
      paymentAmount: createAttendeeDto.paymentAmount,
    };

    return this.attendeeRepository.create(attendeeData);
  }

  /**
   * Updates an existing attendee's information.
   * Verifies that the attendee exists before updating.
   * 
   * @param {string} id - The unique identifier of the attendee to update
   * @param {UpdateAttendeeDto} updateAttendeeDto - The data to update the attendee with
   * @returns {Promise<Attendee>} A promise that resolves to the updated attendee
   * @author Philipp Borkovic
   */
  async update(id: string, updateAttendeeDto: UpdateAttendeeDto): Promise<Attendee> {
    await this.findById(id); // Verify attendee exists
    return this.attendeeRepository.update(id, updateAttendeeDto);
  }

  /**
   * Deletes an attendee registration.
   * Verifies that the attendee exists before deletion.
   * 
   * @param {string} id - The unique identifier of the attendee to delete
   * @returns {Promise<void>} A promise that resolves when the deletion is complete
   * @author Philipp Borkovic
   */
  async delete(id: string): Promise<void> {
    await this.findById(id); // Verify attendee exists
    await this.attendeeRepository.delete(id);
  }

  /**
   * Updates the status of an attendee's registration.
   * 
   * @param {string} id - The unique identifier of the attendee
   * @param {string} status - The new status to set
   * @returns {Promise<Attendee>} A promise that resolves to the updated attendee
   * @author Philipp Borkovic
   */
  async updateStatus(id: string, status: string): Promise<Attendee> {
    const attendee = await this.findById(id);
    attendee.status = status as any; // Type assertion needed due to enum
    return this.attendeeRepository.save(attendee);
  }

  /**
   * Marks an attendee's registration as paid and records the payment amount.
   * 
   * @param {string} id - The unique identifier of the attendee
   * @param {number} amount - The payment amount to record
   * @returns {Promise<Attendee>} A promise that resolves to the updated attendee
   * @author Philipp Borkovic
   */
  async markAsPaid(id: string, amount: number): Promise<Attendee> {
    const attendee = await this.findById(id);
    attendee.isPaid = true;
    attendee.paymentAmount = amount;
    return this.attendeeRepository.save(attendee);
  }

  /**
   * Retrieves attendance statistics for a specific event.
   * 
   * @param {string} eventId - The unique identifier of the event
   * @returns {Promise<{total: number, confirmed: number, attended: number, cancelled: number, noShow: number}>} 
   * A promise that resolves to an object containing attendance statistics
   * @author Philipp Borkovic
   */
  async getEventAttendanceStats(eventId: string): Promise<{
    total: number;
    confirmed: number;
    attended: number;
    cancelled: number;
    noShow: number;
  }> {
    const attendees = await this.findByEventId(eventId);
    
    return {
      total: attendees.length,
      confirmed: attendees.filter(a => a.status === 'confirmed').length,
      attended: attendees.filter(a => a.status === 'attended').length,
      cancelled: attendees.filter(a => a.status === 'cancelled').length,
      noShow: attendees.filter(a => a.status === 'no_show').length,
    };
  }
} 