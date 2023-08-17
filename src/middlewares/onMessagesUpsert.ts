import { MessageUpsertType, proto } from "@whiskeysockets/baileys";
import { connect } from "../connection";
import InstanceCommand from "../utils/InstanceCommand";
import autoCommand from "../utils/autoCommand";

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

      if (baileysMessage.key.fromMe) return;

      await autoCommand(bot, baileysMessage);
      await InstanceCommand(bot, baileysMessage);
    }
  );
};
