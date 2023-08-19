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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const createLog_1 = require("../errors/createLog");
const DangerError_1 = require("../errors/DangerError");
const InvalidParameterError_1 = require("../errors/InvalidParameterError");
const WarningError_1 = require("../errors/WarningError");
const hasTypeOrCommand_1 = __importDefault(require("../middlewares/hasTypeOrCommand"));
const verifyPrefix_1 = __importDefault(require("../middlewares/verifyPrefix"));
const loadCommomFunctions_1 = __importDefault(require("./loadCommomFunctions"));
function default_1(bot, baileysMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = __rest((0, loadCommomFunctions_1.default)(bot, baileysMessage), []);
        const { type, command } = yield (0, _1.findCommandImport)(data.commandName);
        if (!(0, verifyPrefix_1.default)(data.prefix) ||
            !(0, hasTypeOrCommand_1.default)(type, command === null || command === void 0 ? void 0 : command.default.name) ||
            !(0, _1.isCommand)(data.fullMessage)) {
            return;
        }
        const valueAdmin = yield (0, _1.verifyIfIsAdmin)(type, bot, baileysMessage);
        const valueOwner = yield (0, _1.verifyIfIsOwner)(type, baileysMessage);
        const groupSecure = yield (0, _1.verifyIfIsGroupSecure)(type, baileysMessage);
        if (!valueAdmin) {
            if (!data.isGroup) {
                return yield data.sendWarningReply("Este comando só pode ser executado em grupos!");
            }
            return yield data.sendWarningReply("Você não tem permissão para executar este comando!");
        }
        if (!valueOwner)
            return;
        if (!groupSecure)
            return;
        try {
            yield (command === null || command === void 0 ? void 0 : command.default.handle(Object.assign({}, data)));
        }
        catch (error) {
            console.error("[ERROR]", error.message, error.stack);
            if (error instanceof InvalidParameterError_1.InvalidParameterError) {
                console.log(command === null || command === void 0 ? void 0 : command.default.usage);
                yield data.sendWarningReply(`Parâmetros inválidos!\nUse o comando assim ${command === null || command === void 0 ? void 0 : command.default.usage}`);
            }
            else if (error instanceof WarningError_1.WarningError) {
                (0, createLog_1.logCreate)(error);
                yield data.sendWarningReply(error.message);
            }
            else if (error instanceof DangerError_1.DangerError) {
                (0, createLog_1.logCreate)(error);
                yield data.sendErrorReply(error.message);
            }
            else if (error.message == "not-authorized") {
                yield data.sendWarningReply("Eu não sou administrador do grupo!");
            }
            else if (error.message == "Request failed with status code 429") {
                yield data.sendWarningReply("A OpenAI Bloqueiou o Zanoni-bot temporariamente\nEstamos resolvendo isso");
            }
            else {
                (0, createLog_1.logCreate)(error);
                yield data.sendErrorReply(`Ocorreu um erro ao executar o comando ${command === null || command === void 0 ? void 0 : command.default.name}!\n\n💻 O desenvolvedor foi notificado!`);
                yield data.sendLogOwner(`Ocorreu um erro ao executar o comando ${command === null || command === void 0 ? void 0 : command.default.name}!\n\n📄 *Detalhes*: ${error.message}`);
            }
        }
    });
}
exports.default = default_1;
