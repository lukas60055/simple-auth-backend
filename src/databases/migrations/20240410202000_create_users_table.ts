import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email', 100).notNullable();
    table.string('password', 255).notNullable();
    table.string('firstName', 50).notNullable();
    table.string('lastName', 50).notNullable();
    table.timestamp('create_data').defaultTo(knex.fn.now());
    table.timestamp('update_data').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('users');
}
