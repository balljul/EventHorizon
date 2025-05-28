import { IsUUID, IsEnum, IsOptional, IsString, IsBoolean, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus } from '../entities/attendee.entity';

export class CreateAttendeeDto {
  @ApiProperty({
    description: 'The ID of the user attending the event',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'The ID of the event being attended',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  eventId: string;

  @ApiProperty({
    description: 'The status of the attendance',
    enum: AttendanceStatus,
    example: AttendanceStatus.REGISTERED,
    required: false,
  })
  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;

  @ApiProperty({
    description: 'Additional notes about the attendance',
    example: 'VIP guest',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Whether the attendance fee has been paid',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @ApiProperty({
    description: 'The amount paid for attendance',
    example: 50.00,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  paymentAmount?: number;
} 