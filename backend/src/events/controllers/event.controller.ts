import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody, ApiConsumes, ApiProduces, ApiExtraModels } from '@nestjs/swagger';
import { EventService } from '../services/event.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleType } from '../../auth/enums/role-type.enum';
import { Event } from '../entities/event.entity';

/**
 * Controller for managing events.
 * Provides endpoints for CRUD operations and event management.
 * All endpoints require authentication via JWT token.
 * 
 * @class EventController
 * @author Philipp Borkovic
 */
@ApiTags('events')
@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiExtraModels(CreateEventDto, UpdateEventDto)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  /**
   * Creates a new event.
   * Requires ADMIN role.
   * Validates event dates and organizer existence.
   */
  @Post()
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Create a new event',
    description: 'Creates a new event with the provided details. Requires ADMIN role. Validates event dates and organizer existence.',
  })
  @ApiBody({
    type: CreateEventDto,
    description: 'Event creation data',
    examples: {
      techConference: {
        value: {
          title: 'Tech Conference 2024',
          description: 'Join us for the biggest tech conference of the year...',
          location: 'Convention Center, New York',
          startDate: '2024-03-15T09:00:00Z',
          endDate: '2024-03-17T18:00:00Z',
          price: 299.99,
          capacity: 500,
          isActive: true,
          organizerId: '123e4567-e89b-12d3-a456-426614174000',
          venueId: '123e4567-e89b-12d3-a456-426614174001',
          categoryId: '123e4567-e89b-12d3-a456-426614174002'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'The event has been successfully created.',
    type: Event,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data. Possible reasons: Invalid dates, missing required fields, or invalid field values.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'End date must be after start date' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden resource' },
        error: { type: 'string', example: 'Forbidden' }
      }
    }
  })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  /**
   * Retrieves all events with optional filtering.
   * Accessible by all authenticated users.
   */
  @Get()
  @ApiOperation({
    summary: 'Get all events',
    description: 'Retrieves all events with optional filtering by date range, organizer, venue, or category.',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: Date,
    description: 'Start date for filtering events (ISO 8601 format)',
    example: '2024-03-15T00:00:00Z'
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: Date,
    description: 'End date for filtering events (ISO 8601 format)',
    example: '2024-03-17T23:59:59Z'
  })
  @ApiQuery({
    name: 'organizerId',
    required: false,
    type: String,
    description: 'UUID of the event organizer',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({
    name: 'venueId',
    required: false,
    type: String,
    description: 'UUID of the event venue',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: String,
    description: 'UUID of the event category',
    example: '123e4567-e89b-12d3-a456-426614174002'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all events matching the filter criteria.',
    type: [Event],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  findAll(
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('organizerId') organizerId?: string,
    @Query('venueId') venueId?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    if (startDate && endDate) {
      return this.eventService.findByDateRange(startDate, endDate);
    }
    if (organizerId) {
      return this.eventService.findByOrganizerId(organizerId);
    }
    if (venueId) {
      return this.eventService.findByVenueId(venueId);
    }
    if (categoryId) {
      return this.eventService.findByCategoryId(categoryId);
    }
    return this.eventService.findAll();
  }

  /**
   * Retrieves active events.
   * Accessible by all authenticated users.
   */
  @Get('active')
  @ApiOperation({
    summary: 'Get all active events',
    description: 'Retrieves all events that are currently active (isActive = true).',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all active events.',
    type: [Event],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  findActive() {
    return this.eventService.findActive();
  }

  /**
   * Retrieves a specific event by ID.
   * Accessible by all authenticated users.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get an event by ID',
    description: 'Retrieves detailed information about a specific event by its UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the event',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the event details.',
    type: Event,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Event with ID 123e4567-e89b-12d3-a456-426614174000 not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  findOne(@Param('id') id: string) {
    return this.eventService.findById(id);
  }

  /**
   * Updates an event.
   * Requires ADMIN role.
   */
  @Patch(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Update an event',
    description: 'Updates an existing event with the provided data. Requires ADMIN role. All fields are optional for partial updates.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the event to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiBody({
    type: UpdateEventDto,
    description: 'Event update data',
    examples: {
      updateTitle: {
        value: {
          title: 'Updated Tech Conference 2024',
          description: 'Updated description...'
        }
      },
      updateDates: {
        value: {
          startDate: '2024-04-15T09:00:00Z',
          endDate: '2024-04-17T18:00:00Z'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'The event has been successfully updated.',
    type: Event,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data. Possible reasons: Invalid dates or invalid field values.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'End date must be after start date' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden resource' },
        error: { type: 'string', example: 'Forbidden' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Event with ID 123e4567-e89b-12d3-a456-426614174000 not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(id, updateEventDto);
  }

  /**
   * Updates an event's active status.
   * Requires ADMIN role.
   */
  @Patch(':id/status')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Update event status',
    description: 'Updates the active status of an event. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the event to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isActive: {
          type: 'boolean',
          description: 'New active status of the event',
          example: false
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'The event status has been successfully updated.',
    type: Event,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden resource' },
        error: { type: 'string', example: 'Forbidden' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Event with ID 123e4567-e89b-12d3-a456-426614174000 not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  updateStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.eventService.updateStatus(id, isActive);
  }

  /**
   * Deletes an event.
   * Requires ADMIN role.
   */
  @Delete(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Delete an event',
    description: 'Permanently deletes an event. Requires ADMIN role. This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the event to delete',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'The event has been successfully deleted.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Event successfully deleted'
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden resource' },
        error: { type: 'string', example: 'Forbidden' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Event with ID 123e4567-e89b-12d3-a456-426614174000 not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  remove(@Param('id') id: string) {
    return this.eventService.delete(id);
  }
} 