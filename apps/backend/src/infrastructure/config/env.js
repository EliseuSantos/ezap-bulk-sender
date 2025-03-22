import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test", "local"]),
  REDIS_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),

  BOT_NUMBER: z.string().min(10).optional(),
  RABBITMQ_URL: z.string().url(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_PORT: z.string().default("5432"),
  DB_NAME: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
