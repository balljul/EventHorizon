import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody, ApiConsumes, ApiProduces, ApiExtraModels } from '@nestjs/swagger';
import { TicketService } from '../services/ticket.service';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { TicketResponseDto } from '../dto/ticket-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleType } from '../../auth/enums/role-type.enum';

/**
 * Controller for managing tickets.
 * Provides endpoints for CRUD operations and ticket management.
 * All endpoints require authentication via JWT token.
 * 
 * @class TicketController
 * @author Philipp Borkovic
 */
@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiExtraModels(CreateTicketDto, UpdateTicketDto, TicketResponseDto)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  /**
   * Creates a new ticket.
   * Requires ADMIN role.
   */
  @Post()
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Create a new ticket',
    description: 'Creates a new ticket for an event. Requires ADMIN role.',
  })
  @ApiBody({
    type: CreateTicketDto,
    description: 'Ticket creation data',
    examples: {
      generalAdmission: {
        value: {
          name: 'General Admission',
          price: 29.99,
          quantity: 100,
          eventId: '123e4567-e89b-12d3-a456-426614174000'
        }
      },
      vipTicket: {
        value: {
          name: 'VIP Access',
          price: 99.99,
          quantity: 50,
          eventId: '123e4567-e89b-12d3-a456-426614174000'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'The ticket has been successfully created.',
    type: TicketResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Ticket price cannot be negative' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
  })
  async create(@Body() createTicketDto: CreateTicketDto) {
    const ticket = await this.ticketService.create(createTicketDto);
    return new TicketResponseDto(ticket);
  }

  /**
   * Retrieves all tickets with optional filtering.
   * Accessible by all authenticated users.
   */
  @Get()
  @ApiOperation({
    summary: 'Get all tickets',
    description: 'Retrieves all tickets with optional filtering by event or availability.',
  })
  @ApiQuery({
    name: 'eventId',
    required: false,
    type: String,
    description: 'UUID of the event to filter tickets',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({
    name: 'available',
    required: false,
    type: Boolean,
    description: 'Filter for available tickets only (quantity > 0)',
    example: true
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all tickets matching the filter criteria.',
    type: [TicketResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
  })
  async findAll(
    @Query('eventId') eventId?: string,
    @Query('available') available?: boolean,
  ) {
    let tickets;
    
    if (eventId && available) {
      tickets = await this.ticketService.findAvailableByEventId(eventId);
    } else if (eventId) {
      tickets = await this.ticketService.findByEventId(eventId);
    } else if (available) {
      tickets = await this.ticketService.findAvailable();
    } else {
      tickets = await this.ticketService.findAll();
    }
    
    return tickets.map(ticket => new TicketResponseDto(ticket));
  }

  /**
   * Retrieves available tickets.
   * Accessible by all authenticated users.
   */
  @Get('available')
  @ApiOperation({
    summary: 'Get all available tickets',
    description: 'Retrieves all tickets that have available quantity (quantity > 0).',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all available tickets.',
    type: [TicketResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
  })
  async findAvailable() {
    const tickets = await this.ticketService.findAvailable();
    return tickets.map(ticket => new TicketResponseDto(ticket));
  }

  /**
   * Retrieves tickets by event ID.
   * Accessible by all authenticated users.
   */
  @Get('event/:eventId')
  @ApiOperation({
    summary: 'Get tickets by event ID',
    description: 'Retrieves all tickets for a specific event.',
  })
  @ApiParam({
    name: 'eventId',
    description: 'UUID of the event',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all tickets for the event.',
    type: [TicketResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
  })
  async findByEventId(@Param('eventId') eventId: string) {
    const tickets = await this.ticketService.findByEventId(eventId);
    return tickets.map(ticket => new TicketResponseDto(ticket));
  }

  /**
   * Retrieves available tickets by event ID.
   * Accessible by all authenticated users.
   */
  @Get('event/:eventId/available')
  @ApiOperation({
    summary: 'Get available tickets by event ID',
    description: 'Retrieves all available tickets for a specific event.',
  })
  @ApiParam({
    name: 'eventId',
    description: 'UUID of the event',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all available tickets for the event.',
    type: [TicketResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
  })
  async findAvailableByEventId(@Param('eventId') eventId: string) {
    const tickets = await this.ticketService.findAvailableByEventId(eventId);
    return tickets.map(ticket => new TicketResponseDto(ticket));
  }

  /**
   * Retrieves a specific ticket by ID.
   * Accessible by all authenticated users.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get a ticket by ID',
    description: 'Retrieves detailed information about a specific ticket by its UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the ticket',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the ticket details.',
    type: TicketResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Ticket with ID 123e4567-e89b-12d3-a456-426614174000 not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  async findOne(@Param('id') id: string) {
    const ticket = await this.ticketService.findById(id);
    return new TicketResponseDto(ticket);
  }

  /**
   * Updates a ticket.
   * Requires ADMIN role.
   */
  @Patch(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Update a ticket',
    description: 'Updates an existing ticket with the provided data. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the ticket to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiBody({
    type: UpdateTicketDto,
    description: 'Ticket update data',
    examples: {
      updatePrice: {
        value: {
          price: 35.99
        }
      },
      updateQuantity: {
        value: {
          quantity: 150
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'The ticket has been successfully updated.',
    type: TicketResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found.',
  })
  async update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    const ticket = await this.ticketService.update(id, updateTicketDto);
    return new TicketResponseDto(ticket);
  }

  /**
   * Updates a ticket's quantity.
   * Requires ADMIN role.
   */
  @Patch(':id/quantity')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Update ticket quantity',
    description: 'Updates the quantity of a ticket. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the ticket to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quantity: {
          type: 'number',
          description: 'New quantity of the ticket',
          example: 75,
          minimum: 0
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'The ticket quantity has been successfully updated.',
    type: TicketResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid quantity value.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found.',
  })
  async updateQuantity(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    const ticket = await this.ticketService.updateQuantity(id, quantity);
    return new TicketResponseDto(ticket);
  }

  /**
   * Decreases a ticket's quantity.
   * Requires ADMIN role.
   */
  @Patch(':id/decrease')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Decrease ticket quantity',
    description: 'Decreases the quantity of a ticket by a specified amount. Used for ticket purchases. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the ticket',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          description: 'Amount to decrease the quantity by',
          example: 5,
          minimum: 1
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'The ticket quantity has been successfully decreased.',
    type: TicketResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid amount or not enough tickets available.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found.',
  })
  async decreaseQuantity(
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    const ticket = await this.ticketService.decreaseQuantity(id, amount);
    return new TicketResponseDto(ticket);
  }

  /**
   * Increases a ticket's quantity.
   * Requires ADMIN role.
   */
  @Patch(':id/increase')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Increase ticket quantity',
    description: 'Increases the quantity of a ticket by a specified amount. Used for ticket returns or additions. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the ticket',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          description: 'Amount to increase the quantity by',
          example: 10,
          minimum: 1
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'The ticket quantity has been successfully increased.',
    type: TicketResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid amount.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found.',
  })
  async increaseQuantity(
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    const ticket = await this.ticketService.increaseQuantity(id, amount);
    return new TicketResponseDto(ticket);
  }

  /**
   * Deletes a ticket.
   * Requires ADMIN role.
   */
  @Delete(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Delete a ticket',
    description: 'Permanently deletes a ticket. Requires ADMIN role. This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the ticket to delete',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'The ticket has been successfully deleted.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Ticket successfully deleted'
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found.',
  })
  async remove(@Param('id') id: string) {
    await this.ticketService.delete(id);
    return { message: 'Ticket successfully deleted' };
  }
}