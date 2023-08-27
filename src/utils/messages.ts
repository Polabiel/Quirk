import { general } from "../configuration/general";

export const waitMessage: string = "Carregando dados...";

export const menuMessage: (secure?: boolean) => Promise<string> = async (
  secure?: boolean
) => {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/Polabiel/zanoni-bot-js/main/package.json"
    );
    const json = await response.json();
    const version: number = json.version;

    const date = new Date();
    const capitalizedBotName =
      general.BOT_NAME.charAt(0).toUpperCase() + general.BOT_NAME.slice(1);

    const commandSecure = `▢ • /fato - Retornar um fato sobre o grupo\n▢ • /joão - Comando do João`;

    return `╭━━─「🤖」─━━ 
▢ • *MENU DE USUÁRIO*
▢
▢ • ${capitalizedBotName} — Bot para WhatsApp
▢ • Criado por: *instagram.com/polabiel*
▢ • Versão: ${version}
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
▢ • /gpt - Envie uma pergunta para a AI
▢ • /cep - Consultar CEP
▢ • /ping - Verificar latência
▢ • /sticker - Converter img/vídeo em sticker
▢ • /to-image - Converter sticker em imagem
▢ • /dado - Jogar dado de 6 lados
▢ • /coinflip - Jogar cara ou coroa 
${secure ? commandSecure : "▢"}
╰━━─「🚀」─━━`;
  } catch (error: any) {
    throw new Error("Erro ao carregar menu!");
  }
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
