import { z } from "zod";

export const sendMessageSchema = z.object({
  phone: z.string().min(10, "Phone must have at least 10 digits").max(15),
  message: z.string().min(1, "Message cannot be empty"),
});
