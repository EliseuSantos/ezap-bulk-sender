import { Redis } from "ioredis";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

let redisClient;

async function connect() {
  if (redisClient?.status === "ready") {
    return redisClient;
  }

  const url = env.REDIS_URL || "redis://localhost:6379";

  redisClient = new Redis(url);

  redisClient.on("error", (err) => {
    logger.error("🔴 Redis error:", err);
  });

  redisClient.on("connect", () => {
    logger.info(" Redis conectado com sucesso");
  });

  return redisClient;
}

async function get(key) {
  const client = await connect();
  return client.get(key);
}

async function set(key, value, options = {}) {
  const client = await connect();
  if (options.ex) {
    return client.set(key, value, "EX", options.ex);
  }
  return client.set(key, value);
}

async function del(key) {
  const client = await connect();
  return client.del(key);
}

async function disconnect() {
  if (redisClient?.status === "ready") {
    await redisClient.quit();
    logger.info("🧹 Redis desconectado com sucesso");
  }
}

async function getRawClient() {
  const client = await connect();
  return client;
}

export const RedisService = {
  connect,
  get,
  set,
  del,
  disconnect,
  getRawClient,
};
