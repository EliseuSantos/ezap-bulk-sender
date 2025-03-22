import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { env } from "../config/env.js";

const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const queue = new Queue("messageQueue", {
  connection: redis,
});

export default {
  addToQueue(data) {
    return queue.add("send-message", data, {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 3000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  },
};
