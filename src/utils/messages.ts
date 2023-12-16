import { general } from "../configuration/general";

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

export const menuMessage: (secure?: boolean) => Promise<string> = async (
  secure?: boolean
) => {
  const date = new Date();
  const capitalizedBotName =
    general.BOT_NAME.charAt(0).toUpperCase() + general.BOT_NAME.slice(1);

  const commandSecure = `▢ • /fato - Retornar um fato sobre o grupo\n▢ • /joão - Comando do João`;

  return `╭━━─「🤖」─━━ 
▢ • *MENU DE USUÁRIO*
▢
▢ • ${capitalizedBotName} — Bot para WhatsApp
▢ • Criado por: *instagram.com/polabiel*
▢ • Versão: 2.0.0
▢
▢ • Data: ${date.toLocaleDateString("pt-br")}
▢ • Hora: ${date.toLocaleTimeString("pt-br").slice(0, 5)}
▢ • Prefixo: 「 ${general.PREFIX} 」
╰━━─「🤖」─━━
  
╭━━⪩ *Comandos* ⪨━━
▢
▢ • /admin - Mostrar menu de administradores do grupo
▢ • /menu - Mostrar menu de usuário
▢ • /dono - Mostrar informações do bot
▢ • /bot - Converse com o simsimi
▢ • /cep - Consultar CEP
▢ • /ping - Verificar latência
▢ • /to-image - Converter sticker em imagem
▢ • /dado - Jogar dado de 6 lados
▢ • /coinflip - Jogar cara ou coroa 
${secure ? commandSecure : "▢"}
╰━━─「🚀」─━━`;
};

export const menuAdminMessage = async () => {
  return `╭━━─「🔐」─━━
╭━━⪩ *MENU DE ADMINISTRADORES* ⪨━━
▢
▢ • /banir - Banir um ou mais usuários
▢ • /promover - Promover um ou mais usuários
▢ • /rebaixar - Rebaixar um ou mais usuários
▢ • /add - Adicionar um ou mais usuários
▢ • /fechar - Fechar grupo (apenas admins podem falar)
▢ • /abrir - Abrir grupo (todos podem falar)
▢ • /everyone <messagem> - Marcar todos os usuários
▢ • /modoautomatico - Ativar/desativar modo automático
▢
╰━━─「🚀」─━━`;
};

export const ownerMessage = async () => {
  return `╭━━─「」─━━
▢ • *INFORMAÇÕES DO DONO*
▢
▢ • Criado pelo: *wa.me/${general.NUMBERS_HOSTS[0].slice(0, 13)}*
▢ • Instagram: *instagram.com/polabiel*
▢ • Github: *github.com/polabiel*
▢
╰━━─「」─━━`;
};

//•ㅤㅤ•.ㅤ.🪐    .  •      🌖ㅤㅤ  •.•ㅤㅤ. •
//•   .       • ..ㅤ ㅤ. •.ㅤㅤㅤ.•ㅤㅤㅤ. •ㅤ🌠ㅤ
//🚀   .  ㅤㅤ•ㅤㅤ• .ㅤ.ㅤ⭐ㅤ. •ㅤ.•ㅤㅤ. •
//•   .    ☄️    • .ㅤㅤ. •.ㅤㅤㅤ.•ㅤㅤ. •ㅤ
