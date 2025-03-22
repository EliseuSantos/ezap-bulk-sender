import { gt } from "drizzle-orm";
import { db } from "../../../infrastructure/database/client.js";
import { logger } from "../../../infrastructure/config/logger.js";
import { env } from "../../../infrastructure/config/env.js";

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;

    // Temporaryly disable authentication in development mode
    if (env.NODE_ENV !== "production") {
      return next();
    }

    if (
      !header ||
      typeof header !== "string" ||
      !header.startsWith("Bearer ")
    ) {
      return res.status(401).json({ error: "Token não informado ou inválido" });
    }

    const token = header.split(" ")[1];

    if (!token || token.length < 32 || token.length > 256) {
      return res.status(400).json({ error: "Token não informado ou inválido" });
    }

    const key = await db.query.apiKeys.findFirst({
      where: (fields, { eq, and, or, isNull }) =>
        and(
          eq(fields.key, token),
          eq(fields.active, true),
          or(isNull(fields.expiresAt), gt(fields.expiresAt, new Date())),
        ),
    });

    if (!key) {
      logger.warn({ token }, "Tentativa com token inválido");
      return res.status(403).json({ error: "Token inválido ou expirado" });
    }

    req.client = {
      id: key.id,
      name: key.clientName,
    };

    logger.info(
      {
        clientId: key.id,
        clientName: key.clientName,
        path: req.path,
        method: req.method,
      },
      "  Requisição autenticada",
    );

    next();
  } catch (err) {
    logger.error({ err }, "Erro interno de autenticação");
    res.status(500).json({ error: "Erro interno de autenticação" });
  }
}
