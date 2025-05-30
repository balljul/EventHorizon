import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateEvents007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('events');
  }
}