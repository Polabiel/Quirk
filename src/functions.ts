import { general } from "./configuration/general";
import { IBotData } from "./interfaces/IBotData";
import { WASocket, proto } from "@whiskeysockets/baileys";
import fs from "fs";
import { extractCommandAndArgs, extractDataFromWebMessage } from "./utils";

export const getBotData = (bot: WASocket, baileysMessage: proto.IWebMessageInfo): IBotData => {
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

  const reply = async (text: string) => {
    return await bot.sendMessage(remoteJid!, {
      text: `${general.PREFIX_EMOJI} ${text}`,
    });
  };

  const {
    messageText,
    isImage,
    isSticker,
    isAudio,
    isVideo,
    isDocument,
    userJid,
  } = extractDataFromWebMessage(baileysMessage);

  const { command, args } = extractCommandAndArgs(messageText!);

  return {
    sendText,
    sendImage,
    sendSticker,
    sendAudio,
    reply,
    isImage,
    isSticker,
    isAudio,
    isVideo,
    isDocument,
    userJid,
    command,
    args,
    remoteJid,
    webMessage: baileysMessage,
    messageText,
  };
};