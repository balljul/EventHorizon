import { IsEnum, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleType } from '../entities/role.entity';

/**
 * Data Transfer Object for creating a new role.
 * 
 * @class CreateRoleDto
 * @author Philipp Borkovic
 */
export class CreateRoleDto {
  @ApiProperty({
    description: 'The name of the role',
    enum: RoleType,
    example: RoleType.ORGANIZER,
  })
  @IsEnum(RoleType)
  name: RoleType;

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
}