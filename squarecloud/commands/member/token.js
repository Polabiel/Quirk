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
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const command = {
    name: "Configurar token",
    description: "Comando para configurar o Token enviado",
    commands: [
        "token",
        "configurar-token",
        "set-token",
        "setar-token",
        "token-set",
    ],
    usage: `${general_1.general.PREFIX}token <token>`,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield data.sendWaitReact();
        if (data.args[0] && data.isGroup) {
            console.log(data.remoteJid);
            const updatedGroup = yield prisma.group.updateMany({
                where: {
                    number: data.remoteJid,
                },
                data: {
                    TOKEN_OPEANAI: data.args[0],
                },
            });
            if (updatedGroup) {
                return yield data.sendSuccessReply("Token configurado com sucesso!");
            }
            else {
                return yield data.sendErrorReply("Erro ao configurar o token. Grupo não encontrado.");
            }
        }
        else if (!data.isGroup) {
            return yield data.sendWarningReply("Este comando só pode ser executado em grupos!");
        }
        else if (!data.args[0]) {
            throw new InvalidParameterError_1.InvalidParameterError("Você precisa me enviar um token!");
        }
    }),
};
exports.default = command;
