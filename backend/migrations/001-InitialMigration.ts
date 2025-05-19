import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class InitialMigration001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable uuid extension
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

        // Roles table
        await queryRunner.createTable(
            new Table({
                name: 'roles',
                columns: [
                    { name: 'id', type: 'serial', isPrimary: true },
                    { name: 'name', type: 'varchar', isUnique: true, isNullable: false },
                ],
            }),
            true,
        );

        // Users table
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    { name: 'email', type: 'varchar', isUnique: true, isNullable: false },
                    { name: 'password', type: 'varchar', isNullable: false },
                    { name: 'first_name', type: 'varchar', isNullable: false },
                    { name: 'last_name', type: 'varchar', isNullable: false },
                    { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
                    { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
                ],
            }),
            true,
        );

        // User roles join table
        await queryRunner.createTable(
            new Table({
                name: 'user_roles',
                columns: [
                    { name: 'user_id', type: 'uuid', isPrimary: true },
                    { name: 'role_id', type: 'int', isPrimary: true },
                ],
            }),
            true,
        );
        await queryRunner.createForeignKey(
            'user_roles',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );
        await queryRunner.createForeignKey(
            'user_roles',
            new TableForeignKey({
                columnNames: ['role_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'roles',
                onDelete: 'CASCADE',
            }),
        );

        // Categories table
        await queryRunner.createTable(
            new Table({
                name: 'categories',
                columns: [
                    { name: 'id', type: 'serial', isPrimary: true },
                    { name: 'name', type: 'varchar', isUnique: true, isNullable: false },
                    { name: 'description', type: 'text', isNullable: true },
                ],
            }),
            true,
        );

        // Venues table
        await queryRunner.createTable(
            new Table({
                name: 'venues',
                columns: [
                    { name: 'id', type: 'serial', isPrimary: true },
                    { name: 'name', type: 'varchar', isNullable: false },
                    { name: 'description', type: 'text', isNullable: true },
                    { name: 'address', type: 'varchar', isNullable: false },
                    { name: 'capacity', type: 'int', isNullable: false },
                ],
            }),
            true,
        );

        // Events table
        await queryRunner.createTable(
            new Table({
                name: 'events',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    { name: 'title', type: 'varchar', isNullable: false },
                    { name: 'description', type: 'text', isNullable: true },
                    { name: 'start_date', type: 'timestamp with time zone', isNullable: false },
                    { name: 'end_date', type: 'timestamp with time zone', isNullable: false },
                    { name: 'is_recurring', type: 'boolean', default: false },
                    { name: 'recurrence_rule', type: 'varchar', isNullable: true },
                    { name: 'venue_id', type: 'int', isNullable: false },
                    { name: 'category_id', type: 'int', isNullable: false },
                    { name: 'organizer_id', type: 'uuid', isNullable: false },
                    { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
                    { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
                ],
            }),
            true,
        );
        await queryRunner.createForeignKey(
            'events',
            new TableForeignKey({
                columnNames: ['venue_id'],
                referencedTableName: 'venues',
                referencedColumnNames: ['id'],
                onDelete: 'RESTRICT',
            }),
        );
        await queryRunner.createForeignKey(
            'events',
            new TableForeignKey({
                columnNames: ['category_id'],
                referencedTableName: 'categories',
                referencedColumnNames: ['id'],
                onDelete: 'RESTRICT',
            }),
        );
        await queryRunner.createForeignKey(
            'events',
            new TableForeignKey({
                columnNames: ['organizer_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        // Tickets table (ticket definitions)
        await queryRunner.createTable(
            new Table({
                name: 'tickets',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    { name: 'event_id', type: 'uuid', isNullable: false },
                    { name: 'name', type: 'varchar', isNullable: false },
                    { name: 'price', type: 'numeric(10,2)', default: '0' },
                    { name: 'quantity', type: 'int', default: '0' },
                    { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
                    { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
                ],
            }),
            true,
        );
        await queryRunner.createForeignKey(
            'tickets',
            new TableForeignKey({
                columnNames: ['event_id'],
                referencedTableName: 'events',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        // Attendees table (registrations)
        await queryRunner.createTable(
            new Table({
                name: 'attendees',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    { name: 'event_id', type: 'uuid', isNullable: false },
                    { name: 'user_id', type: 'uuid', isNullable: false },
                    { name: 'ticket_id', type: 'uuid', isNullable: true },
                    { name: 'status', type: 'varchar', default: "'registered'" },
                    { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
                    { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
                ],
            }),
            true,
        );
        await queryRunner.createForeignKey(
            'attendees',
            new TableForeignKey({
                columnNames: ['event_id'],
                referencedTableName: 'events',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
        await queryRunner.createForeignKey(
            'attendees',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
        await queryRunner.createForeignKey(
            'attendees',
            new TableForeignKey({
                columnNames: ['ticket_id'],
                referencedTableName: 'tickets',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('attendees');
        await queryRunner.dropTable('tickets');
        await queryRunner.dropTable('events');
        await queryRunner.dropTable('venues');
        await queryRunner.dropTable('categories');
        await queryRunner.dropTable('user_roles');
        await queryRunner.dropTable('users');
        await queryRunner.dropTable('roles');
        await queryRunner.query(`DROP EXTENSION "uuid-ossp";`);
    }
}