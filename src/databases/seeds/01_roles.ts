import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('roles').del();

  await knex('roles').insert([
    { id: 1, name: 'moderator' },
    { id: 2, name: 'admin' },
  ]);
}
