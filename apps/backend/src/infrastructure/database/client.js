import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import * as schema from "./schemas/index.js";
import { env } from "../config/env.js";

const { Pool } = pkg;

const pool = new Pool({
  host: env.DB_HOST || "localhost",
  port: Number(env.DB_PORT) || 5432,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  ssl: false,
});

export const db = drizzle(pool, { schema });
