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
const api_1 = require("@squarecloud/api");
const command = {
    name: "SquareCloud",
    description: "Descrição do comando",
    commands: ["square", "squarecloud"],
    usage: `${general_1.general.PREFIX}square <status|restart|shutdown|logs>`,
    handle: (data) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        yield data.sendWaitReact();
        if (!data.args[0]) {
            throw new InvalidParameterError_1.InvalidParameterError("Você precisa especificar um argumento");
        }
        try {
            const api = new api_1.SquareCloudAPI(process.env.API_KEY);
            const application = yield api.applications.get(process.env.BOT_ID);
            switch (data.args[0]) {
                case "status":
                    const status = yield application.getStatus();
                    const uptimeDate = new Date(status === null || status === void 0 ? void 0 : status.uptimeTimestamp);
                    const uptimeDurationMs = Date.now() - uptimeDate.getTime();
                    const uptimeDays = Math.floor(uptimeDurationMs / (1000 * 60 * 60 * 24));
                    const uptimeHours = Math.floor((uptimeDurationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const uptimeMinutes = Math.floor((uptimeDurationMs % (1000 * 60 * 60)) / (1000 * 60));
                    const uptimeSeconds = Math.floor((uptimeDurationMs % (1000 * 60)) / 1000);
                    const uptimeString = `${uptimeDays} dias, ${uptimeHours} horas, ${uptimeMinutes} minutos e ${uptimeSeconds} segundos`;
                    yield data.sendSuccessReply(` ━━ ${general_1.general.PREFIX_EMOJI} Status do SquareCloud do ${general_1.general.BOT_NAME} ━━ \n\n🖥 Status: ${status === null || status === void 0 ? void 0 : status.status}\n\n🌡 CPU: ${status === null || status === void 0 ? void 0 : status.cpuUsage}\n\n🧠 RAM: ${status === null || status === void 0 ? void 0 : status.ramUsage}Mb\n\n⚙ SDD: ${status === null || status === void 0 ? void 0 : status.storageUsage}\n\n⏰ Tempo de atividade: ${uptimeString}\n\n🏓 Conexão ${(_a = status === null || status === void 0 ? void 0 : status.network) === null || _a === void 0 ? void 0 : _a.total}`);
                    break;
                case "restart":
                    application.restart();
                    yield data.sendSuccessReply("Reiniciando o sistema...");
                    break;
                case "shutdown":
                case "stop":
                    application.stop();
                    yield data.sendSuccessReply("Desligando o sistema...");
                    break;
                case "logs":
                case "log":
                    const logsUrl = yield application.getLogs();
                    yield data.sendSuccessReply(`📄 Logs: ${logsUrl}`);
                    break;
                case "info":
                    yield data.sendSuccessReply(`${general_1.general.PREFIX_EMOJI} Info do SquareCloud do ${general_1.general.BOT_NAME}\n\n🆔 ID: ${application === null || application === void 0 ? void 0 : application.id}\n\n✏ Nome: ${application === null || application === void 0 ? void 0 : application.tag}\n\n🔗 URL: ${application.url}\n\n📃 URL de Logs: ${yield application.getLogs()}\n\n📚 Linguagem: ${application === null || application === void 0 ? void 0 : application.lang}\n\n📄 Cluster: ${application === null || application === void 0 ? void 0 : application.cluster}`);
                    break;
                default:
                    const cases = [
                        "status",
                        "restart",
                        "shutdown",
                        "stop",
                        "info",
                        "log",
                        "logs",
                    ];
                    const random = cases[Math.floor(Math.random() * cases.length)];
                    yield data.sendWarningReply(`Você precisa especificar um argumento válido. Exemplo: ${general_1.general.PREFIX}square ${random}`);
            }
        }
        catch (error) {
            return yield data.sendErrorReply("Erro ao executar o comando. Tente novamente mais tarde.");
        }
    }),
};
exports.default = command;
