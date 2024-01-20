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
const command = {
    name: "Sticker",
    description: "Comando para criar figurinhas",
    commands: ["sticker", "figurinha", "f", "s"],
    usage: `${general_1.general.PREFIX}sticker <envie a imagem/vídeo/gif ou marque>`,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        yield data.sendWaitReact();
        if (!data.isImage && !data.isVideo) {
            throw new InvalidParameterError_1.InvalidParameterError("Você precisa marcar uma imagem/vídeo/gif responder a uma imagem/vídeo/gif");
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
            const inputPath = yield (0, utils_1.downloadVideo)(data.baileysMessage);
            const sizeInSeconds = 10;
            const seconds = (_c = (_b = (_a = data.baileysMessage.message) === null || _a === void 0 ? void 0 : _a.videoMessage) === null || _b === void 0 ? void 0 : _b.seconds) !== null && _c !== void 0 ? _c : (_h = (_g = (_f = (_e = (_d = data.baileysMessage.message) === null || _d === void 0 ? void 0 : _d.extendedTextMessage) === null || _e === void 0 ? void 0 : _e.contextInfo) === null || _f === void 0 ? void 0 : _f.quotedMessage) === null || _g === void 0 ? void 0 : _g.videoMessage) === null || _h === void 0 ? void 0 : _h.seconds;
            const haveSecondsRule = seconds <= sizeInSeconds;
            if (!haveSecondsRule) {
                fs_1.default.unlinkSync(inputPath);
                yield data.sendErrorReply(`O vídeo que você enviou tem mais de ${sizeInSeconds} segundos! Envie um vídeo menor!`);
                return;
            }
            (0, child_process_1.exec)(`ffmpeg -i ${inputPath} -y -vcodec libwebp -fs 0.99M -filter_complex "[0:v] scale=512:512,fps=12,pad=512:512:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse" -f webp ${outputPath}`, (error) => __awaiter(void 0, void 0, void 0, function* () {
                if (error) {
                    fs_1.default.unlinkSync(inputPath);
                    throw new Error(error);
                }
                yield data.sendSuccessReact();
                yield data.sendStickerFromFile(outputPath);
                fs_1.default.unlinkSync(inputPath);
                return fs_1.default.unlinkSync(outputPath);
            }));
        }
    }),
};
exports.default = command;
