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
const general_1 = require("../../configuration/general");
const InvalidParameterError_1 = require("../../errors/InvalidParameterError");
const WarningError_1 = require("../../errors/WarningError");
const command = {
    name: "Degugger",
    description: "Comando para Debuggar e verificar algumas coisas",
    commands: ["debugger", "debugar", "debug"],
    usage: `${general_1.general.PREFIX}debugger <args?>`,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        switch (data.args[0]) {
            case "grupo":
            case "grupos":
            case "group":
                try {
                    const metadata = yield data.bot.groupMetadata(data.remoteJid);
                    for (const i of metadata.participants) {
                        console.log(i.id);
                        return i.id;
                    }
                    yield data.sendSuccessReply(`Grupo: ${metadata === null || metadata === void 0 ? void 0 : metadata.subject}\nDescrição: ${metadata === null || metadata === void 0 ? void 0 : metadata.desc}\nCriado por: ${metadata === null || metadata === void 0 ? void 0 : metadata.owner}\nMembros: ${metadata.participants}\nRemoteJid: ${data.remoteJid}`);
                }
                catch (error) {
                    throw new WarningError_1.WarningError("Não foi possível debuggar o grupo");
                }
                break;
            case "debug":
            case "debugar":
            case "debugger":
            case "baileys":
                try {
                    const messageString = JSON.stringify(data.baileysMessage, null, 2);
                    return yield data.sendSuccessReply(`BaileysMessage Debug\n${messageString}`);
                }
                catch (error) {
                    throw new InvalidParameterError_1.InvalidParameterError("Não foi possível debuggar o baileysMessage");
                }
            default:
                throw new InvalidParameterError_1.InvalidParameterError("Você precisa especificar o que deseja debuggar!");
        }
    }),
};
exports.default = command;
