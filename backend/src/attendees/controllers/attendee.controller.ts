import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { AttendeeService } from '../services/attendee.service';
import { CreateAttendeeDto } from '../dto/create-attendee.dto';
import { UpdateAttendeeDto } from '../dto/update-attendee.dto';
import { Attendee } from '../entities/attendee.entity';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody,
  ApiBearerAuth,
  ApiHeader,
  ApiExtraModels,
  ApiQuery,
  ApiConsumes,
  ApiProduces,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleType } from '../../roles/entities/role.entity';
import { AttendanceStatus } from '../entities/attendee.entity';

/**
 * Controller for managing event attendees.
 * Provides endpoints for CRUD operations and specialized attendee management.
 * 
 * @class AttendeeController
 * @author Philipp Borkovic
 */
@ApiTags('attendees')
@Controller('attendees')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@ApiHeader({
  name: 'Authorization',
  description: 'Bearer token for authentication. Format: Bearer <token>',
  required: true,
  schema: {
    type: 'string',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  },
})
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiExtraModels(Attendee)
export class AttendeeController {
  constructor(private readonly attendeeService: AttendeeService) {}

  /**
   * Retrieves all attendees across all events.
   * Requires ADMIN role for access.
   */
  @Get()
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Get all attendees',
    description: 'Retrieves a paginated list of all attendees across all events. Requires ADMIN role.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination (starts from 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'List of attendees retrieved successfully',
    type: [Attendee],
    schema: {
      example: [{
        id: '123e4567-e89b-12d3-a456-426614174000',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
        event: {
          id: '123e4567-e89b-12d3-a456-426614174002',
          title: 'Tech Conference 2024',
          startDate: '2024-03-15T09:00:00Z',
          endDate: '2024-03-17T18:00:00Z',
        },
        status: AttendanceStatus.CONFIRMED,
        notes: 'VIP guest with special dietary requirements',
        isPaid: true,
        paymentAmount: 299.99,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      }],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have required role (ADMIN)',
  })
  async findAll(): Promise<Attendee[]> {
    return this.attendeeService.findAll();
  }

  /**
   * Retrieves detailed information about a specific attendee.
   * Requires ADMIN role for access.
   */
  @Get(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Get attendee by ID',
    description: 'Retrieves detailed information about a specific attendee, including user and event details. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the attendee',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Attendee retrieved successfully',
    type: Attendee,
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
        event: {
          id: '123e4567-e89b-12d3-a456-426614174002',
          title: 'Tech Conference 2024',
          startDate: '2024-03-15T09:00:00Z',
          endDate: '2024-03-17T18:00:00Z',
        },
        status: AttendanceStatus.CONFIRMED,
        notes: 'VIP guest with special dietary requirements',
        isPaid: true,
        paymentAmount: 299.99,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Attendee not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Attendee with ID 123e4567-e89b-12d3-a456-426614174000 not found',
        error: 'Not Found',
      },
    },
  })
  async findById(@Param('id') id: string): Promise<Attendee> {
    return this.attendeeService.findById(id);
  }

  /**
   * Retrieves all attendees for a specific event.
   * Requires ADMIN role for access.
   */
  @Get('event/:eventId')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Get attendees by event',
    description: 'Retrieves all attendees registered for a specific event. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'eventId',
    description: 'The unique identifier of the event',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: AttendanceStatus,
    description: 'Filter attendees by status',
    example: AttendanceStatus.CONFIRMED,
  })
  @ApiResponse({
    status: 200,
    description: 'List of attendees retrieved successfully',
    type: [Attendee],
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  async findByEventId(@Param('eventId') eventId: string): Promise<Attendee[]> {
    return this.attendeeService.findByEventId(eventId);
  }

  /**
   * Retrieves all events a specific user is attending.
   * Requires ADMIN role for access.
   */
  @Get('user/:userId')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Get attendees by user',
    description: 'Retrieves all events a specific user is registered for. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'userId',
    description: 'The unique identifier of the user',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of attendees retrieved successfully',
    type: [Attendee],
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findByUserId(@Param('userId') userId: string): Promise<Attendee[]> {
    return this.attendeeService.findByUserId(userId);
  }

  /**
   * Creates a new attendee registration.
   * Requires ADMIN role for access.
   */
  @Post()
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new attendee',
    description: 'Registers a user for an event. Requires ADMIN role.',
  })
  @ApiBody({
    type: CreateAttendeeDto,
    description: 'Attendee registration data',
    examples: {
      example1: {
        value: {
          userId: '123e4567-e89b-12d3-a456-426614174001',
          eventId: '123e4567-e89b-12d3-a456-426614174002',
          status: AttendanceStatus.REGISTERED,
          notes: 'VIP guest with special dietary requirements',
          isPaid: false,
          paymentAmount: 299.99,
        },
        summary: 'Register user for event',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Attendee registered successfully',
    type: Attendee,
  })
  @ApiResponse({
    status: 409,
    description: 'User is already registered for this event',
    schema: {
      example: {
        statusCode: 409,
        message: 'User is already registered for this event',
        error: 'Conflict',
      },
    },
  })
  async create(@Body() createAttendeeDto: CreateAttendeeDto): Promise<Attendee> {
    return this.attendeeService.create(createAttendeeDto);
  }

  /**
   * Updates an existing attendee's information.
   * Requires ADMIN role for access.
   */
  @Put(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Update attendee',
    description: 'Updates an attendee\'s registration information. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the attendee',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateAttendeeDto,
    description: 'Updated attendee data',
    examples: {
      example1: {
        value: {
          status: AttendanceStatus.CONFIRMED,
          notes: 'Updated VIP requirements and dietary restrictions',
          isPaid: true,
          paymentAmount: 299.99,
        },
        summary: 'Update attendee information',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Attendee updated successfully',
    type: Attendee,
  })
  @ApiResponse({
    status: 404,
    description: 'Attendee not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateAttendeeDto: UpdateAttendeeDto,
  ): Promise<Attendee> {
    return this.attendeeService.update(id, updateAttendeeDto);
  }

  /**
   * Deletes an attendee registration.
   * Requires ADMIN role for access.
   */
  @Delete(':id')
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete attendee',
    description: 'Cancels a user\'s registration for an event. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the attendee',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Attendee registration cancelled successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Attendee not found',
  })
  async delete(@Param('id') id: string): Promise<void> {
    await this.attendeeService.delete(id);
  }

  /**
   * Updates the status of an attendee's registration.
   * Requires ADMIN role for access.
   */
  @Put(':id/status')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Update attendee status',
    description: 'Updates the status of an attendee\'s registration. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the attendee',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(AttendanceStatus),
          example: AttendanceStatus.CONFIRMED,
          description: 'The new status to set for the attendee',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Attendee status updated successfully',
    type: Attendee,
  })
  @ApiResponse({
    status: 404,
    description: 'Attendee not found',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<Attendee> {
    return this.attendeeService.updateStatus(id, status);
  }

  /**
   * Records payment for an attendee's registration.
   * Requires ADMIN role for access.
   */
  @Put(':id/payment')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Mark attendee as paid',
    description: 'Records payment for an attendee\'s registration. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the attendee',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          example: 299.99,
          description: 'The payment amount to record',
          minimum: 0,
        },
      },
      required: ['amount'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Payment recorded successfully',
    type: Attendee,
  })
  @ApiResponse({
    status: 404,
    description: 'Attendee not found',
  })
  async markAsPaid(
    @Param('id') id: string,
    @Body('amount') amount: number,
  ): Promise<Attendee> {
    return this.attendeeService.markAsPaid(id, amount);
  }

  /**
   * Retrieves attendance statistics for a specific event.
   * Requires ADMIN role for access.
   */
  @Get('event/:eventId/stats')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Get event attendance statistics',
    description: 'Retrieves detailed attendance statistics for a specific event. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'eventId',
    description: 'The unique identifier of the event',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Attendance statistics retrieved successfully',
    schema: {
      example: {
        total: 100,
        confirmed: 80,
        attended: 75,
        cancelled: 15,
        noShow: 5,
        paid: 85,
        unpaid: 15,
        totalRevenue: 29999.00,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  async getEventAttendanceStats(@Param('eventId') eventId: string) {
    return this.attendeeService.getEventAttendanceStats(eventId);
  }

  /**
   * Allows a user to register themselves for an event.
   * Requires authentication but not ADMIN role.
   */
  @Post('register')
  @Roles(RoleType.USER, RoleType.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Self-register for event',
    description: 'Allows an authenticated user to register themselves for an event.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        eventId: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174002',
          description: 'The unique identifier of the event to register for',
        },
        userId: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174001',
          description: 'The unique identifier of the user registering',
        },
      },
      required: ['eventId', 'userId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully registered for event',
    type: Attendee,
  })
  @ApiResponse({
    status: 409,
    description: 'User is already registered for this event',
  })
  @ApiResponse({
    status: 404,
    description: 'Event or user not found',
  })
  async registerForEvent(@Body() body: { eventId: string; userId: string }): Promise<Attendee> {
    const createAttendeeDto: CreateAttendeeDto = {
      userId: body.userId,
      eventId: body.eventId,
      status: AttendanceStatus.REGISTERED,
      isPaid: false,
      paymentAmount: 0,
    };
    return this.attendeeService.create(createAttendeeDto);
  }
} 