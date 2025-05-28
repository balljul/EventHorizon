import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Event } from '../../events/entities/event.entity';

/**
 * Entity representing a category in the system.
 * Categories are used to classify events.
 * 
 * @class Category
 * @author Philipp Borkovic
 */
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Event, event => event.category)
  events: Event[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}