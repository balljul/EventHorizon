import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
    required: false,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'The password for the user account',
    example: 'securePassword123',
    required: false,
    minLength: 8,
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
    required: false,
  })
  @IsString({ message: 'First name must be a string' })
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    required: false,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsOptional()
  lastName?: string;
}
