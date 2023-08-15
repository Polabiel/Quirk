import { general } from "../configuration/general";
import { IBotData } from "../interfaces/IBotData";
import { WASocket, proto } from "@whiskeysockets/baileys";
import fs from "fs";
import { extractCommandAndArgs, extractDataFromWebMessage } from "./index"
import { waitMessage } from "./messages";

export const getBotData = (
  bot: WASocket,
  baileysMessage: proto.IWebMessageInfo
): IBotData => {
  const remoteJid = baileysMessage.key.remoteJid!;

  const sendText = async (text: string) => {
    return bot.sendMessage(remoteJid!, {
      text: `${general.PREFIX_EMOJI} ${text}`,
    });
  };

  const sendImage = async (
    pathOrBuffer: string | Buffer,
    caption: "",
    isreply: true
  ) => {
    let options = {};

    if (isreply) {
      options = {
        quoted: baileysMessage,
      };
    }

    const image =
      pathOrBuffer instanceof Buffer
        ? pathOrBuffer
        : fs.readFileSync(pathOrBuffer);
    const params = caption
      ? { image, caption: `${general.PREFIX_EMOJI} ${caption}` }
      : { image };

    return await bot.sendMessage(remoteJid!, params, options);
  };

  const sendSticker = async (pathOrBuffer: string | Buffer, isreply: true) => {
    let options = {};

    if (isreply) {
      options = {
        quoted: baileysMessage,
      };
    }

    const sticker =
      pathOrBuffer instanceof Buffer
        ? pathOrBuffer
        : fs.readFileSync(pathOrBuffer);

    return await bot.sendMessage(remoteJid!, { sticker }, options);
  };

  const sendAudio = async (
    pathOrBuffer: string | Buffer,
    isReply: true,
    ptt: true
  ) => {
    let options = {};

    if (isReply) {
      options = {
        quoted: baileysMessage,
      };
    }

    const audio =
      pathOrBuffer instanceof Buffer
        ? pathOrBuffer
        : fs.readFileSync(pathOrBuffer);

    if (pathOrBuffer instanceof Buffer) {
      return await bot.sendMessage(
        remoteJid!,
        { audio, ptt, mimetype: "audio/mpeg" },
        options
      );
    }

    options = { ...options, url: pathOrBuffer };

    return await bot.sendMessage(
      remoteJid!,
      { audio: { url: pathOrBuffer }, ptt, mimetype: "audio/mpeg" },
      options
    );
  };

  const sendReply = async (text: string) => {
    return await bot.sendMessage(
      remoteJid!,
      {
        text: `${general.PREFIX_EMOJI} ${text}`,
      },
      { quoted: baileysMessage }
    );
  };

  const sendReplyWithMentions = async (text: string, mentions: string[]) =>
    await bot.sendMessage(
      remoteJid,
      { text: `${text}`, mentions },
      { quoted: baileysMessage }
    );

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
    await bot.sendMessage(remoteJid, {
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

  const {
    messageText,
    isImage,
    isSticker,
    isAudio,
    isVideo,
    isDocument,
    userJid,
// participant
// commandName
// isGroup
  } = extractDataFromWebMessage(baileysMessage);

  const { command, args } = extractCommandAndArgs(messageText!);

  return {
    sendText,
    sendImage,
    sendSticker,
    sendAudio,
    sendReply,
    isImage,
    isSticker,
    isAudio,
    isVideo,
    isDocument,
    userJid,
    sendSuccessReply,
    sendMentionReply,
    sendWaitReply,
    sendWarningReply,
    sendErrorReply,
    sendLogOwner,
    command,
    args,
    remoteJid,
    sendReplyWithMentions,
    sendReplyOwner,
    webMessage: baileysMessage,
    messageText,
  };
};
