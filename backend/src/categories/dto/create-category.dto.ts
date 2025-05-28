import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for creating a new category.
 * Includes validation rules and Swagger documentation.
 * 
 * @class CreateCategoryDto
 * @author Philipp Borkovic
 */
export class CreateCategoryDto {
  @ApiProperty({
    description: 'The name of the category',
    example: 'Technology',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'A detailed description of the category',
    example: 'Events related to technology, software development, and IT',
    required: false,
    maxLength: 500
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
} 