import {
  WAMessage,
  downloadContentFromMessage,
  MediaType,
  proto,
  DownloadableMessage,
} from "@whiskeysockets/baileys";
import path from "path";
import { general } from "../configuration/general";
import { IBaileysContext } from "../interfaces/IBaileysContext";
const { writeFile } = require("fs/promises");

export const extractDataFromWebMessage = (message: proto.IWebMessageInfo) => {
  let remoteJid!: string;
  let messageText: proto.IMessage | null | undefined | string = null;

  let isReply: false | proto.IMessage | null | undefined = false;

  let replyJid: string | null = null;
  let replytext

  const {
    key: { remoteJid: jid, participant: tempUserJid },
  } = message;

  if (jid) {
    remoteJid = jid;
  }

  if (message) {
    const extendedTextMessage = message.message?.extendedTextMessage;
    const buttonTextMessage = message.message?.buttonsResponseMessage;
    const listTextMessage = message.message?.listResponseMessage;

    const type1 = message.message?.conversation;

    const type2 = extendedTextMessage?.text;

    const type3 = message.message?.imageMessage?.caption;

    const type4 = buttonTextMessage?.selectedButtonId;

    const type5 = listTextMessage?.singleSelectReply?.selectedRowId;

    const type6 = message?.message?.videoMessage?.caption;

    messageText = type1! || type2! || type3! || type4! || type5! || type6!;

    isReply =
      !!extendedTextMessage && extendedTextMessage.contextInfo?.quotedMessage;

    replyJid =
      extendedTextMessage && extendedTextMessage.contextInfo?.participant
        ? extendedTextMessage.contextInfo.participant
        : null;

    replytext = extendedTextMessage?.contextInfo?.quotedMessage?.conversation;
  }

  const userJid = tempUserJid?.replace(/:[0-9][0-9]|:[0-9]/g, "");

  const tempMessage: proto.IWebMessageInfo | proto.IMessage | null | undefined = message?.message;

  const isImage: boolean =
    !!tempMessage?.imageMessage ||
    !!tempMessage?.extendedTextMessage?.contextInfo?.quotedMessage
      ?.imageMessage;

  const isVideo: boolean =
    !!tempMessage?.videoMessage ||
    !!tempMessage?.extendedTextMessage?.contextInfo?.quotedMessage
      ?.videoMessage;

  const isSticker: boolean =
    !!tempMessage?.stickerMessage ||
    !!tempMessage?.extendedTextMessage?.contextInfo?.quotedMessage
      ?.stickerMessage;

  const isAudio: boolean =
    !!tempMessage?.audioMessage ||
    !!tempMessage?.extendedTextMessage?.contextInfo?.quotedMessage
      ?.audioMessage;

  const isDocument: boolean =
    !!tempMessage?.documentMessage ||
    !!tempMessage?.extendedTextMessage?.contextInfo?.quotedMessage
      ?.documentMessage;

  let mentionedJid: string = "";

  let mentionedJidObject =
    tempMessage?.extendedTextMessage?.contextInfo?.mentionedJid;

  if (mentionedJidObject) {
    mentionedJid = mentionedJidObject[0];
  }

  return {
    remoteJid,
    isReply,
    replayJid: replyJid,
    replytext,
    userJid,
    messageText,
    isImage,
    isVideo,
    isSticker,
    isAudio,
    isDocument,
    mentionedJid,
    baileysMessage: message,
  };
};

export const extractCommandAndArgs = (message: string) => {
  if (!message) return { command: "", args: "" };

  const [command, ...tempArgs] = message.trim().split(" ");

  const args = tempArgs.reduce((acc, arg) => acc + " " + arg, "").trim();

  return { command, args };
};

export const splitByCharacters = (str: string, characters: string[]) => {
  characters = characters.map((char) => (char === "\\" ? "\\\\" : char));
  const regex = new RegExp(`[${characters.join("")}]`);

  return str
    .split(regex)
    .map((str) => str.trim())
    .filter(Boolean);
};

export const formatCommand = (text: string) => {
  return onlyLettersAndNumbers(
    removeAccentsAndSpecialCharacters(text.toLocaleLowerCase().trim())
  );
};

export const onlyLettersAndNumbers = (text: string) => {
  return text.replace(/[^a-zA-Z0-9]/g, "");
};

export const isCommand = (message: string): boolean => {
  return message.length > 1 && message.startsWith(general.PREFIX);
};

export const removeAccentsAndSpecialCharacters = (text: string) => {
  if (!text) return "";

  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const baileysIs = (
  baileysMessage: WAMessage,
  context: IBaileysContext | string
) => {
  return (
    !!baileysMessage.message?.[`${context}Message` as keyof typeof baileysMessage.message] ||
    !!baileysMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage?.[
    `${context}Message` as keyof typeof baileysMessage.message
    ]
  );
};


export const getContent = (
  baileysMessage: WAMessage,
  type: IBaileysContext | string
) => {
  return (
    baileysMessage.message?.[`${type}Message` as keyof typeof baileysMessage.message] ||
    baileysMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage?.[
    `${type}Message` as keyof typeof baileysMessage.message
    ]
  );
};


export const getRandomName = (extension?: string) => {
  const fileName = Math.floor(Math.random() * 10000);

  if (!extension) return fileName.toString();

  return `${fileName}.${extension}`;
};

export const download = async (
  baileysMessage: WAMessage,
  fileName: string,
  context: MediaType,
  extension: any
) => {
  const content = getContent(baileysMessage, context) as DownloadableMessage;

  if (!content) {
    return null;
  }

  const stream = await downloadContentFromMessage(content, context);

  let buffer = Buffer.from([]);

  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }

  const filePath = path.resolve(general.TEMP_DIR, `${fileName}.${extension}`);

  await writeFile(filePath, buffer);

  return filePath;
};
