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
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const general_1 = require("../../configuration/general");
const prisma = new client_1.PrismaClient();
const command = {
    name: "Random Sticker",
    description: "Comando para conversar com o bot",
    commands: [],
    usage: ``,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const stickers = yield prisma.stickers.findMany();
            const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
            const stickerBuffer = Buffer.from(randomSticker.url_sticker, "base64");
            const stickerFilePath = path_1.default.join(general_1.general.TEMP_DIR, `random_sticker_${Date.now()}.webp`);
            fs_1.default.writeFileSync(stickerFilePath, stickerBuffer);
            yield data.sendStickerFromFile(stickerFilePath);
            return fs_1.default.unlinkSync(stickerFilePath);
        }
        catch (error) {
            console.error("Erro ao enviar sticker:", error);
        }
    }),
};
exports.default = command;
