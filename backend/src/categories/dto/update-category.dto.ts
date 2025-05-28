import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for updating an existing category.
 * All fields are optional for partial updates.
 * Includes validation rules and Swagger documentation.
 * 
 * @class UpdateCategoryDto
 * @author Philipp Borkovic
 */
export class UpdateCategoryDto {
  @ApiProperty({
    description: 'The updated name of the category',
    example: 'Technology & Innovation',
    required: false,
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'The updated description of the category',
    example: 'Events related to technology, innovation, and digital transformation',
    required: false,
    maxLength: 500
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'The active status of the category',
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 