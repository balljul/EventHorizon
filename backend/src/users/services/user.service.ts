import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';
import { RoleService } from '../../roles/services/role.service';
import { Role as RoleEntity } from '../../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleService: RoleService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const userData = {
      ...createUserDto,
      password: hashedPassword,
    };

    return this.userRepository.create(userData);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findById(id); // Check if user exists

    if (updateUserDto.email) {
      const existingUser = await this.userRepository.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.userRepository.update(id, updateUserDto);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id); // Check if user exists
    await this.userRepository.delete(id);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid credentials');
    }

    return user;
  }

  async findUserWithRoles(id: string): Promise<User> {
    const user = await this.userRepository.findByIdWithRoles(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<User> {
    // Find the user
    const user = await this.findUserWithRoles(userId);

    // Find the role
    const role = await this.roleService.findById(roleId);

    // Check if the user already has this role
    const hasRole = user.roles?.some(r => r.id === role.id);
    if (hasRole) {
      throw new ConflictException(`User already has the role: ${role.name}`);
    }

    // Assign the role
    if (!user.roles) {
      user.roles = [];
    }
    user.roles.push(role);

    // Save the user
    return this.userRepository.save(user);
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<User> {
    // Find the user
    const user = await this.findUserWithRoles(userId);

    // Check if the user has this role
    if (!user.roles || !user.roles.some(r => r.id === roleId)) {
      throw new NotFoundException(`User does not have the role with ID: ${roleId}`);
    }

    // Remove the role
    user.roles = user.roles.filter(r => r.id !== roleId);

    // Save the user
    return this.userRepository.save(user);
  }

  async getUserRoles(userId: string): Promise<RoleEntity[]> {
    const user = await this.findUserWithRoles(userId);
    return user.roles || [];
  }
}


