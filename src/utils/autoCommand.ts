import { proto, WASocket } from "@whiskeysockets/baileys";
import { choiceRandomCommand, isCommand } from ".";
import loadCommomFunctions from "./loadCommomFunctions";
import simsimi from "../services/simsimi";
import { general } from "../configuration/general";
import { IBotData } from "../interfaces/IBotData";

export default async function (
  bot: WASocket,
  baileysMessage: proto.IWebMessageInfo
) {
  const { ...data } = loadCommomFunctions(bot, baileysMessage);
  const { command } = await choiceRandomCommand();

  if (isCommand(data.fullMessage!)) {
    return;
  };

  processMessage(data, baileysMessage);

  if (Math.random() < 0.015) return;

  try {
    await command?.handle({
      ...data,
    });
  } catch (error: any) {
    console.log(error);
  }
}

async function processMessage(
  data: IBotData,
  baileysMessage: proto.IWebMessageInfo
): Promise<void> {
  const keywordsRegex = /(bot|zanoni)/i;

  const shouldUseSimsimi = keywordsRegex.test(data.fullMessage!);

  const mentionedMessage =
    baileysMessage.message?.extendedTextMessage?.contextInfo?.participant ===
    general.NUMBER_BOT;

  if ((shouldUseSimsimi || mentionedMessage) && !data.fromMe) {
    return data.sendText(await simsimi(data.fullMessage!)!);
  }
}
