import { logger } from "../../config/logger.js";
import { seedApiKeys } from "./apiKeys.seed.js";
import { seedLogs } from "./seedLogs.js";

export async function runAllSeeds() {
  logger.debug("Executando seeds...");
  await seedApiKeys();
  await seedLogs();
}
