import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateVenues006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('venues');
  }
}