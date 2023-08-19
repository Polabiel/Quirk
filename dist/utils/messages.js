"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ownerMessage = exports.menuAdminMessage = exports.menuMessage = exports.waitMessage = void 0;
const general_1 = require("../configuration/general");
exports.waitMessage = "Carregando dados...";
const menuMessage = (secure) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch("https://raw.githubusercontent.com/Polabiel/zanoni-bot-js/main/package.json");
        const json = yield response.json();
        const version = json.version;
        const date = new Date();
        const capitalizedBotName = general_1.general.BOT_NAME.charAt(0).toUpperCase() + general_1.general.BOT_NAME.slice(1);
        const commandSecure = `▢ • /fato - Retornar um fato sobre o grupo\n▢ • /joão - Comando do João\n▢ • /CPF - Consulte o CPF de algúem`;
        return `╭━━─「🤖」─━━ 
▢ • *MENU DE USUÁRIO*
▢
▢ • ${capitalizedBotName} — Bot para WhatsApp
▢ • Criado por: *instagram.com/polabiel*
▢ • Versão: ${version}
▢
▢ • Data: ${date.toLocaleDateString("pt-br")}
▢ • Hora: ${date.toLocaleTimeString("pt-br").slice(0, 5)}
▢ • Prefixo: 「 ${general_1.general.PREFIX} 」
╰━━─「🤖」─━━
  
╭━━⪩ *Comandos* ⪨━━
▢
▢ • /admin - Mostrar menu de administradores do grupo
▢ • /menu - Mostrar menu de usuário
▢ • /dono - Mostrar informações do bot
▢ • /bot - Converse com o simsimi
▢ • /gpt - Envie uma pergunta para a AI (Desativado)
▢ • /cep - Consultar CEP (Desativado)
▢ • /ping - Verificar latência
▢ • /sticker - Converter img/vídeo em sticker
▢ • /to-image - Converter sticker em imagem (Desativado) 
▢ • /dado - Jogar dado de 6 lados (Desativado)
▢ • /coinflip - Jogar cara ou coroa (Desativado)
${secure ? commandSecure : "▢"}
╰━━─「🚀」─━━`;
    }
    catch (error) {
        throw new error("Erro ao carregar menu!");
    }
});
exports.menuMessage = menuMessage;
const menuAdminMessage = () => __awaiter(void 0, void 0, void 0, function* () {
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
▢
╰━━─「🚀」─━━`;
});
exports.menuAdminMessage = menuAdminMessage;
const ownerMessage = () => __awaiter(void 0, void 0, void 0, function* () {
    return `╭━━─「」─━━
▢ • *INFORMAÇÕES DO DONO*
▢
▢ • Criado pelo: *wa.me/${general_1.general.NUMBERS_HOSTS[0].slice(0, 13)}*
▢ • Instagram: *instagram.com/polabiel*
▢ • Github: *github.com/polabiel*
▢
╰━━─「」─━━`;
});
exports.ownerMessage = ownerMessage;
