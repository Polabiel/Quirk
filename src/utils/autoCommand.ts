import { proto, WASocket } from "@whiskeysockets/baileys";
import { choiceRandomCommand, isCommand } from ".";
import loadCommomFunctions from "./loadCommomFunctions";
import simsimi from "../services/simsimi";
import { general } from "../configuration/general";
import { IBotData } from "../interfaces/IBotData";
import verifyPrefix from "../middlewares/verifyPrefix";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function (
  bot: WASocket,
  baileysMessage: proto.IWebMessageInfo
) {
  const { ...data } = loadCommomFunctions(bot, baileysMessage);
  const { command } = await choiceRandomCommand();

  const gruop = await prisma.group.findFirst({
    where: {
      number: data.remoteJid!,
    },
  });

  if (
    isCommand(data.fullMessage!) ||
    verifyPrefix(data.prefix!) ||
    data.fromMe ||
    !gruop?.enable
  )
    return;

  processMessage(data, baileysMessage);

  if (Math.random() < 0.001) return;

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
      general.NUMBER_BOT ||
    baileysMessage.message?.extendedTextMessage?.text === "@556186063515";

  const mentionedBot =
    baileysMessage.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(
      general.NUMBER_BOT
    );

  if (shouldUseSimsimi || mentionedMessage || mentionedBot) {
    return data.sendText(await simsimi(data.fullMessage!)!);
  }
}
