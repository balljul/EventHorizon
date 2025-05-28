import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

export enum AttendanceStatus {
  REGISTERED = 'registered',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  ATTENDED = 'attended',
  NO_SHOW = 'no_show',
}

@Entity()
export class Attendee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @ManyToOne(() => Event, { eager: true })
  event: Event;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.REGISTERED,
  })
  status: AttendanceStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: false })
  isPaid: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  paymentAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 