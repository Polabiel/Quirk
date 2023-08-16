import { MessageUpsertType, proto } from "@whiskeysockets/baileys";
import { connect } from "../connection";
import { general } from "../configuration/general";
import loadCommomFunctions from "../utils/loadCommomFunctions";
import InstanceCommand from "../utils/InstanceCommand";

export default async () => {
  const bot = await connect();

  bot.ev.on(
    "messages.upsert",
    async (message: {
      messages: proto.IWebMessageInfo[];
      type: MessageUpsertType;
    }) => {
      const baileysMessage = message.messages[0] as proto.WebMessageInfo;

      if (
        !baileysMessage.key.fromMe &&
        baileysMessage.key.remoteJid !== general.NUMBERS_HOSTS[0] &&
        baileysMessage.key.remoteJid !== "120363145100078035@g.us"
      )
        return;

      const commonFunctions = loadCommomFunctions(bot, baileysMessage);

      await InstanceCommand(commonFunctions);
    }
  );
};
