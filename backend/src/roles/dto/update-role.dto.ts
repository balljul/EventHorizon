import { IsEnum, IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleType } from '../entities/role.entity';

/**
 * Data Transfer Object for updating an existing role.
 * All fields are optional as this is used for partial updates.
 * 
 * @class UpdateRoleDto
 * @author Philipp Borkovic
 */
export class UpdateRoleDto {
  @ApiProperty({
    description: 'The name of the role',
    enum: RoleType,
    example: RoleType.ORGANIZER,
    required: false,
  })
  @IsEnum(RoleType)
  @IsOptional()
  name?: RoleType;

  @ApiProperty({
    description: 'Detailed description of the role',
    example: 'Can create and manage events',
    required: false,
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Whether the role is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 