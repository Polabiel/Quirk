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
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const command = {
    name: "Modo automatico",
    description: "Esse comando desativa/ativar o modo automatico do bot",
    commands: ["dev"],
    usage: `${general_1.general.PREFIX}dev <on/off>`,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield data.sendWaitReact();
        if (data.args[0] === "on" ||
            data.args[0] === "ativar" ||
            data.args[0] === "ligar" ||
            data.args[0] === "enable") {
            yield prisma.group.update({
                where: {
                    number: data.remoteJid,
                },
                data: {
                    enable: true,
                },
            });
            return data.sendSuccessReply("Modo automatico ativado com sucesso!");
        }
        else if (data.args[0] === "off" ||
            data.args[0] === "desativar" ||
            data.args[0] === "disable") {
            yield prisma.group.update({
                where: {
                    number: data.remoteJid,
                },
                data: {
                    enable: false,
                },
            });
            return data.sendSuccessReply("Modo automatico desativado com sucesso!");
        }
    }),
};
exports.default = command;
