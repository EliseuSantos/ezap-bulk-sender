import "dotenv/config";
import { runMigrations } from "./infrastructure/database/migrate.js";
import { startServer } from "./infrastructure/webserver/server.js";
import { setupQueueProcessing } from "./infrastructure/queue/QueueWorker.js";
import { setupRabbitMQConsumer } from "./infrastructure/messaging/MessageConsumer.js";
import { setupWhatsApp } from "./infrastructure/services/WhatsAppService.js";

async function main() {
  await runMigrations();
  await startServer();
  setupWhatsApp();
  setupQueueProcessing();
  setupRabbitMQConsumer();
}

main().catch((err) => {
  console.error("Fatal error on startup:", err);
  process.exit(1);
});
