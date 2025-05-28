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
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiProduces,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { Role } from '../entities/role.entity';
import { RoleType as EntityRoleType } from '../entities/role.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleType } from '../../auth/enums/role-type.enum';

/**
 * Controller for managing roles in the application.
 * Provides endpoints for CRUD operations on roles.
 * 
 * @class RoleController
 * @author Philipp Borkovic
 */
@ApiTags('roles')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * Creates a new role.
   * Only accessible by users with ADMIN role.
   * 
   * @param {CreateRoleDto} createRoleDto - The role data to create
   * @returns {Promise<Role>} The created role
   */
  @Post()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({
    type: CreateRoleDto,
    description: 'The role data to create',
    examples: {
      organizer: {
        value: {
          name: EntityRoleType.ORGANIZER,
          description: 'Can create and manage events',
        },
      },
      attendee: {
        value: {
          name: EntityRoleType.ATTENDEE,
          description: 'Can register for and attend events',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The role has been successfully created',
    type: Role,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have required role',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Role with same name already exists',
  })
  create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.roleService.create(createRoleDto);
  }

  /**
   * Retrieves all roles.
   * Accessible by all authenticated users.
   * 
   * @returns {Promise<Role[]>} Array of all roles
   */
  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of all roles',
    type: [Role],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated',
  })
  findAll(): Promise<Role[]> {
    return this.roleService.findAll();
  }

  /**
   * Retrieves all active roles.
   * Accessible by all authenticated users.
   * 
   * @returns {Promise<Role[]>} Array of active roles
   */
  @Get('active')
  @ApiOperation({ summary: 'Get all active roles' })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of active roles',
    type: [Role],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated',
  })
  findActive(): Promise<Role[]> {
    return this.roleService.findActive();
  }

  /**
   * Retrieves a specific role by ID.
   * Accessible by all authenticated users.
   * 
   * @param {string} id - The UUID of the role
   * @returns {Promise<Role>} The role if found
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the role',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the role if found',
    type: Role,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Role does not exist',
  })
  findOne(@Param('id') id: string): Promise<Role> {
    return this.roleService.findById(id);
  }

  /**
   * Updates a role.
   * Only accessible by users with ADMIN role.
   * 
   * @param {string} id - The UUID of the role to update
   * @param {UpdateRoleDto} updateRoleDto - The role data to update
   * @returns {Promise<Role>} The updated role
   */
  @Patch(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the role to update',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateRoleDto,
    description: 'The role data to update',
    examples: {
      updateDescription: {
        value: {
          description: 'Updated role description',
        },
      },
      updateStatus: {
        value: {
          isActive: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The role has been successfully updated',
    type: Role,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have required role',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Role does not exist',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Role with new name already exists',
  })
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    return this.roleService.update(id, updateRoleDto);
  }

  /**
   * Updates the active status of a role.
   * Only accessible by users with ADMIN role.
   * 
   * @param {string} id - The UUID of the role
   * @param {boolean} isActive - The new active status
   * @returns {Promise<Role>} The updated role
   */
  @Patch(':id/status')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Update role active status' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the role',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isActive: {
          type: 'boolean',
          description: 'The new active status',
          example: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The role status has been successfully updated',
    type: Role,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have required role',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Role does not exist',
  })
  updateStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ): Promise<Role> {
    return this.roleService.updateStatus(id, isActive);
  }

  /**
   * Deletes a role.
   * Only accessible by users with ADMIN role.
   * 
   * @param {string} id - The UUID of the role to delete
   * @returns {Promise<void>}
   */
  @Delete(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Delete a role' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the role to delete',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'The role has been successfully deleted',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have required role',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Role does not exist',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.roleService.delete(id);
  }
}