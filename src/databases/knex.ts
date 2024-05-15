import knex from 'knex';
import knexFile from './knexfile';

const env = process.env.NODE_ENV || 'development';

export default knex(knexFile[env]);
