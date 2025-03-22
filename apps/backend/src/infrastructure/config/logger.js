import { pino } from "pino";
import * as Sentry from "@sentry/node";
import { env } from "./env.js";

const isDev = env.NODE_ENV === "development" || env.NODE_ENV === "local";

const logger = pino({
  level: env.LOG_LEVEL || (isDev ? "debug" : "info"),
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});

export function captureException(error, context = {}) {
  if (!isDev) {
    Sentry.captureException(error, context);
  }
  logger.error({ err: error, ...context }, "Exception captured");
}

export { logger };
