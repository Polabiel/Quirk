import { MessageUpsertType, proto } from "@whiskeysockets/baileys";
import { connect } from "../connection";
import InstanceCommand from "../utils/InstanceCommand";
import autoCommand from "../utils/autoCommand";
import verifyPrefix from "./verifyPrefix";
import loadCommomFunctions from "../utils/loadCommomFunctions";

export default async () => {
  const bot = await connect();

  bot.ev.on(
    "messages.upsert",
    async (message: {
      messages: proto.IWebMessageInfo[];
      type: MessageUpsertType;
    }) => {
      const baileysMessage = message.messages[0];
      await bot.readMessages([baileysMessage.key]);
      const { prefix } = loadCommomFunctions(bot, baileysMessage);

      if (baileysMessage.key.fromMe) return;
      if (verifyPrefix(prefix!)) {
        await autoCommand(bot, baileysMessage);
        await InstanceCommand(bot, baileysMessage);
      }
    }
  );
};
