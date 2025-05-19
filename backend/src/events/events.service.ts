import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';

/**
 * Service encapsulating business logic for event creation and retrieval.
 */
@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  /**
   * Creates a new event record in the database.
   * @param createEventDto Data for the new event
   * @returns The saved Event entity
   *
   * @author Philipp Borkovic
   */
  async create(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create(createEventDto as any);
    return this.eventRepository.save(event);
  }
}