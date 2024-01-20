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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const general_1 = require("../../configuration/general");
const utils_1 = require("../../utils");
const fs_1 = __importDefault(require("fs"));
const InvalidParameterError_1 = require("../../errors/InvalidParameterError");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const command = {
    name: "Capturar sticker",
    description: "Comando para pegar um sticker selecionado",
    commands: ["getsticker", "pegarsticker", "pegar-sticker", "get-sticker"],
    usage: `${general_1.general.PREFIX}getsticker <nome do sticker>`,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        if (data.isSticker && data.args[0]) {
            yield data.sendWaitReact();
            const stickerPath = yield (0, utils_1.downloadSticker)(data.baileysMessage);
            const nameSticker = data.args[0];
            const imageBase64 = fs_1.default.readFileSync(stickerPath, {
                encoding: "base64",
            });
            try {
                yield prisma.stickers.create({
                    data: {
                        url_sticker: imageBase64,
                        name: nameSticker,
                        criador: data.user,
                    },
                });
                fs_1.default.unlinkSync(stickerPath);
                return data.sendSuccessReply("Sticker adicionado com sucesso!");
            }
            catch (error) {
                fs_1.default.unlinkSync(stickerPath);
                console.error("Erro ao adicionar sticker:", error);
                return yield data.sendErrorReply("Erro ao adicionar sticker.");
            }
        }
        throw new InvalidParameterError_1.InvalidParameterError("Você precisa enviar um sticker e o nome dele!");
    }),
};
exports.default = command;
