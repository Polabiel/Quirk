import {
  DownloadableMessage,
  downloadContentFromMessage,
  MediaType,
  proto,
  WASocket,
} from "@whiskeysockets/baileys";
import { general } from "../configuration/general";
import fs from "fs";
import path from "path";
import { IBaileysContext } from "../interfaces/IBaileysContext";
import { ICommandImports } from "../interfaces/ICommandImports";
import { ICommand } from "../interfaces/ICommand";

export function extractDataFromMessage(baileysMessage: proto.IWebMessageInfo) {
  const textMessage: string = baileysMessage.message?.conversation!;
  const extendedTextMessage: string =
    baileysMessage.message?.extendedTextMessage?.text!;
  const imageTextMessage: string =
    baileysMessage.message?.imageMessage?.caption!;
  const videoTextMessage: string =
    baileysMessage.message?.videoMessage?.caption!;

  const fullMessage: string =
    textMessage || extendedTextMessage || imageTextMessage || videoTextMessage;

  if (!fullMessage) {
    return {
      remoteJid: baileysMessage?.key?.remoteJid,
      prefix: "",
      isGroup: baileysMessage?.key?.remoteJid?.endsWith("@g.us"),
      nickName: baileysMessage?.pushName,
      fromMe: baileysMessage?.key?.fromMe,
      commandName: "",
      idMessage: baileysMessage?.key?.id,
      participant: baileysMessage?.key?.participant,
      args: [],
      argsJoined: "",
    };
  }

  const [command, ...args] = fullMessage.split(" ");

  const prefix = command.charAt(0);
  const arg = args.reduce((acc, arg) => acc + " " + arg, "").trim();

  const commandWithoutPrefix = command.replace(
    new RegExp(`^[${general.PREFIX}]+`),
    ""
  );

  return {
    remoteJid: baileysMessage?.key?.remoteJid,
    prefix,
    isGroup: baileysMessage?.key?.remoteJid?.endsWith("@g.us"),
    nickName: baileysMessage?.pushName,
    fromMe: baileysMessage?.key?.fromMe,
    commandName: formatCommand(commandWithoutPrefix),
    idMessage: baileysMessage?.key?.id,
    participant: baileysMessage?.key?.participant,
    args: splitByCharacters(args.join(" "), ["\\", "|", "/"]),
    argsJoined: arg,
  };
}

export const splitByCharacters = (str: string, characters: string[]) => {
  characters = characters.map((char: string) =>
    char === "\\" ? "\\\\" : char
  );
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

export const removeAccentsAndSpecialCharacters = (text: string) => {
  if (!text) return "";

  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const baileysIs = (
  baileysMessage: proto.IWebMessageInfo,
  context: IBaileysContext | string
) => {
  return (
    !!baileysMessage.message?.[
      `${context}Message` as keyof typeof baileysMessage.message
    ] ||
    !!baileysMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage?.[
      `${context}Message` as keyof typeof baileysMessage.message
    ]
  );
};

export const getContent = (
  baileysMessage: proto.IWebMessageInfo,
  type: IBaileysContext | string
) => {
  return (
    baileysMessage.message?.[
      `${type}Message` as keyof typeof baileysMessage.message
    ] ||
    baileysMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage?.[
      `${type}Message` as keyof typeof baileysMessage.message
    ]
  );
};

export const Download = async (
  baileysMessage: proto.IWebMessageInfo,
  fileName: string,
  context: MediaType,
  extension: string
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

  fs.writeFileSync(filePath, buffer);

  return filePath;
};

export const extractCommandAndArgs = (message: string) => {
  if (!message) return { command: "", args: "" };

  const [command, ...tempArgs] = message.trim().split(" ");

  const args = tempArgs.reduce((acc, arg) => acc + " " + arg, "").trim();

  return { command, args };
};

export const isCommand = (message: string): boolean => {
  return message.length > 1 && message.startsWith(general.PREFIX);
};

export const getRandomName = (extension?: string) => {
  const fileName = Math.floor(Math.random() * 10000);

  if (!extension) return fileName.toString();

  return `${fileName}.${extension}`;
};

export const findCommandImport: (commandName: string) => Promise<{
  type: string;
  command: any;
}> = async (commandName: string) => {
  const command = await readCommandImports();

  let typeReturn = "";
  let targetCommandReturn = null;

  for (const [type, commands] of Object.entries(command!)) {
    if (!commands.length) {
      continue;
    }

    const targetCommand: string = commands.find((cmd: { default: ICommand }) =>
      cmd?.default?.commands
        .map((cmd: string) => formatCommand(cmd))
        .includes(commandName)
    );

    if (targetCommand) {
      typeReturn = type;
      targetCommandReturn = targetCommand;
      break;
    }
  }

  return {
    type: typeReturn,
    command: targetCommandReturn,
  };
};

export const readCommandImports: () => Promise<ICommandImports> = async () => {
  const subdirectories: string[] = fs
    .readdirSync(general.COMMANDS_DIR, { withFileTypes: true })
    .filter((directory: { isDirectory: () => unknown }) =>
      directory.isDirectory()
    )
    .map((directory: { name: any }) => directory.name);

  const commandImports: ICommandImports = {};

  for (const subdir of subdirectories) {
    const subdirectoryPath = path.join(general.COMMANDS_DIR, subdir);
    const files = fs
      .readdirSync(subdirectoryPath)
      .filter(
        (file: string) =>
          !file.startsWith("_") &&
          (file.endsWith(".js") || file.endsWith(".ts"))
      )
      .map((file: string) => require(path.join(subdirectoryPath, file)));

    commandImports[subdir] = files;
  }

  return commandImports;
};

export const isAdminGroup = async (
  bot: WASocket,
  baileysMessage: proto.IWebMessageInfo
) => {
  if (extractDataFromMessage(baileysMessage).isGroup) {
    const metadata = await bot.groupMetadata(
      extractDataFromMessage(baileysMessage).remoteJid!
    );
    const admins = metadata.participants.filter(
      (participant) => participant?.admin != null
    );
    const adminsIds = admins.map((admin) => admin.id);
    const isAdmin = adminsIds.includes(
      extractDataFromMessage(baileysMessage).participant!
    );
    return isAdmin;
  }
  return false;
};

export const verifyIfIsAdmin = async (
  type: string,
  bot: WASocket,
  baileysMessage: proto.IWebMessageInfo
) => {
  if (type === "admin") {
    const isAdmin = await isAdminGroup(bot, baileysMessage);
    return !!isAdmin;
  }
  return true;
};

export const VerifyIfIsOwner = async (
  type: string,
  baileysMessage: proto.IWebMessageInfo
) => {
  if (type === "owner") {
    if (extractDataFromMessage(baileysMessage).isGroup) {
      return general.NUMBERS_HOSTS.includes(
        extractDataFromMessage(baileysMessage).participant!
      );
    }
    return general.NUMBERS_HOSTS.includes(
      extractDataFromMessage(baileysMessage).remoteJid!
    );
  }
  return true;
};

export const verifyIfIsGroupSecure = async (
  type: string,
  baileysMessage: proto.IWebMessageInfo
) => {
  if (type === "secure" && extractDataFromMessage(baileysMessage).isGroup) {
    return general.GROUP_SECURE.includes(
      extractDataFromMessage(baileysMessage).remoteJid!
    );
  }
  return true;
};
