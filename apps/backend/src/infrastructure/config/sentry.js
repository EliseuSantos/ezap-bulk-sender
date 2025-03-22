import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { env } from "./env.js";

const isDev = env.NODE_ENV === "development" || env.NODE_ENV === "local";

if (!isDev && env.SENTRY_DSN) {
  Sentry.init({
    environment: env.NODE_ENV,
    dsn: env.SENTRY_DSN,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
}
