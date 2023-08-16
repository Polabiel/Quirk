import { proto, WASocket } from "@whiskeysockets/baileys";
import { baileysIs, extractDataFromMessage } from ".";
import { general } from "../configuration/general";
import { IBotData } from "../interfaces/IBotData";
import { waitMessage } from "./messages";

export default function (
  bot: WASocket,
  baileysMessage: proto.IWebMessageInfo
): IBotData {
  const {
    remoteJid,
    prefix,
    commandName,
    args,
    idMessage,
    participant,
    fromMe,
    isGroup,
    nickName,
    argsJoined,
  } = extractDataFromMessage(baileysMessage);

  const isImage = baileysIs(baileysMessage, "image");
  const isVideo = baileysIs(baileysMessage, "video");
  const isSticker = baileysIs(baileysMessage, "sticker");

  const sendText = async (text: string) =>
    await bot.sendMessage(remoteJid!, {
      text: `${general.PREFIX_EMOJI} ${text}`,
    });

  const sendTextOwner = async (text: string) => {
    for (const host of general.NUMBERS_HOSTS) {
      await bot.sendMessage(host, { text: `${general.PREFIX_EMOJI} ${text}` });
    }
  };

  const sendReply = async (text: string) => {
    await bot.sendMessage(
      remoteJid!,
      { text: `${general.PREFIX_EMOJI} ${text}` },
      { quoted: baileysMessage }
    );
  };

  const sendReplyWithMentions = async (text: string, mentions: string[]) => {
    await bot.sendMessage(
      remoteJid!,
      {
        text: `${general.PREFIX_EMOJI}
            ${text}`,
        mentions,
      },
      { quoted: baileysMessage }
    );
  };

  const sendReplyOwner = async (text: string) => {
    for (let host of general.NUMBERS_HOSTS) {
      await bot.sendMessage(
        host,
        { text: `${text}` },
        { quoted: baileysMessage }
      );
    }
  };

  const sendReact = async (emoji: string) =>
    await bot.sendMessage(remoteJid!, {
      react: {
        text: emoji,
        key: baileysMessage.key,
      },
    });

  const sendSuccessReact = async () => await sendReact("✅");
  const sendWaitReact = async () => await sendReact("⏳");
  const sendWarningReact = async () => await sendReact("⚠️");
  const sendErrorReact = async () => await sendReact("❌");

  const sendSuccessReply = async (text: string) => {
    await sendSuccessReact();
    return await sendReply(`${general.PREFIX_EMOJI} ${text}`);
  };

  const sendMentionReply = async (text: string, mentions: string[]) => {
    await sendSuccessReact();
    return await sendReplyWithMentions(
      `${general.PREFIX_EMOJI} ${text}`,
      mentions
    );
  };

  const sendWaitReply = async (text: string) => {
    await sendWaitReact();
    return await sendReply(
      `${general.PREFIX_EMOJI}⏳ Aguarde! ${text || waitMessage}`
    );
  };

  const sendWarningReply = async (text: string) => {
    await sendWarningReact();
    return await sendReply(`${general.PREFIX_EMOJI}⚠️ Atenção! ${text}`);
  };

  const sendErrorReply = async (text: string) => {
    await sendErrorReact();
    return await sendReply(`${general.PREFIX_EMOJI}❌ Erro! ${text}`);
  };

  const sendLogOwner = async (text: string) => {
    return await sendReplyOwner(
      `${general.PREFIX_EMOJI}💻 Notificação! ${text}`
    );
  };

  const sendStickerFromFile = async (file: string) =>
    await bot.sendMessage(remoteJid!, {
      sticker: { url: file },
    });

  const sendImageFromFile = async (file: string) =>
    await bot.sendMessage(remoteJid!, {
      image: { url: file },
    });

  const sendVideoFromFile = async (file: string, caption: string) =>
    await bot.sendMessage(remoteJid!, {
      video: { url: file },
      caption: caption,
    });

  return {
    bot,
    remoteJid,
    prefix,
    commandName,
    args,
    isImage,
    isVideo,
    isSticker,
    idMessage,
    participant,
    fromMe,
    isGroup,
    nickName,
    argsJoined,
    baileysMessage,
    sendReplyWithMentions,
    sendMentionReply,
    sendText,
    sendLogOwner,
    sendTextOwner,
    sendReplyOwner,
    sendReply,
    sendStickerFromFile,
    sendImageFromFile,
    sendVideoFromFile,
    sendReact,
    sendSuccessReact,
    sendWaitReact,
    sendWarningReact,
    sendErrorReply,
    sendSuccessReply,
    sendWaitReply,
    sendWarningReply,
    sendErrorReact,
  };
}
