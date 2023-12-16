import { WASocket, proto } from "@whiskeysockets/baileys";
import loadCommomFunctions from "../utils/loadCommomFunctions";
import { PrismaClient } from "@prisma/client";
import checkCache, { addCache } from "./checkCache";
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
    return await addCache(baileysMessage.key.remoteJid!);
  }
  return null;
}
