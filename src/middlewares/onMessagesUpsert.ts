import { MessageUpsertType, proto } from "@whiskeysockets/baileys";
import { connect } from "../connection";
<<<<<<< HEAD
=======
import { getBotData } from "../utils/functions";
import { findCommandImport, isCommand } from "../utils";
import fs from "fs";
>>>>>>> 93b49a9d6ce1c20ae3c5b120dddeac8ae3d59f3b
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

<<<<<<< HEAD
      await InstanceCommand(commonFunctions);
=======
      if (!isCommand(targetCommand) || !targetCommand) return;

      const { type, command } = await findCommandImport(targetCommand);

      try {
        console.log(`Command: ${targetCommand} | Args: ${data.args}`);
      } catch (error: any) {
        console.error(error);
        await data.sendReply(`❌ ${error.message}`);
      }
>>>>>>> 93b49a9d6ce1c20ae3c5b120dddeac8ae3d59f3b
    }
  );
};
