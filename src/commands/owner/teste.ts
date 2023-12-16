import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";

const command: ICommand = {
  name: "Comando de teste",
  description: "Esse comando é projetado apenas para fazer testes",
  commands: ["teste", "test", "devtest", "dev-test"],
  usage: `${general.PREFIX}teste`,
  handle: async ({ ...data }) => {
    await data.sendWaitReact();
    await data.sendSuccessReply("Teste concluido com sucesso!");
  },
};

export default command;