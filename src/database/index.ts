import { WASocket, proto } from "@whiskeysockets/baileys";
import loadCommomFunctions from "../utils/loadCommomFunctions";
import { PrismaClient } from "@prisma/client";
import checkCache, { addCache } from "./checkCache";
import { logger } from "../middlewares/onMessagesUpsert";
const prisma = new PrismaClient();

export default async function (
  bot: WASocket,
  baileysMessage: proto.IWebMessageInfo
) {
  const { nickName, isGroup } = loadCommomFunctions(bot, baileysMessage);

  if (isGroup) {
    if (await checkCache(baileysMessage.key.remoteJid!)) return;
    await prisma.group.upsert({
      where: { number: baileysMessage.key.remoteJid! },
      update: {},
      create: {
        number: baileysMessage.key.remoteJid!,
      },
    });
    logger.info(`Grupo: ${baileysMessage.key.remoteJid!} adicionado ao banco de dados.`);
    return await addCache(baileysMessage.key.remoteJid!);
  } else if (!isGroup) {
    if (await checkCache(baileysMessage.key.remoteJid!)) return;
    await prisma.user.upsert({
      where: { number: baileysMessage.key.remoteJid! },
      update: {},
      create: {
        number: baileysMessage.key.remoteJid!,
        name: nickName!,
      },
    });
    logger.info(`Usuário: ${baileysMessage.key.remoteJid!} adicionado ao banco de dados.`);
    return await addCache(baileysMessage.key.remoteJid!);
  }
  logger.error("Erro ao adicionar grupo ou usuário ao banco de dados.");
  return null;
}
