import { env } from './src/infrastructure/config/env.js';

export default {
  schema: './src/infrastructure/database/schemas/**/*.js',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: env.DB_HOST || "localhost",
    port: env.DB_PORT || 5432,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    ssl: false,
  },
};
