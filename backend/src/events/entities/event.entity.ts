import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Venue } from '../../venues/entities/venue.entity';
import { Category } from '../../categories/entities/category.entity';

/**
 * Entity representing an event with scheduling, recurrence, and relationship metadata.
 */
@Entity({ name: 'events' })
export class Event {
  /**
   * Auto-generated primary key (UUID) for the event.
   *
   * @author Philipp Borkovic
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Human-readable title of the event.
   *
   * @author Philipp Borkovic
   */
  @Column({ type: 'varchar' })
  title: string;

  /**
   * Optional detailed description for the event.
   *
   * @author Philipp Borkovic
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Start date and time of the event (with time zone).
   *
   * @author Philipp Borkovic
   */
  @Column({ name: 'start_date', type: 'timestamp with time zone' })
  startDate: Date;

  /**
   * End date and time of the event (with time zone).
   *
   * @author Philipp Borkovic
   */
  @Column({ name: 'end_date', type: 'timestamp with time zone' })
  endDate: Date;

  /**
   * Flag indicating whether this event recurs on a schedule.
   *
   * @author Philipp Borkovic
   */
  @Column({ name: 'is_recurring', type: 'boolean', default: false })
  isRecurring: boolean;

  /**
   * Optional recurrence rule (RFC 5545 RRULE) for scheduling repeating events.
   *
   * @author Philipp Borkovic
   */
  @Column({ name: 'recurrence_rule', type: 'varchar', nullable: true })
  recurrenceRule?: string;

  /**
   * Foreign key referencing the venue where this event takes place.
   *
   * @author Philipp Borkovic
   */
  @Column({ name: 'venue_id', type: 'int' })
  venueId: number;

  /**
   * Relationship to the Venue entity.
   *
   * @author Philipp Borkovic
   */
  @ManyToOne(() => Venue, (venue) => venue.events, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  /**
   * Foreign key referencing the category of the event.
   *
   * @author Philipp Borkovic
   */
  @Column({ name: 'category_id', type: 'int' })
  categoryId: number;

  /**
   * Relationship to the Category entity.
   *
   * @author Philipp Borkovic
   */
  @ManyToOne(() => Category, (category) => category.events, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  /**
   * Foreign key referencing the User who organizes the event.
   *
   * @author Philipp Borkovic
   */
  @Column({ name: 'organizer_id', type: 'uuid' })
  organizerId: string;

  /**
   * Relationship to the User entity (organizer of the event).
   *
   * @author Philipp Borkovic
   */
  @ManyToOne(() => User, (user) => user.organizedEvents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizer_id' })
  organizer: User;

  /**
   * Timestamp when this event record was created.
   *
   * @author Philipp Borkovic
   */
  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  /**
   * Timestamp when this event record was last updated.
   *
   * @author Philipp Borkovic
   */
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

}