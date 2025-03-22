import { WASocket, proto } from "baileys";

export interface IBotData {
  fullMessage: string | undefined;
  sendText: (text: string, emoji?: boolean) => Promise<any>;
  sendTextWithRemotejid: (
    text: string,
    retemoJidMessage: string,
    emoji?: boolean
  ) => Promise<any>;
  sendReply: (text: string, emoji?: boolean) => Promise<any>;
  isDocumentFile: boolean;
  sendReplyWithMentions: (
    text: string,
    mentions: string[],
    emoji?: boolean
  ) => Promise<any>;
  user: string;
  sendReplyOwner: (text: string, emoji?: boolean) => Promise<any>;
  sendSuccessReply: (text: string, emoji?: boolean) => Promise<any>;
  sendMentionReply: (
    text: string,
    mentions: string[],
    emoji?: boolean
  ) => Promise<any>;
  sendWaitReply: (text: string) => Promise<any>;
  sendWarningReply: (text: string) => Promise<any>;
  sendErrorReply: (text: string) => Promise<any>;
  sendLogOwner: (text: string) => Promise<any>;
  sendTextOwner: (text: string) => Promise<any>;
  sendStickerFromFile: (
    file: string
  ) => Promise<proto.WebMessageInfo | undefined>;
  sendImageFromFile: (
    file: string,
    text?: string,
    mention?: string[]
  ) => Promise<proto.WebMessageInfo | undefined>;
  sendVideoFromFile: (
    file: string,
    caption: string
  ) => Promise<proto.WebMessageInfo | undefined>;
  sendReact: (emoji: string) => Promise<proto.WebMessageInfo | undefined>;
  sendSuccessReact: () => Promise<proto.WebMessageInfo | undefined>;
  sendWaitReact: () => Promise<proto.WebMessageInfo | undefined>;
  sendWarningReact: () => Promise<proto.WebMessageInfo | undefined>;
  sendErrorReact: () => Promise<proto.WebMessageInfo | undefined>;
  participant: string | null | undefined;
  bot: WASocket;
  prefix?: string | null;
  remoteJid: string | null | undefined;
  isImage: boolean;
  isVideo: boolean;
  isSticker: boolean;
  commandName: string | null;
  baileysMessage: proto.IWebMessageInfo;
  idMessage: string | null | undefined;
  fromMe: boolean | null | undefined;
  isGroup: boolean | null | undefined;
  nickName: string | null | undefined;
  argsJoined: string | undefined;
  args: string[] | never[];
}
