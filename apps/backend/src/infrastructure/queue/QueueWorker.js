import { Redis } from "ioredis";
import { Worker } from "bullmq";
import RabbitMQAdapter from "../messaging/RabbitMQAdapter.js";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

export async function setupQueueProcessing() {
  const redisConnection = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  new Worker(
    "messageQueue",
    async (job) => {
      logger.debug("Worker publicando para o RabbitMQ", job.id, job.data);
      await RabbitMQAdapter.publish("message.ready", {
        jobId: job.id,
        phone: job.data.phone,
        message: job.data.message,
      });
    },
    {
      connection: redisConnection,
    },
  );
}
