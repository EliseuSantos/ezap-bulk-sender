import { db } from "../../infrastructure/database/client.js";
import { messageLog } from "../../infrastructure/database/schemas/messageLog.js";
import { eq, and } from "drizzle-orm";

export default {
  async execute(data) {
    const { status, limit = 10, offset = 0 } = data;
    const filters = [];

    if (status) {
      filters.push(eq(messageLog.status, status));
    }

    const [logs, totalResult] = await Promise.all([
      db
        .select()
        .from(messageLog)
        .where(filters.length ? and(...filters) : undefined)
        .orderBy(messageLog.created_at)
        .limit(Number(limit))
        .offset(Number(offset)),
      db
        .select({ count: messageLog.id })
        .from(messageLog)
        .where(filters.length ? and(...filters) : undefined),
    ]);

    return {
      data: {
        logs,
        total: Number(totalResult[0]?.count ?? 0),
      },
    };
  },
};
