import { proto } from "@whiskeysockets/baileys";

export interface IBotData {
  sendText: (text: string) => Promise<any>;
  sendImage: (
    pathOrBuffer: string | Buffer,
    caption: "",
    isreply: true
  ) => Promise<proto.WebMessageInfo | undefined>;
  sendSticker: (
    pathOrBuffer: string | Buffer,
    isreply: true
  ) => Promise<proto.WebMessageInfo | undefined>;
  sendAudio: (
    pathOrBuffer: string | Buffer,
    isReply: true,
    ptt: true
  ) => Promise<proto.WebMessageInfo | undefined>;
  sendReply: (text: string) => Promise<any>;
  sendReplyWithMentions: (text: string, mentions: string[]) => Promise<any>;
  sendReplyOwner: (text: string) => Promise<any>;
  sendSuccessReply: (text: string) => Promise<any>;
  sendMentionReply: (text: string, mentions: string[]) => Promise<any>;
  sendWaitReply: (text: string) => Promise<any>;
  sendWarningReply: (text: string) => Promise<any>;
  sendErrorReply: (text: string) => Promise<any>;
  sendLogOwner: (text: string) => Promise<any>;
  bot?: any;
  messageText: string | null;
  remoteJid: string;
  webMessage: any;
  isImage: boolean;
  isSticker: boolean;
  isAudio: boolean;
  isVideo: boolean;
  isDocument: boolean;
  userJid: string | undefined;
  command: string;
  args: string;
}
