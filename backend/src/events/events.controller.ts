import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';

/**
 * Controller that handles HTTP requests related to events.
 */
@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(
      private readonly eventsService: EventsService
  ) {
  }

  /**
   * POST /events
   * Create a new event with the given details.
   * Requires a valid JWT bearer token.
   * @param createEventDto Payload defining the event to create
   * @returns The created Event entity
   *
   * @author Philipp Borkovic
   */
  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiBearerAuth()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }
}