import { WASocket, proto } from "@whiskeysockets/baileys";
import loadCommomFunctions from "../utils/loadCommomFunctions";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function (
  bot: WASocket,
  baileysMessage: proto.IWebMessageInfo
) {
  const { nickName, isGroup } = loadCommomFunctions(bot, baileysMessage);

  if (isGroup) {
    return await prisma.group.upsert({
      where: { number: baileysMessage.key.remoteJid! },
      update: {},
      create: {
        number: baileysMessage.key.remoteJid!,
      },
    });
  } else if (!isGroup) {
    return await prisma.user.upsert({
      where: { number: baileysMessage.key.remoteJid! },
      update: {},
      create: {
        number: baileysMessage.key.remoteJid!,
        name: nickName!,
      },
    });
  }
  return null;
}
