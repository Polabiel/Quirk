import { general } from "../configuration/general";
import { readCommandImports } from ".";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const waitMessage: string = "Carregando dados...";

export const randomMessageViewOnce: () => string = () => {
  const randomMessage = [
    "🤭",
    "Foi mal, vazei sua fotinha unica 🤭",
    "Eu sou do mal HAHAHA 🤭",
    `Esse é o poder do ${general.BOT_NAME}-bot 🤭`,
  ];
  return randomMessage[Math.floor(Math.random() * randomMessage.length)];
};

export const getCommandsFromFolder = async (folderName: string) => {
  const commandFiles = await readCommandImports();
  const filteredCommandFiles = commandFiles[folderName];
  const commandList = filteredCommandFiles.map((command) => ({
    name: command.default.commands[0],
    description: command.default.description,
  }));
  return commandList;
};

export const randomText = async (): Promise<string> => {
  const totalFacts = await prisma.fatos.count();
  const randomIndex = Math.floor(Math.random() * totalFacts);
  const randomFact = await prisma.fatos.findFirst({
    skip: randomIndex,
    take: 1,
  });
  return randomFact ? randomFact.fato : "Forever volta...";
};

export const menuMessage: (secure?: boolean) => Promise<string> = async (
  secure?: boolean
) => {
  const date = new Date();
  const capitalizedBotName =
    general.BOT_NAME.charAt(0).toUpperCase() + general.BOT_NAME.slice(1);

  const commandListSecure = await getCommandsFromFolder("secure");
  const commandListTextSecure = commandListSecure
    .map((command) => `  ▢ • /${command.name} - ${command.description}`)
    .join("\n");

  const commandList = await getCommandsFromFolder("member");
  const commandListText = commandList
    .map((command) => `  ▢ • /${command.name} - ${command.description}`)
    .join("\n");

  return `╭━━─「🤖」─━━ 
  ▢ • *MENU DE USUÁRIO*
  ▢
  ▢ • ${capitalizedBotName} — Bot para WhatsApp
  ▢ • Versão: 2.0.0
  ▢
  ▢ • Data: ${date.toLocaleDateString("pt-br")}
  ▢ • Hora: ${date.toLocaleTimeString("pt-br").slice(0, 5)}
  ▢ • Prefixo: 「 ${general.PREFIX} 」
  ╰━━─「🤖」─━━
    
  ╭━━⪩ *Comandos* ⪨━━
  ▢\n${commandListText}
  ${secure ? commandListTextSecure : "▢"}
  ╰━━─「🚀」─━━`;
};

export const menuAdminMessage = async () => {
  const commandList = await getCommandsFromFolder("admin");
  const commandListText = commandList
    .map((command) => `  ▢ • /${command.name} - ${command.description}`)
    .join("\n");
  return `╭━━─「🔐」─━━
  ╭━━⪩ *MENU DE ADMINISTRADORES* ⪨━━
  ▢\n${commandListText}
  ▢
  ╰━━─「🚀」─━━`;
};

export const ownerMessage = async () => {
  return `╭━━─「」─━━
▢ • *INFORMAÇÕES DO DONO*
▢
▢ • Criado pelo: *wa.me/${general.NUMBERS_HOSTS[0].slice(0, 13)}*
▢ • Alguma sugestão? - */sugestao [mensagem]*
▢ • Github: *github.com/polabiel*
▢ • Instagram: *instagram.com/polabiel*
▢
╰━━─「」─━━`;
};

//•ㅤㅤ•.ㅤ.🪐    .  •      🌖ㅤㅤ  •.•ㅤㅤ. •
//•   .       • ..ㅤ ㅤ. •.ㅤㅤㅤ.•ㅤㅤㅤ. •ㅤ🌠ㅤ
//🚀   .  ㅤㅤ•ㅤㅤ• .ㅤ.ㅤ⭐ㅤ. •ㅤ.•ㅤㅤ. •
//•   .    ☄️    • .ㅤㅤ. •.ㅤㅤㅤ.•ㅤㅤ. •ㅤ
