import { general } from "../../configuration/general";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { ICommand } from "../../interfaces/ICommand";
import { consultarCep } from "correios-brasil";

const command: ICommand = {
  name: "cep",
  description: "Consulta CEP",
  commands: ["cep"],
  usage: `${general.PREFIX}cep 01001-001`,
  handle: async (functionBot) => {
    await functionBot.sendWaitReact();
    const cep = functionBot.args[0];

    if (!cep || ![8, 9].includes(cep.length)) {
      throw new InvalidParameterError(
        "Você precisa enviar um CEP no formato 00000-000 ou 00000000!"
      );
    }

    try {
      const data = await consultarCep(cep);

      if (!data.cep) {
        await functionBot.sendWarningReply("CEP não encontrado!");
        return;
      }

      await functionBot.sendSuccessReply(
        `*Resultado*\n\n*CEP*: ${data.cep}\n*Logradouro*: ${data.logradouro}\n*Complemento*: ${data.complemento}\n*Bairro*: ${data.bairro}\n*Localidade*: ${data.localidade}\n*UF*: ${data.uf}\n*IBGE*: ${data.ibge}`
      );
    } catch (error: any) {
      console.log(error);
      throw new Error(error);
    }
  },
};

export default command;
