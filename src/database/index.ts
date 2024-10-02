import { WASocket, proto } from "@whiskeysockets/baileys";
import loadCommomFunctions from "../utils/loadCommomFunctions";
import { PrismaClient } from "@prisma/client";
import checkCache, { addCache } from "./checkCache";
import { logger } from "../middlewares/onMessagesUpsert";
import { general } from "../configuration/general";
const prisma = new PrismaClient();

export default async function (
  bot: WASocket,
  baileysMessage: proto.IWebMessageInfo
) {
  const { nickName, isGroup } = loadCommomFunctions(bot, baileysMessage);

  if (isGroup) {
    if (await checkCache(baileysMessage.key.remoteJid!)) return;

    const group = await prisma.group.findUnique({
      where: { number: baileysMessage.key.remoteJid! },
    });

    if (!group) {
      bot.sendMessage(baileysMessage.key.remoteJid!, {
        text: `🎉 Bem-vindos ao grupo Quirk! 🤖\nEstamos animados em ter vocês aqui! Para começar a explorar tudo, basta digitar */menu*`,
      });

      await prisma.group.create({
        data: { number: baileysMessage.key.remoteJid! },
      });
    }

    logger.info(
      `Grupo: ${baileysMessage.key.remoteJid!} adicionado ao banco de dados.`
    );
    return await addCache(baileysMessage.key.remoteJid!);
  } else if (!isGroup) {
    if (await checkCache(baileysMessage.key.remoteJid!)) return;

    const user = await prisma.user.findUnique({
      where: { number: baileysMessage.key.remoteJid! },
    });

    if (!user) {
      await bot.sendMessage(baileysMessage.key.remoteJid!, {
        text: `🤖 ${general.BOT_NAME} te dá as boas-vindas ${nickName}!🎉\nDigite */menu* para começar e explorar todas as funcionalidades que oferecemos.`,
      });

      await prisma.user.create({
        data: { number: baileysMessage.key.remoteJid!, name: nickName! },
      });
    }

    logger.info(
      `Usuário: ${baileysMessage.key.remoteJid!} adicionado ao banco de dados.`
    );
    return await addCache(baileysMessage.key.remoteJid!);
  }
  logger.error("Erro ao adicionar grupo ou usuário ao banco de dados.");
  return null;
}
