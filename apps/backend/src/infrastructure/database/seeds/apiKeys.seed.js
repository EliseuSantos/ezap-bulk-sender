import crypto from "crypto";
import { db } from "../client.js";
import { apiKeys } from "../schemas/apiKeys.js";
import { logger } from "../../config/logger.js";

export async function seedApiKeys() {
  const clientName = "eliseu-client";
  const expiresInMinutes = 60;

  const existing = await db.query.apiKeys.findFirst({
    where: (fields, { eq }) => eq(fields.clientName, clientName),
  });

  if (existing) {
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60000);

  await db.insert(apiKeys).values({
    key: token,
    clientName,
    active: true,
    expiresAt,
  });

  logger.debug("Chave criada com sucesso!");
  logger.debug(`Token: ${token}`);
  logger.debug(`Cliente: ${clientName}`);
  logger.debug(`Expira em: ${expiresAt.toISOString()}`);
}
