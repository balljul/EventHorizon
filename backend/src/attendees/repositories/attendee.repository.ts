import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendee } from '../entities/attendee.entity';

/**
 * Repository class for managing attendee data in the database.
 * Provides methods for CRUD operations and specialized queries for attendees.
 * 
 * @class AttendeeRepository
 * @author Philipp Borkovic
 */
@Injectable()
export class AttendeeRepository {
  constructor(
    @InjectRepository(Attendee)
    private readonly repository: Repository<Attendee>,
  ) {}

  /**
   * Retrieves all attendees with their associated user and event relations.
   * 
   * @returns {Promise<Attendee[]>} A promise that resolves to an array of all attendees
   * @author Philipp Borkovic
   */
  async findAll(): Promise<Attendee[]> {
    return this.repository.find({
      relations: ['user', 'event'],
    });
  }

  /**
   * Finds a specific attendee by their ID.
   * 
   * @param {string} id - The unique identifier of the attendee
   * @returns {Promise<Attendee>} A promise that resolves to the found attendee
   * @author Philipp Borkovic
   */
  async findById(id: string): Promise<Attendee> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'event'],
    });
  }

  /**
   * Retrieves all attendees for a specific event.
   * 
   * @param {string} eventId - The unique identifier of the event
   * @returns {Promise<Attendee[]>} A promise that resolves to an array of attendees for the event
   * @author Philipp Borkovic
   */
  async findByEventId(eventId: string): Promise<Attendee[]> {
    return this.repository.find({
      where: { event: { id: eventId } },
      relations: ['user', 'event'],
    });
  }

  /**
   * Retrieves all events a specific user is attending.
   * 
   * @param {string} userId - The unique identifier of the user
   * @returns {Promise<Attendee[]>} A promise that resolves to an array of attendees for the user
   * @author Philipp Borkovic
   */
  async findByUserId(userId: string): Promise<Attendee[]> {
    return this.repository.find({
      where: { user: { id: userId } },
      relations: ['user', 'event'],
    });
  }

  /**
   * Finds a specific attendee by both user and event IDs.
   * 
   * @param {string} userId - The unique identifier of the user
   * @param {string} eventId - The unique identifier of the event
   * @returns {Promise<Attendee>} A promise that resolves to the found attendee
   * @author Philipp Borkovic
   */
  async findByUserAndEvent(userId: string, eventId: string): Promise<Attendee> {
    return this.repository.findOne({
      where: {
        user: { id: userId },
        event: { id: eventId },
      },
      relations: ['user', 'event'],
    });
  }

  /**
   * Creates a new attendee record in the database.
   * 
   * @param {Partial<Attendee>} attendeeData - The data for the new attendee
   * @returns {Promise<Attendee>} A promise that resolves to the created attendee
   * @author Philipp Borkovic
   */
  async create(attendeeData: Partial<Attendee>): Promise<Attendee> {
    const attendee = this.repository.create(attendeeData);
    return this.repository.save(attendee);
  }

  /**
   * Updates an existing attendee record.
   * 
   * @param {string} id - The unique identifier of the attendee to update
   * @param {Partial<Attendee>} attendeeData - The data to update the attendee with
   * @returns {Promise<Attendee>} A promise that resolves to the updated attendee
   * @author Philipp Borkovic
   */
  async update(id: string, attendeeData: Partial<Attendee>): Promise<Attendee> {
    await this.repository.update(id, attendeeData);
    return this.findById(id);
  }

  /**
   * Deletes an attendee record from the database.
   * 
   * @param {string} id - The unique identifier of the attendee to delete
   * @returns {Promise<void>} A promise that resolves when the deletion is complete
   * @author Philipp Borkovic
   */
  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * Saves an attendee entity to the database.
   * 
   * @param {Attendee} attendee - The attendee entity to save
   * @returns {Promise<Attendee>} A promise that resolves to the saved attendee
   * @author Philipp Borkovic
   */
  async save(attendee: Attendee): Promise<Attendee> {
    return this.repository.save(attendee);
  }
} 