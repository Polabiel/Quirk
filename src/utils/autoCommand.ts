import { proto, WASocket } from "baileys";
import {
  choiceRandomCommand,
  downloadImage,
  downloadVideo,
  isCommand,
} from ".";
import loadCommomFunctions from "./loadCommomFunctions";
import { getOllamaResults } from "../services/gpt";
import { general } from "../configuration/general";
import { IBotData } from "../interfaces/IBotData";
import verifyPrefix from "../middlewares/verifyPrefix";
import { randomMessageViewOnce } from "./messages";
import PrismaSingleton from "./PrismaSingleton";

const prisma = PrismaSingleton.getInstance();

export default async function (
  bot: WASocket,
  baileysMessage: proto.IWebMessageInfo
) {
  const { ...data } = loadCommomFunctions(bot, baileysMessage);
  const { command } = await choiceRandomCommand();

  if (baileysMessage.message?.viewOnceMessageV2) {
    const image = await downloadImage(baileysMessage);
    const video = await downloadVideo(baileysMessage);

    if (video) {
      return data.sendVideoFromFile(video, randomMessageViewOnce());
    }

    if (image) {
      return data.sendImageFromFile(image, randomMessageViewOnce());
    }
  }

  if (!data.isGroup) return;

  if (!data.remoteJid) {
    return;
  }

  const group = await prisma.group.findUnique({
    where: {
      number: data.remoteJid,
    },
  });

  if(!group?.enable) {
    return;
  }

  const isCommandMessage = data.fullMessage && isCommand(data.fullMessage);
  const hasValidPrefix = data.prefix && verifyPrefix(data.prefix);

  if (isCommandMessage || hasValidPrefix || data.fromMe) {
    return;
  }

  try {
    processMessage(data, baileysMessage);

    if (Math.random() < 0.01) return;

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
    const prompt =
      data.fullMessage! ??
      data.baileysMessage.message?.ephemeralMessage?.message?.extendedTextMessage?.text!;
    try {
      const isGroupSecure = general.GROUP_SECURE.includes(data.remoteJid!);
      const isHostNumber = general.NUMBERS_HOSTS.includes(data.remoteJid!);
      const secured = isGroupSecure || isHostNumber;
      const response = await getOllamaResults(prompt, secured, undefined, data.remoteJid!);
      return data.sendText(response);
    } catch (err: any) {
      return data.sendLogOwner("[Ollama] Erro ao gerar resposta: " + (err));
    }
  }
}
