import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { RoleRepository } from '../repositories/role.repository';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { Role, RoleType } from '../entities/role.entity';

/**
 * Service for handling role-related business logic.
 * Implements role management operations and validation.
 * 
 * @class RoleService
 * @author Philipp Borkovic
 */
@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  /**
   * Retrieves all roles.
   * 
   * @returns {Promise<Role[]>} Array of all roles
   */
  async findAll(): Promise<Role[]> {
    return this.roleRepository.findAll();
  }

  /**
   * Retrieves a role by its ID.
   * 
   * @param {string} id - The UUID of the role
   * @returns {Promise<Role>} The role if found
   * @throws {NotFoundException} If role is not found
   */
  async findById(id: string): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  /**
   * Retrieves a role by its name.
   * 
   * @param {RoleType} name - The name of the role
   * @returns {Promise<Role>} The role if found
   * @throws {NotFoundException} If role is not found
   */
  async findByName(name: RoleType): Promise<Role> {
    const role = await this.roleRepository.findByName(name);
    if (!role) {
      throw new NotFoundException(`Role with name ${name} not found`);
    }
    return role;
  }

  /**
   * Creates a new role.
   * 
   * @param {CreateRoleDto} createRoleDto - The role data to create
   * @returns {Promise<Role>} The created role
   * @throws {ConflictException} If role with same name already exists
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepository.findByName(createRoleDto.name);
    if (existingRole) {
      throw new ConflictException(`Role with name ${createRoleDto.name} already exists`);
    }

    return this.roleRepository.create({
      ...createRoleDto,
      isActive: true,
    });
  }

  /**
   * Updates an existing role.
   * 
   * @param {string} id - The UUID of the role to update
   * @param {UpdateRoleDto} updateRoleDto - The role data to update
   * @returns {Promise<Role>} The updated role
   * @throws {NotFoundException} If role is not found
   * @throws {ConflictException} If updating name and role with new name already exists
   */
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findById(id);

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findByName(updateRoleDto.name);
      if (existingRole) {
        throw new ConflictException(`Role with name ${updateRoleDto.name} already exists`);
      }
    }

    const updatedRole = await this.roleRepository.update(id, updateRoleDto);
    if (!updatedRole) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return updatedRole;
  }

  /**
   * Deletes a role.
   * 
   * @param {string} id - The UUID of the role to delete
   * @returns {Promise<void>}
   * @throws {NotFoundException} If role is not found
   */
  async delete(id: string): Promise<void> {
    const role = await this.findById(id);
    const deleted = await this.roleRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
  }

  /**
   * Retrieves all active roles.
   * 
   * @returns {Promise<Role[]>} Array of active roles
   */
  async findActive(): Promise<Role[]> {
    return this.roleRepository.findActive();
  }

  /**
   * Retrieves roles by user ID.
   * 
   * @param {string} userId - The UUID of the user
   * @returns {Promise<Role[]>} Array of roles associated with the user
   */
  async findByUserId(userId: string): Promise<Role[]> {
    return this.roleRepository.findByUserId(userId);
  }

  /**
   * Updates the active status of a role.
   * 
   * @param {string} id - The UUID of the role
   * @param {boolean} isActive - The new active status
   * @returns {Promise<Role>} The updated role
   * @throws {NotFoundException} If role is not found
   */
  async updateStatus(id: string, isActive: boolean): Promise<Role> {
    const role = await this.findById(id);
    const updatedRole = await this.roleRepository.update(id, { isActive });
    if (!updatedRole) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return updatedRole;
  }
}