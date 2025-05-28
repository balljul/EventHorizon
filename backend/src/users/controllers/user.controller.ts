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
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody,
  ApiBearerAuth,
  ApiHeader,
  ApiExtraModels,
} from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleType } from '../../roles/entities/role.entity';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@ApiHeader({
  name: 'Authorization',
  description: 'Bearer token for authentication',
  required: true,
})
@ApiExtraModels(User, UserResponseDto)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieves a list of all users in the system. Requires ADMIN role.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
    type: [UserResponseDto],
    schema: {
      example: [{
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['user'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have required role',
  })
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves detailed information about a specific user by their ID. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the user',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['user'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with ID 123e4567-e89b-12d3-a456-426614174000 not found',
        error: 'Not Found',
      },
    },
  })
  async findById(@Param('id') id: string): Promise<User> {
    return this.userService.findById(id);
  }

  @Post()
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new user',
    description: 'Creates a new user in the system. Requires ADMIN role.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User data for creation',
    examples: {
      example1: {
        value: {
          email: 'john.doe@example.com',
          password: 'securePassword123',
          firstName: 'John',
          lastName: 'Doe',
        },
        summary: 'Create user with required fields',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['user'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'email must be an email',
          'password must be longer than or equal to 8 characters',
          'firstName must be a string',
          'lastName must be a string',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Email already exists',
        error: 'Conflict',
      },
    },
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Put(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Update user',
    description: 'Updates an existing user\'s information. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the user to update',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Updated user data',
    examples: {
      example1: {
        value: {
          email: 'john.doe.updated@example.com',
          firstName: 'John Updated',
          lastName: 'Doe Updated',
        },
        summary: 'Update user information',
      },
      example2: {
        value: {
          password: 'newSecurePassword123',
        },
        summary: 'Update user password',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'john.doe.updated@example.com',
        firstName: 'John Updated',
        lastName: 'Doe Updated',
        roles: ['user'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with ID 123e4567-e89b-12d3-a456-426614174000 not found',
        error: 'Not Found',
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Permanently deletes a user from the system. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the user to delete',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with ID 123e4567-e89b-12d3-a456-426614174000 not found',
        error: 'Not Found',
      },
    },
  })
  async delete(@Param('id') id: string): Promise<void> {
    await this.userService.delete(id);
  }

  @Get(':id/roles')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Get user roles',
    description: 'Retrieves all roles assigned to a specific user. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the user',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User roles retrieved successfully',
    schema: {
      example: [
        {
          id: '1',
          name: 'user',
        },
        {
          id: '2',
          name: 'admin',
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with ID 123e4567-e89b-12d3-a456-426614174000 not found',
        error: 'Not Found',
      },
    },
  })
  async getUserRoles(@Param('id') id: string) {
    return this.userService.getUserRoles(id);
  }

  @Post(':id/roles/:roleId')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Assign role to user',
    description: 'Assigns a specific role to a user. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the user',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'roleId',
    description: 'The unique identifier of the role to assign',
    type: 'string',
    format: 'uuid',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Role assigned successfully',
    type: UserResponseDto,
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['user', 'admin'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User or role not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with ID 123e4567-e89b-12d3-a456-426614174000 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'User already has this role',
    schema: {
      example: {
        statusCode: 409,
        message: 'User already has the role: admin',
        error: 'Conflict',
      },
    },
  })
  async assignRoleToUser(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
  ): Promise<UserResponseDto> {
    const user = await this.userService.assignRoleToUser(id, roleId);
    return new UserResponseDto(user);
  }

  @Delete(':id/roles/:roleId')
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove role from user',
    description: 'Removes a specific role from a user. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the user',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'roleId',
    description: 'The unique identifier of the role to remove',
    type: 'string',
    format: 'uuid',
    example: '1',
  })
  @ApiResponse({
    status: 204,
    description: 'Role removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User or role not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User does not have the role with ID: 1',
        error: 'Not Found',
      },
    },
  })
  async removeRoleFromUser(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
  ): Promise<void> {
    await this.userService.removeRoleFromUser(id, roleId);
  }
}
