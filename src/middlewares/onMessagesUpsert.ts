import { MessageUpsertType, proto } from "@whiskeysockets/baileys";
import { connect } from "../connection";
import InstanceCommand from "../utils/InstanceCommand";
import autoCommand from "../utils/autoCommand";
import repositories from "../database";
import PinoPretty from "pino-pretty";
import pino from "pino";


export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: "SYS:standard",
    },
  },
});

logger.info("Loading onMessagesUpsert middleware...");

export default async () => {
  const bot = await connect();

  bot.ev.on(
    "messages.upsert",
    async (message: {
      messages: proto.IWebMessageInfo[];
      type: MessageUpsertType;
    }) => {
      const baileysMessage = message.messages[0];
      if (!baileysMessage) return;
      logger.info("New message received", baileysMessage);
      await bot.readMessages([baileysMessage.key]);
      if (baileysMessage.key.fromMe) return;
      await repositories(bot, baileysMessage);
      await InstanceCommand(bot, baileysMessage);
      await autoCommand(bot, baileysMessage);
    }
  );
};
