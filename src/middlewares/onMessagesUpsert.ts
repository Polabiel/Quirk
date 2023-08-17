import { MessageUpsertType, proto } from "@whiskeysockets/baileys";
import { connect } from "../connection";
import { general } from "../configuration/general";
import InstanceCommand from "../utils/InstanceCommand";

export default async () => {
  const bot = await connect();

  bot.ev.on(
    "messages.upsert",
    async (message: {
      messages: proto.IWebMessageInfo[];
      type: MessageUpsertType;
    }) => {
      await bot.readMessages(message.messages);
      const baileysMessage = message.messages[0];

      if (
        !baileysMessage.key.fromMe &&
        baileysMessage.key.remoteJid !== general.NUMBERS_HOSTS[0] &&
        baileysMessage.key.remoteJid !== "120363145100078035@g.us"
      ) {
        return;
      }

      await InstanceCommand(bot, baileysMessage);
    }
  );
};
