import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

/**
 * Repository for handling category-related database operations.
 * Implements the repository pattern for category management.
 * 
 * @class CategoryRepository
 * @author Philipp Borkovic
 */
@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
  ) {}

  /**
   * Retrieves all categories with their related events.
   * 
   * @returns {Promise<Category[]>} Array of categories with their relations
   */
  async findAll(): Promise<Category[]> {
    return this.repository.find({
      relations: ['events'],
    });
  }

  /**
   * Retrieves a category by its ID with all related events.
   * 
   * @param {string} id - The UUID of the category
   * @returns {Promise<Category | null>} The category if found, null otherwise
   */
  async findById(id: string): Promise<Category | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['events'],
    });
  }

  /**
   * Retrieves a category by its name.
   * 
   * @param {string} name - The name of the category
   * @returns {Promise<Category | null>} The category if found, null otherwise
   */
  async findByName(name: string): Promise<Category | null> {
    return this.repository.findOne({
      where: { name },
      relations: ['events'],
    });
  }

  /**
   * Creates a new category.
   * 
   * @param {Partial<Category>} categoryData - The category data to create
   * @returns {Promise<Category>} The created category
   */
  async create(categoryData: Partial<Category>): Promise<Category> {
    const category = this.repository.create(categoryData);
    return this.repository.save(category);
  }

  /**
   * Updates an existing category.
   * 
   * @param {string} id - The UUID of the category to update
   * @param {Partial<Category>} categoryData - The category data to update
   * @returns {Promise<Category | null>} The updated category if found, null otherwise
   */
  async update(id: string, categoryData: Partial<Category>): Promise<Category | null> {
    await this.repository.update(id, categoryData);
    return this.findById(id);
  }

  /**
   * Deletes a category.
   * 
   * @param {string} id - The UUID of the category to delete
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  /**
   * Saves a category entity.
   * 
   * @param {Category} category - The category entity to save
   * @returns {Promise<Category>} The saved category
   */
  async save(category: Category): Promise<Category> {
    return this.repository.save(category);
  }

  /**
   * Finds active categories.
   * 
   * @returns {Promise<Category[]>} Array of active categories
   */
  async findActive(): Promise<Category[]> {
    return this.repository.find({
      where: { isActive: true },
      relations: ['events'],
    });
  }
} 