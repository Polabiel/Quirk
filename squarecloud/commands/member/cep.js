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
const correios_brasil_1 = require("correios-brasil");
const command = {
    name: "cep",
    description: "Consulta CEP",
    commands: ["cep"],
    usage: `${general_1.general.PREFIX}cep 01001-001`,
    handle: (functionBot) => __awaiter(void 0, void 0, void 0, function* () {
        yield functionBot.sendWaitReact();
        const cep = functionBot.args[0];
        if (!cep || ![8, 9].includes(cep.length)) {
            throw new InvalidParameterError_1.InvalidParameterError("Você precisa enviar um CEP no formato 00000-000 ou 00000000!");
        }
        try {
            const data = yield (0, correios_brasil_1.consultarCep)(cep);
            if (!data.cep) {
                yield functionBot.sendWarningReply("CEP não encontrado!");
                return;
            }
            return yield functionBot.sendSuccessReply(`*Resultado*\n\n*CEP*: ${data.cep}\n*Logradouro*: ${data.logradouro}\n*Complemento*: ${data.complemento}\n*Bairro*: ${data.bairro}\n*Localidade*: ${data.localidade}\n*UF*: ${data.uf}\n*IBGE*: ${data.ibge}`);
        }
        catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }),
};
exports.default = command;
