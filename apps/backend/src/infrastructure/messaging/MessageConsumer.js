import RabbitMQAdapter from "./RabbitMQAdapter.js";
import WhatsAppService from "../services/WhatsAppService.js";
import LogMessageUseCase from "../../application/use_cases/LogMessageUseCase.js";
import { captureException } from "../config/logger.js";
import { env } from "../config/env.js";

export function setupRabbitMQConsumer() {
  RabbitMQAdapter.consume("message.ready", async (msg) => {
    try {
      await WhatsAppService.sendMessage(msg.phone, msg.message);

      await LogMessageUseCase.execute({
        src_number: env.BOT_NUMBER ?? "bot",
        dest_number: msg.phone,

        status: "success",
      });
    } catch (err) {
      captureException(err, {
        tags: { consumer: "message.ready" },
        extra: msg,
      });

      await LogMessageUseCase.execute({
        src_number: env.BOT_NUMBER ?? "bot",
        dest_number: msg.phone,

        status: "error",
      });

      throw err;
    }
  });
}
