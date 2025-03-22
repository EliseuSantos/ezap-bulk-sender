import amqp from "amqplib";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

const RABBITMQ_URL = env.RABBITMQ_URL || "amqp://localhost";

let connection = null;
let channel = null;

async function connect() {
  if (connection && channel) return { connection, channel };

  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  return { connection, channel };
}

async function publish(queue, message) {
  const { channel } = await connect();
  await channel.assertQueue(queue, { durable: true });

  const payload = Buffer.from(JSON.stringify(message));
  const sent = channel.sendToQueue(queue, payload, { persistent: true });

  if (!sent) {
    logger.warn(` [RabbitMQ] Falha ao publicar na fila "${queue}"`);
  }
}

async function consume(queue, onMessage) {
  const { channel } = await connect();
  await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());

      logger.debug(`📥 [RabbitMQ] Mensagem recebida da fila "${queue}":`, data);
      await onMessage(data);

      channel.ack(msg);
    } catch (err) {
      logger.error(
        ` [RabbitMQ] Erro ao processar mensagem da fila "${queue}":`,
        err,
      );
      channel.nack(msg, false, false);
    }
  });
}

async function close() {
  if (channel) await channel.close();
  if (connection) await connection.close();
  logger.debug("Conexão com RabbitMQ encerrada.");
}

export default {
  publish,
  consume,
  close,
};
