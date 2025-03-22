import "../config/sentry.js";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import bodyParser from "body-parser";
import { xss } from "express-xss-sanitizer";
import * as Sentry from "@sentry/node";

import routes from "../../infrastructure/webserver/routes.js";
import { zodErrorHandler } from "../../ports/http/middlewares/zodErrorHandler.js";
import rateLimiter from "../security/RateLimiter.js";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

export async function startServer() {
  const app = express();

  if (env.NODE_ENV === "production") {
    Sentry.setupExpressErrorHandler(app);
  }

  app.use(helmet());
  app.use(cors());
  app.use(xss());
  app.use(bodyParser.json({ limit: "1kb" }));
  app.use(bodyParser.urlencoded({ extended: true, limit: "1kb" }));

  app.use(rateLimiter);
  app.use(zodErrorHandler);

  app.use(routes);

  const port = env.PORT || 3000;
  app.listen(port, () => {
    logger.info(`Server running at http://localhost:${port}`);
  });
}
