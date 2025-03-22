import {
  jidNormalizedUser,
  updateMessageWithReaction,
  updateMessageWithReceipt,
} from "@whiskeysockets/baileys";
import { pino } from "pino";

export default class RedisStore {
  constructor({
    redisConnection,
    prefix = "baileys:",
    logger = pino({ name: "baileys-store" }),
    maxCacheSize = 1000,
  }) {
    this.client = redisConnection;
    this.prefix = prefix;
    this.logger = logger;
    this.maxCacheSize = maxCacheSize;
    this.messageCache = new Map();
  }

  key(type, id = "") {
    return `${this.prefix}${type}:${id}`;
  }

  async bind(ev) {
    const handlers = {
      "connection.update": this.handleConnectionUpdate.bind(this),
      "chats.upsert": this.handleChatsUpsert.bind(this),
      "contacts.upsert": this.handleContactsUpsert.bind(this),
      "messages.upsert": this.handleMessagesUpsert.bind(this),
      "groups.update": this.handleGroupsUpdate.bind(this),
      "message-receipt.update": this.handleMessageReceiptUpdate.bind(this),
      "messages.reaction": this.handleMessagesReaction.bind(this),
      "presence.update": this.handlePresenceUpdate.bind(this),
      "chats.delete": this.handleChatsDelete.bind(this),
      "messages.delete": this.handleMessagesDelete.bind(this),
    };

    for (const [event, handler] of Object.entries(handlers)) {
      ev.on?.(event, handler);
    }
  }

  async handleConnectionUpdate(update) {
    const data = JSON.stringify(update);
    await this.client.set(this.key("state", "connection"), data);
  }

  async handleChatsUpsert(chats) {
    const multi = this.client.multi();
    for (const chat of chats) {
      multi.set(this.key("chats", chat.id), JSON.stringify(chat));
    }
    await multi.exec();
  }

  async handleContactsUpsert(contacts) {
    const multi = this.client.multi();
    for (const contact of contacts) {
      multi.set(this.key("contacts", contact.id), JSON.stringify(contact));
    }
    await multi.exec();
  }

  async handleMessagesUpsert({ messages, type }) {
    const multi = this.client.multi();
    for (const msg of messages) {
      const jid = jidNormalizedUser(msg.key.remoteJid);
      const msgKey = `${jid}:${msg.key.id}`;
      multi.set(this.key("messages", msgKey), JSON.stringify(msg));
      multi.zadd(
        this.key("message_list", jid),
        msg.messageTimestamp,
        msg.key.id,
      );
      multi.sadd(this.key("message_global_list"), msgKey);

      this.updateMessageCache(msg);

      if (type === "notify") {
        multi.hincrby(this.key("chats", jid), "unreadCount", 1);
        multi.hset(
          this.key("chats", jid),
          "conversationTimestamp",
          String(msg.messageTimestamp),
        );
      }
    }
    await multi.exec();
  }

  updateMessageCache(msg) {
    const key = `${msg.key.remoteJid}:${msg.key.id}`;
    this.messageCache.set(key, msg);
    if (this.messageCache.size > this.maxCacheSize) {
      const first = this.messageCache.keys().next().value;
      this.messageCache.delete(first);
    }
  }

  async handleGroupsUpdate(updates) {
    const multi = this.client.multi();
    for (const group of updates) {
      if (group.id) {
        multi.set(this.key("groups", group.id), JSON.stringify(group));
      }
    }
    await multi.exec();
  }

  async handleMessageReceiptUpdate(receipts) {
    const multi = this.client.multi();
    for (const { key, receipt } of receipts) {
      const cacheKey = `${key.remoteJid}:${key.id}`;
      const msg = await this.loadMessage(key.remoteJid, key.id);
      if (msg) {
        updateMessageWithReceipt(msg, receipt);
        multi.set(this.key("messages", cacheKey), JSON.stringify(msg));
        this.updateMessageCache(msg);
      }
    }
    await multi.exec();
  }

  async handleMessagesReaction(reactions) {
    const multi = this.client.multi();
    for (const { key, reaction } of reactions) {
      const cacheKey = `${key.remoteJid}:${key.id}`;
      const msg = await this.loadMessage(key.remoteJid, key.id);
      if (msg) {
        updateMessageWithReaction(msg, reaction);
        multi.set(this.key("messages", cacheKey), JSON.stringify(msg));
        this.updateMessageCache(msg);
      }
    }
    await multi.exec();
  }

  async handlePresenceUpdate({ id, presences }) {
    await this.client.set(this.key("presences", id), JSON.stringify(presences));
  }

  async handleChatsDelete(jids) {
    const multi = this.client.multi();
    for (const jid of jids) {
      multi.del(this.key("chats", jid));
      multi.del(this.key("message_list", jid));
      const allKeys = await this.client.smembers(
        this.key("message_global_list"),
      );
      const toRemove = allKeys.filter((k) => k.startsWith(`${jid}:`));
      for (const k of toRemove) {
        multi.srem(this.key("message_global_list"), k);
        this.messageCache.delete(k);
      }
    }
    await multi.exec();
  }

  async handleMessagesDelete(payload) {
    const multi = this.client.multi();
    if ("all" in payload) {
      multi.del(this.key("message_list", payload.jid));
      const allKeys = await this.client.smembers(
        this.key("message_global_list"),
      );
      const toRemove = allKeys.filter((k) => k.startsWith(`${payload.jid}:`));
      for (const k of toRemove) {
        multi.srem(this.key("message_global_list"), k);
        multi.del(this.key("messages", k));
        this.messageCache.delete(k);
      }
    } else {
      for (const key of payload.keys) {
        const k = `${key.remoteJid}:${key.id}`;
        multi.del(this.key("messages", k));
        multi.zrem(this.key("message_list", key.remoteJid), key.id);
        multi.srem(this.key("message_global_list"), k);
        this.messageCache.delete(k);
      }
    }
    await multi.exec();
  }

  async loadMessage(jid, id) {
    const cacheKey = `${jid}:${id}`;
    if (this.messageCache.has(cacheKey)) return this.messageCache.get(cacheKey);
    const raw = await this.client.get(this.key("messages", cacheKey));
    if (raw) {
      const msg = JSON.parse(raw);
      this.updateMessageCache(msg);
      return msg;
    }
    return undefined;
  }

  async getMessage(key) {
    const msg = await this.loadMessage(key.remoteJid, key.id);
    return msg?.message;
  }

  async clearAll() {
    let cursor = "0";
    const keys = [];
    do {
      const [next, result] = await this.client.scan(
        cursor,
        "MATCH",
        `${this.prefix}*`,
        "COUNT",
        100,
      );
      cursor = next;
      keys.push(...result);
    } while (cursor !== "0");

    if (keys.length > 0) await this.client.del(...keys);
    this.messageCache.clear();
  }
}
