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
const DangerError_1 = require("../../errors/DangerError");
const general_1 = require("../../configuration/general");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const command = {
    name: "Fato",
    description: "Relata um fato aleatório ou adiciona um novo fato",
    commands: ["fato", "fatos", "fact", "facts"],
    usage: `${general_1.general.PREFIX}fato <Escreva o novo fato aqui>`,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        if (data.args[0]) {
            try {
                yield prisma.fatos.create({
                    data: {
                        fato: data.args.join(" "),
                        criador: data.participant,
                    },
                });
                data.sendSuccessReply(`Fato adicionado com sucesso!`);
            }
            catch (error) {
                throw new DangerError_1.DangerError(error);
            }
        }
        else {
            try {
                const fatos = yield prisma.fatos.findMany();
                const fatoChoice = fatos[Math.floor(Math.random() * fatos.length)];
                data.sendSuccessReply(`Fato: ${fatoChoice.fato}`);
            }
            catch (error) {
                throw new DangerError_1.DangerError(error);
            }
        }
    }),
};
exports.default = command;
