import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user_roles', (table) => {
    table.increments('id').primary();
    table
      .integer('userId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users');
    table
      .integer('roleId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('roles');
    table.timestamp('add_data').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('user_roles');
}
