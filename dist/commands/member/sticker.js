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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const InvalidParameterError_1 = require("../../errors/InvalidParameterError");
const utils_1 = require("../../utils");
const child_process_1 = require("child_process");
const WarningError_1 = require("../../errors/WarningError");
const command = {
    name: "Sticker",
    description: "Comando para criar figurinhas",
    commands: ["sticker", "figurinha", "f", "s"],
    usage: `${general_1.general.PREFIX}sticker <envie a imagem ou marque ela>`,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield data.sendWaitReact();
        if (!data.isImage) {
            throw new InvalidParameterError_1.InvalidParameterError("Você precisa marcar uma imagem ou responder a uma imagem");
        }
        const outputPath = path_1.default.resolve(general_1.general.TEMP_DIR, "output.webp");
        if (data.isImage) {
            const inputPath = yield (0, utils_1.downloadImage)(data.baileysMessage);
            (0, child_process_1.exec)(`ffmpeg -i ${inputPath} -vf scale=512:512 ${outputPath}`, (error) => __awaiter(void 0, void 0, void 0, function* () {
                if (error) {
                    yield data.sendErrorReply("Ocorreu um erro ao criar a figurinha");
                    fs_1.default.unlinkSync(inputPath);
                    throw new Error(error);
                }
                yield data.sendSuccessReact();
                yield data.sendStickerFromFile(outputPath);
                fs_1.default.unlinkSync(inputPath);
                fs_1.default.unlinkSync(outputPath);
            }));
        }
        else if (data.isVideo) {
            throw new WarningError_1.WarningError("Não é possível criar figurinha com vídeo!\n\nO Desenvolvedor é pobre e não consegue manter um serviço gratuito😼👍");
        }
    }),
};
exports.default = command;
