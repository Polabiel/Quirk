import { MessageUpsertType, proto } from "@whiskeysockets/baileys";
import { connect } from "../connection";
import { getBotData } from "../utils/functions";
import { isCommand } from "../utils";
import { general } from "../configuration/general";

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
        baileysMessage.key.remoteJid !== general.NUMBERS_HOSTS[0]
      )
        return;

      const { command: targetCommand, ...data } = getBotData(
        bot,
        baileysMessage
      );

      if (!isCommand(targetCommand)) return;

      try {
        console.log(
          `Command: ${targetCommand} | Args: ${data.args}`
        );
      } catch (error: any) {
        console.error(error);
        await data.sendReply(`❌ ${error.message}`);
      }
    }
  );
};
