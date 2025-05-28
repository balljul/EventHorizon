import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, RoleType } from '../entities/role.entity';

/**
 * Repository for handling role-related database operations.
 * Implements the repository pattern for role management.
 * 
 * @class RoleRepository
 * @author Philipp Borkovic
 */
@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repository: Repository<Role>,
  ) {}

  /**
   * Retrieves all roles with their associated users.
   * 
   * @returns {Promise<Role[]>} Array of roles with their users
   */
  async findAll(): Promise<Role[]> {
    return this.repository.find({
      relations: ['users'],
    });
  }

  /**
   * Retrieves a role by its ID with associated users.
   * 
   * @param {string} id - The UUID of the role
   * @returns {Promise<Role | null>} The role if found, null otherwise
   */
  async findById(id: string): Promise<Role | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['users'],
    });
  }

  /**
   * Retrieves a role by its name.
   * 
   * @param {RoleType} name - The name of the role
   * @returns {Promise<Role | null>} The role if found, null otherwise
   */
  async findByName(name: RoleType): Promise<Role | null> {
    return this.repository.findOne({
      where: { name },
      relations: ['users'],
    });
  }

  /**
   * Creates a new role.
   * 
   * @param {Partial<Role>} roleData - The role data to create
   * @returns {Promise<Role>} The created role
   */
  async create(roleData: Partial<Role>): Promise<Role> {
    const role = this.repository.create(roleData);
    return this.repository.save(role);
  }

  /**
   * Updates an existing role.
   * 
   * @param {string} id - The UUID of the role to update
   * @param {Partial<Role>} roleData - The role data to update
   * @returns {Promise<Role | null>} The updated role if found, null otherwise
   */
  async update(id: string, roleData: Partial<Role>): Promise<Role | null> {
    await this.repository.update(id, roleData);
    return this.findById(id);
  }

  /**
   * Deletes a role.
   * 
   * @param {string} id - The UUID of the role to delete
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  /**
   * Saves a role entity.
   * 
   * @param {Role} role - The role entity to save
   * @returns {Promise<Role>} The saved role
   */
  async save(role: Role): Promise<Role> {
    return this.repository.save(role);
  }

  /**
   * Finds all active roles.
   * 
   * @returns {Promise<Role[]>} Array of active roles
   */
  async findActive(): Promise<Role[]> {
    return this.repository.find({
      where: { isActive: true },
      relations: ['users'],
    });
  }

  /**
   * Finds roles by user ID.
   * 
   * @param {string} userId - The UUID of the user
   * @returns {Promise<Role[]>} Array of roles associated with the user
   */
  async findByUserId(userId: string): Promise<Role[]> {
    return this.repository
      .createQueryBuilder('role')
      .innerJoin('role.users', 'user', 'user.id = :userId', { userId })
      .getMany();
  }
}