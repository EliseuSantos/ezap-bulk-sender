import { db } from "../../infrastructure/database/client.js";
import { messageLog } from "../../infrastructure/database/schemas/messageLog.js";

export default {
  async execute({ src_number, dest_number, status }) {
    await db.insert(messageLog).values({
      src_number,
      dest_number,
      status,
    });
  },
};
