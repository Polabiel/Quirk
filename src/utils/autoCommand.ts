import { proto, WASocket } from "@whiskeysockets/baileys";
import { choiceRandomCommand, isCommand } from ".";
import loadCommomFunctions from "./loadCommomFunctions";
import simsimi from "../services/simsimi";
import { general } from "../configuration/general";

export default async function (
  bot: WASocket,
  baileysMessage: proto.IWebMessageInfo
) {
  const { ...data } = loadCommomFunctions(bot, baileysMessage);
  if (isCommand(data.fullMessage! as string)) return;
  const { command } = await choiceRandomCommand();

  const keywordsRegex = /(bot|zanoni)/i;

  const shouldUseSimsimi =
    keywordsRegex.test(data.fullMessage!) && Math.random() < 0.5;

  const mentionedMessage =
    baileysMessage.message?.extendedTextMessage?.contextInfo?.participant ===
    general.NUMBER_BOT;

  if ((shouldUseSimsimi || mentionedMessage) && !data.fromMe) {
    return data.sendText(await simsimi(data.fullMessage!));
  }

  if (Math.random() < 0.03) return;

  try {
    await command?.handle({
      ...data,
    });
  } catch (error: any) {
    console.log(error);
  }
}
