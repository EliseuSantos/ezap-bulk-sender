// @ts-nocheck
import { DisconnectReason, makeWASocket } from "@whiskeysockets/baileys";
import { RedisService } from "./RedisService.js";
import { useRedisAuthState } from "./RedisAuthState.js";
import { pino } from "pino";
import Redis from "ioredis";
import QRCode from "qrcode";
import RedisStore from "./BaileysIORedisStore.js";
import Boom from "@hapi/boom";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

let client;
let store;

function debounce(fn, delay) {
  let timer = null;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

async function resetSession(reason = "") {
  logger.warn(`🧹 Resetando sessão: ${reason}`);
  const redis = await RedisService.connect();

  const keys = await redis.keys("wa:*");
  if (keys.length > 0) {
    await redis.del(...keys);
    logger.info(`Limpou ${keys.length} chaves da sessão WhatsApp`);
  } else {
    logger.info("Nenhuma chave encontrada para limpar (wa:*)");
  }
}

export async function setupWhatsApp() {
  try {
    logger.info("Iniciando conexão com WhatsApp via Redis...");

    const redisConnection = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
    });

    store = new RedisStore({
      redisConnection,
      prefix: "wa:store",
      logger: pino({ level: "error" }),
      maxCacheSize: 5000,
    });

    const { state, saveCreds } = await useRedisAuthState();

    client = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      getMessage: store.getMessage.bind(store),
    });

    await store.bind(client.ev);

    const saveCredsDebounced = debounce(() => saveCreds(), 300);

    client.ev.on("creds.update", async () => {
      logger.info("Atualizando sessão no Redis...");
      await saveCredsDebounced();
    });

    client.ev.on(
      "connection.update",
      async ({ connection, lastDisconnect, qr }) => {
        if (connection === "open") {
          logger.info("WhatsApp conectado!");
          await RedisService.del("whatsapp_qr");
        }

        if (qr) {
          logger.info("QR Code gerado...");
          await RedisService.set("whatsapp_qr", qr, { ex: 60 });
          if (env.QR_CODE_TERMINAL === "true") {
            logger.debug("QR Code gerado no terminal:");
            console.log(
              await QRCode.toString(qr, { type: "terminal", small: true }),
            );
          }
        }

        if (connection === "close") {
          const isLoggedOut =
            lastDisconnect?.error?.output?.statusCode ===
            DisconnectReason.loggedOut;
          const streamErrored =
            lastDisconnect?.error?.message?.includes("Stream Errored");

          logger.warn("WhatsApp desconectado", {
            reason: lastDisconnect?.error,
          });

          if (!isLoggedOut) {
            logger.info("Tentando reconectar...");
            setTimeout(setupWhatsApp, 3000);
          } else {
            logger.error("Sessão finalizada. Escaneie o QR novamente.");
            await resetSession("sessão finalizada");
            setTimeout(setupWhatsApp, 3000);
          }
        }
      },
    );

    return client;
  } catch (err) {
    logger.error("Erro ao conectar WhatsApp:", err);
    throw err;
  }
}

async function getQRCode() {
  return (await RedisService.get("whatsapp_qr")) || null;
}

function getClient() {
  return client;
}

async function sendMessage(phone, message) {
  if (!client) {
    throw new Error("WhatsApp não está conectado.");
  }

  const jid = phone.includes("@s.whatsapp.net")
    ? phone
    : `${phone}@s.whatsapp.net`;

  try {
    await client.sendMessage(jid, { text: message });
    logger.info(`📤 Mensagem enviada para ${phone}`);
  } catch (err) {
    if (Boom.isBoom(err) && err.output.statusCode === 408) {
      logger.warn(`Número inválido ou indisponível no WhatsApp: ${phone}`);
      throw new Error("Número inválido ou não registrado no WhatsApp");
    }

    logger.error(`Erro ao enviar mensagem para ${phone}:`, err);
    throw err;
  }
}

function isConnected() {
  return !!client?.user;
}

export default {
  getQRCode,
  getClient,
  sendMessage,
  isConnected,
};
