import { WASocket, proto } from "@whiskeysockets/baileys";
import loadCommomFunctions from "../utils/loadCommomFunctions";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function (
  bot: WASocket,
  baileysMessage: proto.IWebMessageInfo
) {
  const { user, nickName, isGroup } = loadCommomFunctions(bot, baileysMessage);

  if (user) {
    return await prisma.user.upsert({
      where: { number: user },
      update: {},
      create: {
        number: user,
        name: nickName!,
      },
    });
  }

  if (isGroup) {
    return await prisma.group.upsert({
      where: { number: baileysMessage.key.remoteJid! },
      update: {},
      create: {
        number: baileysMessage.key.remoteJid!,
      },
    });
  }

}
