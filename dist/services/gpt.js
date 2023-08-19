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
exports.gpt2 = void 0;
const axios_1 = __importDefault(require("axios"));
const general_1 = require("../configuration/general");
const DangerError_1 = require("../errors/DangerError");
function default_1(content) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!general_1.general.OPENAI_API_KEY) {
            throw new DangerError_1.DangerError("É necessário configurar a variável de ambiente OPENAI_API_KEY com o seu token da OpenAI");
        }
        const { data } = yield axios_1.default.post(`https://api.openai.com/v1/chat/completions`, {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content }],
        }, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${general_1.general.OPENAI_API_KEY}`,
            },
        });
        if (data.errors) {
            throw new Error(data.errors[0].message);
        }
        return data.choices[0].message.content;
    });
}
exports.default = default_1;
const gpt2 = (text) => __awaiter(void 0, void 0, void 0, function* () {
    const apiUrl = "https://chat-gpt.org/api/text";
    const requestDataBody = {
        message: `${text}`,
        temperature: 1,
        presence_penalty: 0,
        top_p: 1,
        frequency_penalty: 0,
    };
    try {
        const { data } = yield axios_1.default.post(apiUrl, requestDataBody);
        if (data.message) {
            return data.message;
        }
        throw new Error("Não foi possivel obter uma resposta, o servidor está muito ocupado!\nTente novamente mais tarde!");
    }
    catch (error) {
        console.error("Error calling GPT-3 API:", error);
        throw error;
    }
});
exports.gpt2 = gpt2;
