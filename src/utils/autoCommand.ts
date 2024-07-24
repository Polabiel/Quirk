import { proto, WASocket } from "@whiskeysockets/baileys";
import { choiceRandomCommand, downloadImage, isCommand } from ".";
import loadCommomFunctions from "./loadCommomFunctions";
import simsimi from "../services/simsimi";
import { general } from "../configuration/general";
import { IBotData } from "../interfaces/IBotData";
import verifyPrefix from "../middlewares/verifyPrefix";
import { PrismaClient } from "@prisma/client";
import { randomMessageViewOnce } from "./messages";
const prisma = new PrismaClient();

export default async function (
  bot: WASocket,
  baileysMessage: proto.IWebMessageInfo
) {
  const { ...data } = loadCommomFunctions(bot, baileysMessage);
  const { command } = await choiceRandomCommand();

  if (baileysMessage.message?.viewOnceMessageV2) {
    const image = await downloadImage(baileysMessage);
    if (!image) return;
    return data.sendImageFromFile(image, randomMessageViewOnce());
  }

  if (!data.isGroup) return;

  const group = await prisma.group.findUnique({
    where: {
      number: data.remoteJid!,
    },
  });

  const isDisabled = group?.enable === false;
  const isCommandMessage = data.fullMessage && isCommand(data.fullMessage);
  const hasValidPrefix = data.prefix && verifyPrefix(data.prefix);

  if (isDisabled || isCommandMessage || hasValidPrefix || data.fromMe) {
    return;
  }

  try {
    processMessage(data, baileysMessage);

    if (Math.random() < 0.5) return;

    await command?.handle({
      ...data,
    });
  } catch (error: any) {
    console.error(error);
  }
}

async function processMessage(
  data: IBotData,
  baileysMessage: proto.IWebMessageInfo
): Promise<void> {
  const keywordsRegex = new RegExp(`(bot|${general.BOT_NAME})`, "i");

  const shouldUseSimsimi = keywordsRegex.test(
    data.fullMessage! ??
      data.baileysMessage.message?.ephemeralMessage?.message
        ?.extendedTextMessage?.text!
  );

  const mentionedMessage =
    baileysMessage.message?.extendedTextMessage?.contextInfo?.participant ===
      general.NUMBER_BOT ||
    baileysMessage.message?.extendedTextMessage?.text ===
      `@${general.NUMBER_BOT.slice(0, 11)}`;

  const mentionedJid =
    baileysMessage.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
    baileysMessage.message?.ephemeralMessage?.message?.extendedTextMessage
      ?.contextInfo?.mentionedJid ||
    [];

  const mentionedBot: boolean =
    mentionedJid.includes(general.NUMBER_BOT) ||
    baileysMessage.message?.ephemeralMessage?.message?.extendedTextMessage?.contextInfo?.participant?.includes(
      general.NUMBER_BOT
    ) ||
    baileysMessage.message?.extendedTextMessage?.contextInfo?.participant?.includes(
      general.NUMBER_BOT
    ) ||
    false;

  if (shouldUseSimsimi || mentionedMessage || mentionedBot) {
    return data.sendText(
      await simsimi(
        data.fullMessage! ??
          data.baileysMessage.message?.ephemeralMessage?.message
            ?.extendedTextMessage?.text!
      )
    );
  }
}
