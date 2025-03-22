import { logger } from "../../config/logger.js";
import { db } from "../client.js";
import { messageLog } from "../schemas/messageLog.js";

export async function seedLogs() {
  await db.insert(messageLog).values([
    {
      src_number: "BOT001",
      dest_number: "+5511999990001",
      status: "success",
    },
    {
      src_number: "BOT001",
      dest_number: "+5511999990002",
      status: "error",
    },
  ]);

  logger.debug("Seed de logs criado com sucesso!");
}
