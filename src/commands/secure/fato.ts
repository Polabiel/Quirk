import { DangerError } from "../../errors/DangerError";
import { ICommand } from "../../interfaces/ICommand";
import { general } from "../../configuration/general";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const command: ICommand = {
  name: "Fato",
  description: "Relata um fato aleatório ou adiciona um novo fato",
  commands: ["fato", "fatos", "fact", "facts"],
  usage: `${general.PREFIX}fato <Escreva o novo fato aqui>`,
  handle: async (data) => {
    if (data.args[0]) {
      try {
        await prisma.fatos.create({
          data: {
            fato: data.args.join(" "),
            criador: data.participant,
          },
        });
        data.sendSuccessReply(`Fato adicionado com sucesso!`);
      } catch (error: any) {
        throw new DangerError(error);
      }
    } else {
      try {
        const fatos = await prisma.fatos.findMany();
        const fatoChoice = fatos[Math.floor(Math.random() * fatos.length)];
        data.sendSuccessReply(`Fato: ${fatoChoice.fato}`);
      } catch (error: any) {
        throw new DangerError(error);
      }
    }
  },
};

export default command;
