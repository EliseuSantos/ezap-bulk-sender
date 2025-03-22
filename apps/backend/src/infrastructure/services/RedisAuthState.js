import pkg from "@whiskeysockets/baileys";
import { Redis } from "ioredis";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";
const { initAuthCreds, BufferJSON, proto } = pkg;
const createKey = (key, prefix) => `${key}:${prefix}`;

export const deleteHSetKeys = async ({ redis, key }) => {
  try {
    await redis.del(createKey("authState", key));
  } catch (err) {
    logger.error("Error deleting keys:", err.message);
  }
};

export const useRedisAuthState = async (prefix = "wa") => {
  const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  const writeData = async (data, key) => {
    await redis.set(
      `${prefix}:${key}`,
      JSON.stringify(data, BufferJSON.replacer),
    );
  };

  const readData = async (key) => {
    const data = await redis.get(`${prefix}:${key}`);
    return data ? JSON.parse(data, BufferJSON.reviver) : null;
  };

  const creds = (await readData("creds")) ?? initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const promises = ids.map((id) => readData(`${type}-${id}`));
          const values = await Promise.all(promises);

          return ids.reduce((acc, id, index) => {
            const value = values[index];
            if (value) {
              acc[id] =
                type === "app-state-sync-key"
                  ? proto.Message.AppStateSyncKeyData.fromObject(value)
                  : value;
            }
            return acc;
          }, {});
        },
        set: async (data) => {
          const pipeline = redis.pipeline();
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const key = `${prefix}:${category}-${id}`;
              value
                ? pipeline.set(key, JSON.stringify(value, BufferJSON.replacer))
                : pipeline.del(key);
            }
          }
          await pipeline.exec();
        },
      },
    },
    saveCreds: async () => {
      await writeData(creds, "creds");
    },
    redis,
  };
};

export const deleteKeysWithPattern = async ({ redis, pattern }) => {
  let cursor = 0;
  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      100,
    );
    cursor = Number.parseInt(nextCursor, 10);
    if (keys.length > 0) {
      await redis.unlink(...keys);
      logger.error(`Deleted keys: ${keys}`);
    }
  } while (cursor !== 0);
};
