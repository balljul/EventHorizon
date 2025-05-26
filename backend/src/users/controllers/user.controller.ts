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
} from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users', description: 'Retrieve a list of all users' })
  @ApiResponse({ status: 200, description: 'List of users retrieved successfully', type: [UserResponseDto] })
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userService.findAll();
    return users.map(user => new UserResponseDto(user));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID', description: 'Retrieve a user by their ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userService.findById(id);
    return new UserResponseDto(user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user', description: 'Create a new user' })
  @ApiBody({ type: CreateUserDto, description: 'User data' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 409, description: 'Conflict - User with this email already exists' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.create(createUserDto);
    return new UserResponseDto(user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user', description: 'Update an existing user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiBody({ type: UpdateUserDto, description: 'Updated user data' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userService.update(id, updateUserDto);
    return new UserResponseDto(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user', description: 'Delete a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.userService.delete(id);
  }

  @Get(':id/roles')
  @ApiOperation({ summary: 'Get user roles', description: 'Retrieve all roles assigned to a user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'User roles retrieved successfully', type: [Object] })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserRoles(@Param('id') id: string) {
    return this.userService.getUserRoles(id);
  }

  @Post(':id/roles/:roleId')
  @ApiOperation({ summary: 'Assign role to user', description: 'Assign a role to a user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiParam({ name: 'roleId', description: 'Role ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  @ApiResponse({ status: 409, description: 'User already has this role' })
  async assignRoleToUser(
    @Param('id') id: string,
    @Param('roleId') roleId: number,
  ): Promise<UserResponseDto> {
    const user = await this.userService.assignRoleToUser(id, roleId);
    return new UserResponseDto(user);
  }

  @Delete(':id/roles/:roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove role from user', description: 'Remove a role from a user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiParam({ name: 'roleId', description: 'Role ID', type: 'number' })
  @ApiResponse({ status: 204, description: 'Role removed successfully' })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  async removeRoleFromUser(
    @Param('id') id: string,
    @Param('roleId') roleId: number,
  ): Promise<void> {
    await this.userService.removeRoleFromUser(id, roleId);
  }
}
