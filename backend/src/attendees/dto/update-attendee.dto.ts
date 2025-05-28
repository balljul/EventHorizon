import { IsEnum, IsOptional, IsString, IsBoolean, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus } from '../entities/attendee.entity';

export class UpdateAttendeeDto {
  @ApiProperty({
    description: 'The status of the attendance',
    enum: AttendanceStatus,
    example: AttendanceStatus.CONFIRMED,
    required: false,
  })
  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;

  @ApiProperty({
    description: 'Additional notes about the attendance',
    example: 'VIP guest with special requirements',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Whether the attendance fee has been paid',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @ApiProperty({
    description: 'The amount paid for attendance',
    example: 75.00,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  paymentAmount?: number;
} 