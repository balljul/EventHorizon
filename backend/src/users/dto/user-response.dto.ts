import { Exclude, Expose } from 'class-transformer';
import { User } from '../entities/user.entity';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
  })
  @Expose()
  email: string;

  @ApiHideProperty()
  @Exclude()
  password: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  @Expose()
  firstName: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  @Expose()
  lastName: string;

  @ApiProperty({
    description: 'The date when the user was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'The date when the user was last updated',
    example: '2023-01-02T00:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
