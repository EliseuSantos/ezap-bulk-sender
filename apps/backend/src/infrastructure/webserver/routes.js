import express from "express";
import { z } from "zod";

import SendMessageUseCase from "../../application/use_cases/SendMessageUseCase.js";
import GetWhatsAppQRCodeUseCase from "../../application/use_cases/GetWhatsAppQRCodeUseCase.js";
import GetMessageLogsUseCase from "../../application/use_cases/GetMessageLogsUseCase.js";
import { authenticate } from "../../ports/http/middlewares/authenticate.js";
import { validateAndHandle } from "../../ports/http/helpers/validateAndHandle.js";
import WhatsAppService from "../services/WhatsAppService.js";

const router = express.Router();

const sendMessageSchema = z.object({
  phone: z.string().min(12).max(15),
  message: z.string().min(1),
});

const logsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
  status: z.enum(["success", "error"]).optional(),
});

router.post(
  "/send-message",
  authenticate,
  validateAndHandle({
    schema: sendMessageSchema,
    handler: async (_, res, data) => {
      if (!WhatsAppService.isConnected()) {
        return res.status(503).json({
          data: {
            error: {
              message: "WhatsApp não está conectado. Escaneie o QR Code.",
            },
          },
        });
      }

      const response = await SendMessageUseCase.execute(data);
      res.status(response.statusCode).json(response);
    },
  }),
);

router.get("/qrcode", async (_, res) => {
  const response = await GetWhatsAppQRCodeUseCase.execute();
  res.status(response.statusCode).json(response);
});

router.get(
  "/logs",
  authenticate,
  validateAndHandle({
    schema: logsQuerySchema,
    getData: (req) => req.query,
    handler: async (_, res, queryParams) => {
      const result = await GetMessageLogsUseCase.execute(queryParams);
      res.status(200).json(result);
    },
  }),
);

router.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

export default router;
