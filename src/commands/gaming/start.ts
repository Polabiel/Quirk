import { general } from "../../configuration/general";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { ICommand } from "../../interfaces/ICommand";
import { OptionsGaming } from "../../resources";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const command: ICommand = {
  name: "Iniciando Jogo",
  description: "Esse commando inicia o jogo e cria seu personagem",
  commands: ["start", "iniciar", "começar", "criar"],
  usage: `${general.PREFIX}iniciar nome | raça | sexo | classe`,
  handle: async (data) => {
    await data.sendWaitReact();
    if (!data.args[0]) {
      const { ...info } = OptionsGaming;
      const linha = "______________________";
      await data.sendTextWithRemotejid(
        `Todas as raças:\n${linha}\n` +
          `${Object.keys(info.classe)
            .map(
              (classe) =>
                `${classe}\nArmadura: ${info.classe[classe].Armadura}\nArma: ${
                  info.classe[classe].Arma
                }\n${
                  info.classe[classe].Escudo
                    ? `Escudo: ${info.classe[classe].Escudo}\n`
                    : ""
                }${linha}`
            )
            .join("\n")}`,
        data.remoteJid!
      );
      await data.sendTextWithRemotejid(
        `Todas as Raças:\n- ${Object.keys(info.raca)
          .map(
            (value) =>
              `${value} ${info.raca[value].length >= 1 ? info.raca[value] : ""}`
          )
          .join("\n- ")}`,
        data.remoteJid!
      );
      await data.sendTextWithRemotejid(
        `Todas os Sexos:\n- ${Object.keys(info.sexo)
          .map(
            (value) =>
              `${value} ${info.sexo[value].length > 1 ? info.sexo[value] : ""}`
          )
          .join("\n- ")}`,
        data.remoteJid!
      );
      throw new InvalidParameterError(
        "Você precisa preencher todos os campos."
      );
    }
    const [nome, raca, sexo, classe] = data.args;

    if (!nome || !raca || !sexo || !classe) {
      await data.sendWarningReply(
        "Você precisa preencher todos os campos para criar seu personagem."
      );
    }
    if (!Object.keys(OptionsGaming.raca).includes(raca.toLowerCase())) {
      throw new InvalidParameterError("Raça inválida");
    }
    if (!Object.keys(OptionsGaming.sexo).includes(sexo.toLowerCase())) {
      throw new InvalidParameterError("Sexo inválido");
    }
    if (!Object.keys(OptionsGaming.classe).includes(classe.toLowerCase())) {
      throw new InvalidParameterError("Classe inválida");
    }
    // await prisma.gaming.create({});
  },
};

export default command;
