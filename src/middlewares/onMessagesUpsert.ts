import { MessageUpsertType, proto } from "@whiskeysockets/baileys";
import { connect } from "../connection";
import InstanceCommand from "../utils/InstanceCommand";
import autoCommand from "../utils/autoCommand";
import { general } from "../configuration/general";

export default async () => {
  const bot = await connect();

  bot.ev.on(
    "messages.upsert",
    async (message: {
      messages: proto.IWebMessageInfo[];
      type: MessageUpsertType;
    }) => {
      try {
        await bot.readMessages(message.messages);
        const baileysMessage = message.messages[0];

        if (baileysMessage.key.remoteJid !== general.NUMBERS_HOSTS[0]) return;
        if (baileysMessage.key.fromMe) return;

        await autoCommand(bot, baileysMessage);
        await InstanceCommand(bot, baileysMessage);
      } catch (error: any) {
        console.error(error);
      }
    }
  );
};
