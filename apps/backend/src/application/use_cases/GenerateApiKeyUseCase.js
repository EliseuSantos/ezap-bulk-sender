import crypto from "crypto";
import { apiKeys } from "../../infrastructure/database/schemas/apiKeys.js";
import { db } from "../../infrastructure/database/client.js";

export async function generateApiKey({ clientName, expiresInMinutes = 0 }) {
  const token = crypto.randomBytes(32).toString("hex");
  const expirationDate =
    expiresInMinutes > 0
      ? new Date(Date.now() + expiresInMinutes * 60_000)
      : null;

  await db.insert(apiKeys).values({
    key: token,
    clientName,
    active: true,
    expiresAt: expirationDate,
  });

  return { data: { token, clientName, expiresAt: expirationDate } };
}
