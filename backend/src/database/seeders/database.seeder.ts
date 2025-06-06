import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { Role, RoleType } from '../../roles/entities/role.entity';
import { Category } from '../../categories/entities/category.entity';
import { Venue } from '../../venues/entities/venue.entity';
import { Event } from '../../events/entities/event.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
// import { Attendee, AttendanceStatus } from '../../attendees/entities/attendee.entity';

/**
 * Database seeder service for populating the database with dummy data.
 * Creates sample data for all entities in the system.
 * 
 * @class DatabaseSeeder
 * @author Philipp Borkovic
 */
@Injectable()
export class DatabaseSeeder {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Venue)
    private readonly venueRepository: Repository<Venue>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    // @InjectRepository(Attendee)
    // private readonly attendeeRepository: Repository<Attendee>,
  ) {}

  /**
   * Seeds the entire database with dummy data.
   */
  async seed(): Promise<void> {
    console.log('🌱 Starting database seeding...');

    // Check if data already exists
    const existingRoles = await this.roleRepository.count();
    if (existingRoles > 0) {
      console.log('⚠️  Database already contains data. Skipping seeding.');
      return;
    }

    try {
      // Seed in order of dependencies
      const roles = await this.seedRoles();
      const users = await this.seedUsers(roles);
      const categories = await this.seedCategories();
      const venues = await this.seedVenues();
      const events = await this.seedEvents(users, categories, venues);
      const tickets = await this.seedTickets(events);
      // Skip attendees for now due to migration/entity mismatch
      // await this.seedAttendees(users, events);

      console.log('✅ Database seeding completed successfully!');
      console.log(`📊 Created:
        - ${roles.length} roles
        - ${users.length} users
        - ${categories.length} categories
        - ${venues.length} venues
        - ${events.length} events
        - ${tickets.length} tickets`);

    } catch (error) {
      console.error('❌ Error during database seeding:', error);
      throw error;
    }
  }

  /**
   * Seeds roles.
   */
  private async seedRoles(): Promise<Role[]> {
    console.log('👤 Seeding roles...');

    const rolesData = [
      {
        name: RoleType.ADMIN,
        description: 'Administrator with full system access',
        isActive: true,
      },
      {
        name: RoleType.USER,
        description: 'Regular user with basic access',
        isActive: true,
      },
      {
        name: RoleType.ORGANIZER,
        description: 'Event organizer with event management access',
        isActive: true,
      },
      {
        name: RoleType.ATTENDEE,
        description: 'Event attendee with basic attendance access',
        isActive: true,
      },
    ];

    const roles: Role[] = [];
    for (const roleData of rolesData) {
      const role = this.roleRepository.create(roleData);
      const savedRole = await this.roleRepository.save(role);
      roles.push(savedRole);
    }

    return roles;
  }

  /**
   * Seeds users with different roles.
   */
  private async seedUsers(roles: Role[]): Promise<User[]> {
    console.log('👥 Seeding users...');

    const adminRole = roles.find(r => r.name === RoleType.ADMIN);
    const userRole = roles.find(r => r.name === RoleType.USER);
    const organizerRole = roles.find(r => r.name === RoleType.ORGANIZER);

    const usersData = [
      {
        email: 'admin@eventhorizon.com',
        password: await bcrypt.hash('admin123', 10),
        firstName: 'Admin',
        lastName: 'User',
        roles: [adminRole],
      },
      {
        email: 'john.doe@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'John',
        lastName: 'Doe',
        roles: [userRole],
      },
      {
        email: 'jane.smith@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Jane',
        lastName: 'Smith',
        roles: [organizerRole, userRole],
      },
      {
        email: 'mike.johnson@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Mike',
        lastName: 'Johnson',
        roles: [userRole],
      },
      {
        email: 'sarah.wilson@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Sarah',
        lastName: 'Wilson',
        roles: [organizerRole, userRole],
      },
      {
        email: 'david.brown@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'David',
        lastName: 'Brown',
        roles: [userRole],
      },
    ];

    const users: User[] = [];
    for (const userData of usersData) {
      const user = this.userRepository.create(userData);
      const savedUser = await this.userRepository.save(user);
      users.push(savedUser);
    }

    return users;
  }

  /**
   * Seeds categories.
   */
  private async seedCategories(): Promise<Category[]> {
    console.log('📂 Seeding categories...');

    const categoriesData = [
      {
        name: 'Technology',
        description: 'Technology and software development events',
        isActive: true,
      },
      {
        name: 'Business',
        description: 'Business and entrepreneurship events',
        isActive: true,
      },
      {
        name: 'Entertainment',
        description: 'Music, movies, and entertainment events',
        isActive: true,
      },
      {
        name: 'Sports',
        description: 'Sports and fitness related events',
        isActive: true,
      },
      {
        name: 'Education',
        description: 'Educational workshops and seminars',
        isActive: true,
      },
      {
        name: 'Arts & Culture',
        description: 'Art exhibitions, cultural events, and creative workshops',
        isActive: true,
      },
    ];

    const categories: Category[] = [];
    for (const categoryData of categoriesData) {
      const category = this.categoryRepository.create(categoryData);
      const savedCategory = await this.categoryRepository.save(category);
      categories.push(savedCategory);
    }

    return categories;
  }

  /**
   * Seeds venues.
   */
  private async seedVenues(): Promise<Venue[]> {
    console.log('🏢 Seeding venues...');

    const venuesData = [
      {
        name: 'Tech Conference Center',
        description: 'State-of-the-art conference center with modern AV equipment',
        address: '123 Innovation Blvd',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        isActive: true,
      },
      {
        name: 'Grand Ballroom Hotel',
        description: 'Elegant ballroom perfect for large events and galas',
        address: '456 Luxury Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        isActive: true,
      },
      {
        name: 'Community Arts Center',
        description: 'Local community center with flexible event spaces',
        address: '789 Community Dr',
        city: 'Austin',
        state: 'TX',
        zipCode: '73301',
        isActive: true,
      },
      {
        name: 'Outdoor Amphitheater',
        description: 'Beautiful outdoor venue with natural acoustics',
        address: '321 Park Lane',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        isActive: true,
      },
      {
        name: 'Business Innovation Hub',
        description: 'Modern co-working space with meeting rooms',
        address: '654 Startup St',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        isActive: true,
      },
    ];

    const venues: Venue[] = [];
    for (const venueData of venuesData) {
      const venue = this.venueRepository.create(venueData);
      const savedVenue = await this.venueRepository.save(venue);
      venues.push(savedVenue);
    }

    return venues;
  }

  /**
   * Seeds events.
   */
  private async seedEvents(users: User[], categories: Category[], venues: Venue[]): Promise<Event[]> {
    console.log('🎉 Seeding events...');

    const organizers = users.filter(u => u.roles?.some(r => r.name === RoleType.ORGANIZER || r.name === RoleType.ADMIN));

    const eventsData = [
      {
        title: 'Tech Summit 2024',
        description: 'Annual technology summit featuring the latest innovations in AI, blockchain, and cloud computing. Join industry leaders and innovators for three days of insights, networking, and hands-on workshops.',
        location: 'Tech Conference Center',
        startDate: new Date('2024-07-15T09:00:00Z'),
        endDate: new Date('2024-07-17T18:00:00Z'),
        price: 299.99,
        capacity: 500,
        isActive: true,
        organizerId: organizers[0]?.id,
        venueId: venues[0]?.id,
        categoryId: categories.find(c => c.name === 'Technology')?.id,
      },
      {
        title: 'Business Leadership Conference',
        description: 'Transform your leadership skills with insights from Fortune 500 CEOs and successful entrepreneurs. Network with like-minded professionals and discover strategies for business growth.',
        location: 'Grand Ballroom Hotel',
        startDate: new Date('2024-08-20T08:30:00Z'),
        endDate: new Date('2024-08-22T17:00:00Z'),
        price: 450.00,
        capacity: 300,
        isActive: true,
        organizerId: organizers[1] ? organizers[1].id : organizers[0].id,
        venueId: venues[1]?.id,
        categoryId: categories.find(c => c.name === 'Business')?.id,
      },
      {
        title: 'Summer Music Festival',
        description: 'Three days of incredible live music featuring local and international artists across multiple genres. Food trucks, craft vendors, and family-friendly activities included.',
        location: 'Outdoor Amphitheater',
        startDate: new Date('2024-06-21T16:00:00Z'),
        endDate: new Date('2024-06-23T23:00:00Z'),
        price: 89.99,
        capacity: 2000,
        isActive: true,
        organizerId: organizers[0]?.id,
        venueId: venues[3]?.id,
        categoryId: categories.find(c => c.name === 'Entertainment')?.id,
      },
      {
        title: 'Digital Marketing Workshop',
        description: 'Learn the latest digital marketing strategies including SEO, social media marketing, content creation, and analytics. Hands-on exercises and real-world case studies included.',
        location: 'Business Innovation Hub',
        startDate: new Date('2024-09-10T10:00:00Z'),
        endDate: new Date('2024-09-10T16:00:00Z'),
        price: 125.00,
        capacity: 50,
        isActive: true,
        organizerId: organizers[1] ? organizers[1].id : organizers[0].id,
        venueId: venues[4]?.id,
        categoryId: categories.find(c => c.name === 'Education')?.id,
      },
      {
        title: 'Art & Wine Evening',
        description: 'Elegant evening combining local art exhibition with wine tasting. Meet local artists, enjoy curated wines, and support the local arts community.',
        location: 'Community Arts Center',
        startDate: new Date('2024-10-05T18:00:00Z'),
        endDate: new Date('2024-10-05T22:00:00Z'),
        price: 65.00,
        capacity: 150,
        isActive: true,
        organizerId: organizers[0]?.id,
        venueId: venues[2]?.id,
        categoryId: categories.find(c => c.name === 'Arts & Culture')?.id,
      },
      {
        title: 'Startup Pitch Competition',
        description: 'Watch innovative startups pitch their ideas to investors and industry experts. Network with entrepreneurs, investors, and tech enthusiasts.',
        location: 'Business Innovation Hub',
        startDate: new Date('2024-11-12T13:00:00Z'),
        endDate: new Date('2024-11-12T19:00:00Z'),
        price: 25.00,
        capacity: 200,
        isActive: true,
        organizerId: organizers[1] ? organizers[1].id : organizers[0].id,
        venueId: venues[4]?.id,
        categoryId: categories.find(c => c.name === 'Business')?.id,
      },
    ];

    const events: Event[] = [];
    for (const eventData of eventsData) {
      const event = this.eventRepository.create(eventData);
      const savedEvent = await this.eventRepository.save(event);
      events.push(savedEvent);
    }

    return events;
  }

  /**
   * Seeds tickets for events.
   */
  private async seedTickets(events: Event[]): Promise<Ticket[]> {
    console.log('🎫 Seeding tickets...');

    const tickets: Ticket[] = [];

    for (const event of events) {
      // Create different ticket types for each event
      const ticketTypes = [
        {
          name: 'General Admission',
          price: event.price * 0.8, // 20% discount for general admission
          quantity: Math.floor(event.capacity * 0.6),
          eventId: event.id,
        },
        {
          name: 'VIP Access',
          price: event.price * 1.5, // 50% premium for VIP
          quantity: Math.floor(event.capacity * 0.2),
          eventId: event.id,
        },
        {
          name: 'Early Bird',
          price: event.price * 0.7, // 30% discount for early bird
          quantity: Math.floor(event.capacity * 0.2),
          eventId: event.id,
        },
      ];

      for (const ticketData of ticketTypes) {
        const ticket = this.ticketRepository.create(ticketData);
        const savedTicket = await this.ticketRepository.save(ticket);
        tickets.push(savedTicket);
      }
    }

    return tickets;
  }

  /**
   * Seeds attendees for events.
   * Commented out due to migration/entity mismatch
   */
  // private async seedAttendees(users: User[], events: Event[]): Promise<void> {
  //   console.log('👥 Seeding attendees...');
  //   // Implementation commented out due to table structure mismatch
  // }

  /**
   * Clears all data from the database.
   */
  async clear(): Promise<void> {
    console.log('🧹 Clearing database...');

    // Use direct SQL to handle foreign key constraints
    const connection = this.roleRepository.manager.connection;
    
    // Disable foreign key checks and truncate tables
    await connection.query('SET session_replication_role = replica;');
    
    try {
      await connection.query('TRUNCATE TABLE tickets CASCADE;');
      await connection.query('TRUNCATE TABLE events CASCADE;');
      await connection.query('TRUNCATE TABLE venues CASCADE;');
      await connection.query('TRUNCATE TABLE categories CASCADE;');
      await connection.query('TRUNCATE TABLE user_roles CASCADE;');
      await connection.query('TRUNCATE TABLE users CASCADE;');
      await connection.query('TRUNCATE TABLE roles CASCADE;');
    } finally {
      // Re-enable foreign key checks
      await connection.query('SET session_replication_role = DEFAULT;');
    }

    console.log('✅ Database cleared successfully!');
  }
}