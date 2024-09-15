import { isJidGroup, proto } from '@whiskeysockets/baileys';
import pino from 'pino';

export function dataLog(bot: proto.IWebMessageInfo) {
  const logger = pino({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        levelFirst: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
      },
    },
  });
  const conversation = bot.message?.conversation ?? undefined;
  const user = bot.key.fromMe ? 'me' : bot.key.remoteJid ? (bot.key.remoteJid.endsWith("@g.us") ? bot.key.remoteJid : bot.key.participant) : bot.key.participant;
  const group = bot.key.remoteJid ? isJidGroup(bot.key.remoteJid) : bot.key.participant;
  
  logger.info({ 
      message: conversation,
      user: user,
      group: group 
  });
}