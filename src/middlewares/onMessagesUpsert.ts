import { MessageUpsertType, proto } from "@whiskeysockets/baileys";
import { connect } from "../connection";
import InstanceCommand from "../utils/InstanceCommand";
import autoCommand from "../utils/autoCommand";
import repositories from "../database";
import { dataLog } from "./logger";

export default async () => {
  const bot = await connect();

  bot.ev.on(
    "messages.upsert",
    async (message: {
      messages: proto.IWebMessageInfo[];
      type: MessageUpsertType;
    }) => {
      const baileysMessage = message.messages[0];
      dataLog(baileysMessage);
      await bot.readMessages([baileysMessage.key]);
      if (baileysMessage.key.fromMe) return;
      await repositories(bot, baileysMessage);
      await InstanceCommand(bot, baileysMessage);
      await autoCommand(bot, baileysMessage);
    }
  );
};
