import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';
import { RoleService } from '../../roles/services/role.service';
import { Role as RoleEntity } from '../../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

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
    return this.userRepository.findByEmail(email);
  }

  async create(userData: Partial<User>): Promise<User> {
    // Check if user with the same email already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException(`User with email ${userData.email} already exists`);
    }

    // Hash the password
    if (userData.password) {
      userData.password = await this.hashPassword(userData.password);
    }

    return this.userRepository.create(userData);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    // Check if user exists
    await this.findById(id);

    // Hash the password if it's being updated
    if (userData.password) {
      userData.password = await this.hashPassword(userData.password);
    }

    return this.userRepository.update(id, userData);
  }

  async delete(id: string): Promise<void> {
    // Check if user exists
    await this.findById(id);

    await this.userRepository.delete(id);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async findUserWithRoles(id: string): Promise<User> {
    const user = await this.userRepository.findByIdWithRoles(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async assignRoleToUser(userId: string, roleId: number): Promise<User> {
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

  async removeRoleFromUser(userId: string, roleId: number): Promise<User> {
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
