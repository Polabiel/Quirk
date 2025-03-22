import { WASocket } from "baileys";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async (bot: WASocket) => {
  const users = await prisma.user.findMany({});

  const groups = await prisma.group.findMany({});

  if (users) {
    users.forEach(async (user) => {
      for (const group of groups) {
        const GroupMetadata = await bot.groupMetadata(group.number);
        if (GroupMetadata.participants.some(participant => participant.id === user.number)) {
          return;
        }
      }
      bot.sendMessage(user.number, { text: generateRandomMessage() });
    });
  }

  if(groups) {
    groups.forEach((group) => {
      bot.sendMessage(group.number, {text: generateRandomMessage()});
    })
  }
};

const generateRandomMessage = () => {
  const messages = [
    "Não se esqueça de usar o comando */menu!*",
    "Use o comando */menu* para ver todas as opções disponíveis.",
    "*/sticker* é rápido digitando */s*",
    "Deixe sugestões para os desenvolvedores no */sugestão [mensagem]"
  ];
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};
