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
const child_process_1 = require("child_process");
const utils_1 = require("../../utils");
const command = {
    name: "toimage",
    description: "Transformo figurinhas estáticas em imagem",
    commands: [
        "toimage",
        "toimg",
        "toimagem",
        "toimg",
        "to-image",
        "to-img",
        "to-image",
        "to-img",
    ],
    usage: `${general_1.general.PREFIX}toimage <marque a figurinha>`,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield data.sendWaitReact();
        if (!data.isSticker) {
            throw new InvalidParameterError_1.InvalidParameterError("Você precisa marcar uma figurinha");
        }
        const inputPath = yield (0, utils_1.downloadSticker)(data.baileysMessage);
        const outputPath = path_1.default.resolve(general_1.general.TEMP_DIR, "output.png");
        (0, child_process_1.exec)(`ffmpeg -i ${inputPath} ${outputPath}`, (error) => __awaiter(void 0, void 0, void 0, function* () {
            if (error) {
                console.log(error);
                throw new Error(error);
            }
            yield data.sendSuccessReact();
            yield data.sendImageFromFile(outputPath);
            fs_1.default.unlinkSync(inputPath);
            return fs_1.default.unlinkSync(outputPath);
        }));
    }),
};
exports.default = command;
