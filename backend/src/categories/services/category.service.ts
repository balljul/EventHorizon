import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Category } from '../entities/category.entity';

/**
 * Service for handling category-related business logic.
 * Implements the service pattern for category management.
 * 
 * @class CategoryService
 * @author Philipp Borkovic
 */
@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  /**
   * Creates a new category.
   * 
   * @param {CreateCategoryDto} createCategoryDto - The category creation data
   * @returns {Promise<Category>} The created category
   * @throws {ConflictException} If a category with the same name already exists
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryRepository.findByName(createCategoryDto.name);
    if (existingCategory) {
      throw new ConflictException(`Category with name '${createCategoryDto.name}' already exists`);
    }
    return this.categoryRepository.create(createCategoryDto);
  }

  /**
   * Retrieves all categories.
   * 
   * @returns {Promise<Category[]>} Array of all categories
   */
  async findAll(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  /**
   * Retrieves a category by ID.
   * 
   * @param {string} id - The UUID of the category
   * @returns {Promise<Category>} The found category
   * @throws {NotFoundException} If category is not found
   */
  async findById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  /**
   * Updates a category.
   * 
   * @param {string} id - The UUID of the category to update
   * @param {UpdateCategoryDto} updateCategoryDto - The category update data
   * @returns {Promise<Category>} The updated category
   * @throws {NotFoundException} If category is not found
   * @throws {ConflictException} If updating name and a category with the new name already exists
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id);

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryRepository.findByName(updateCategoryDto.name);
      if (existingCategory) {
        throw new ConflictException(`Category with name '${updateCategoryDto.name}' already exists`);
      }
    }

    const updatedCategory = await this.categoryRepository.update(id, updateCategoryDto);
    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return updatedCategory;
  }

  /**
   * Deletes a category.
   * 
   * @param {string} id - The UUID of the category to delete
   * @returns {Promise<void>}
   * @throws {NotFoundException} If category is not found
   */
  async delete(id: string): Promise<void> {
    const deleted = await this.categoryRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }

  /**
   * Finds active categories.
   * 
   * @returns {Promise<Category[]>} Array of active categories
   */
  async findActive(): Promise<Category[]> {
    return this.categoryRepository.findActive();
  }

  /**
   * Updates a category's active status.
   * 
   * @param {string} id - The UUID of the category
   * @param {boolean} isActive - The new active status
   * @returns {Promise<Category>} The updated category
   * @throws {NotFoundException} If category is not found
   */
  async updateStatus(id: string, isActive: boolean): Promise<Category> {
    const category = await this.categoryRepository.update(id, { isActive });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }
} 