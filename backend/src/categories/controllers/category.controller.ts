import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiConsumes, ApiProduces, ApiExtraModels } from '@nestjs/swagger';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleType } from '../../auth/enums/role-type.enum';
import { Category } from '../entities/category.entity';

/**
 * Controller for managing categories.
 * Provides endpoints for CRUD operations and category management.
 * All endpoints require authentication via JWT token.
 * 
 * @class CategoryController
 * @author Philipp Borkovic
 */
@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiExtraModels(CreateCategoryDto, UpdateCategoryDto)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Creates a new category.
   * Requires ADMIN role.
   * Validates category name uniqueness.
   */
  @Post()
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Create a new category',
    description: 'Creates a new category with the provided details. Requires ADMIN role. Validates category name uniqueness.',
  })
  @ApiBody({
    type: CreateCategoryDto,
    description: 'Category creation data',
    examples: {
      technology: {
        value: {
          name: 'Technology',
          description: 'Events related to technology, software development, and IT'
        }
      },
      business: {
        value: {
          name: 'Business',
          description: 'Events related to business, entrepreneurship, and management'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'The category has been successfully created.',
    type: Category,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data. Possible reasons: Missing required fields or invalid field values.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'name must be a string' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden resource' },
        error: { type: 'string', example: 'Forbidden' }
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. A category with the same name already exists.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Category with name \'Technology\' already exists' },
        error: { type: 'string', example: 'Conflict' }
      }
    }
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  /**
   * Retrieves all categories.
   * Accessible by all authenticated users.
   */
  @Get()
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Retrieves all categories with their related events.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all categories.',
    type: [Category],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  findAll() {
    return this.categoryService.findAll();
  }

  /**
   * Retrieves active categories.
   * Accessible by all authenticated users.
   */
  @Get('active')
  @ApiOperation({
    summary: 'Get all active categories',
    description: 'Retrieves all categories that are currently active (isActive = true).',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all active categories.',
    type: [Category],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  findActive() {
    return this.categoryService.findActive();
  }

  /**
   * Retrieves a specific category by ID.
   * Accessible by all authenticated users.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get a category by ID',
    description: 'Retrieves detailed information about a specific category by its UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the category',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the category details.',
    type: Category,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Category with ID 123e4567-e89b-12d3-a456-426614174000 not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  findOne(@Param('id') id: string) {
    return this.categoryService.findById(id);
  }

  /**
   * Updates a category.
   * Requires ADMIN role.
   */
  @Patch(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Update a category',
    description: 'Updates an existing category with the provided data. Requires ADMIN role. All fields are optional for partial updates.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the category to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiBody({
    type: UpdateCategoryDto,
    description: 'Category update data',
    examples: {
      updateName: {
        value: {
          name: 'Technology & Innovation',
          description: 'Updated description...'
        }
      },
      updateStatus: {
        value: {
          isActive: false
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'The category has been successfully updated.',
    type: Category,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data. Possible reasons: Invalid field values.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'name must be a string' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden resource' },
        error: { type: 'string', example: 'Forbidden' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Category with ID 123e4567-e89b-12d3-a456-426614174000 not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. A category with the new name already exists.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Category with name \'Technology & Innovation\' already exists' },
        error: { type: 'string', example: 'Conflict' }
      }
    }
  })
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  /**
   * Updates a category's active status.
   * Requires ADMIN role.
   */
  @Patch(':id/status')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Update category status',
    description: 'Updates the active status of a category. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the category to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isActive: {
          type: 'boolean',
          description: 'New active status of the category',
          example: false
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'The category status has been successfully updated.',
    type: Category,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden resource' },
        error: { type: 'string', example: 'Forbidden' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Category with ID 123e4567-e89b-12d3-a456-426614174000 not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  updateStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.categoryService.updateStatus(id, isActive);
  }

  /**
   * Deletes a category.
   * Requires ADMIN role.
   */
  @Delete(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Delete a category',
    description: 'Permanently deletes a category. Requires ADMIN role. This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the category to delete',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'The category has been successfully deleted.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Category successfully deleted'
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. JWT token is missing or invalid.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have ADMIN role.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden resource' },
        error: { type: 'string', example: 'Forbidden' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Category with ID 123e4567-e89b-12d3-a456-426614174000 not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  remove(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
} 