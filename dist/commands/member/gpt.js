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
const InvalidParameterError_1 = require("../../errors/InvalidParameterError");
const gpt_1 = __importDefault(require("../../services/gpt"));
const command = {
    name: "Informações do dono",
    description: "Esse comando mostra as informações do criador do bot",
    commands: ["dono", "info", "owner", "criador", "desenvolvedor"],
    usage: `${general_1.general.PREFIX}dono`,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield data.sendWaitReact();
        if (!data.args[0]) {
            throw new InvalidParameterError_1.InvalidParameterError("Você precisa me perguntar algo!");
        }
        const responseText = yield (0, gpt_1.default)(data.args[0]);
        yield data.sendSuccessReply(responseText);
    }),
};
exports.default = command;
