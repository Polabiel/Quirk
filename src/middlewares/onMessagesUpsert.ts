import { MessageUpsertType, proto } from "@whiskeysockets/baileys";
import { connect } from "../connection";
import InstanceCommand from "../utils/InstanceCommand";
import autoCommand from "../utils/autoCommand";
import repositories from "../database";

export default async () => {
  const bot = await connect();

  console.log('💻 Eventos e comandos carregados!\n');

  bot.ev.on(
    "messages.upsert",
    async (message: {
      messages: proto.IWebMessageInfo[];
      type: MessageUpsertType;
    }) => {
      const baileysMessage = message.messages[0];
      if (!baileysMessage) return;
      await bot.readMessages([baileysMessage.key]);
      await repositories(bot, baileysMessage);
      await InstanceCommand(bot, baileysMessage);
      await autoCommand(bot, baileysMessage);
    }
  );

};
