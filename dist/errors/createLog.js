"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logCreate = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logCreate = (erro) => {
    const dataAtual = new Date().toISOString().split("T")[0];
    const nomeArquivo = `${dataAtual}_${erro.message.replace(/\s/g, "_")}.log`;
    const caminhoPastaLogs = path_1.default.join(__dirname, "..", "logs");
    const caminhoArquivo = path_1.default.join(caminhoPastaLogs, nomeArquivo);
    const mensagem = `[${new Date().toISOString()}] Ocorreu um erro: ${erro.stack}\n Erro completo: ${erro}`;
    if (!fs_1.default.existsSync(caminhoPastaLogs)) {
        fs_1.default.mkdirSync(caminhoPastaLogs, { recursive: true });
    }
    fs_1.default.appendFile(caminhoArquivo, mensagem, (err) => {
        if (err) {
            console.error("Erro ao criar o log de erro:", err);
        }
    });
};
exports.logCreate = logCreate;
