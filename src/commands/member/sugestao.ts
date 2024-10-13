import { isJidGroup } from "@whiskeysockets/baileys";
import { general } from "../../configuration/general";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { ICommand } from "../../interfaces/ICommand";
import { PrismaClient } from "@prisma/client";
import { WarningError } from "../../errors/WarningError";
import { DangerError } from "../../errors/DangerError";
const prisma = new PrismaClient();

const command: ICommand = {
  name: "Sugestão",
  description: `Comando para sugestão de melhorias do ${general.BOT_NAME}`,
  commands: ["sugestão", "sugestao", "sugestões", "sugestoes"],
  usage: `${general.PREFIX}sugestao [texto]`,
  handle: async (data) => {
    await data.sendWaitReact();
    if (data.args[0]) {

      if(data.args[0].length < 10) {
        throw new InvalidParameterError("A sugestão deve ter no *mínimo 10 caracteres!*");
      }

      const suggestion = await prisma.suggestions
        .create({
          data: {
            sugestao: data.args[0],
            user: {
              connectOrCreate: {
                where: {
                  number: isJidGroup(data.remoteJid!)
                    ? data.participant!
                    : data.remoteJid!,
                },
                create: {
                  number: isJidGroup(data.remoteJid!)
                    ? data.participant!
                    : data.remoteJid!,
                  name: data.nickName!,
                },
              },
            },
          },
        })
        .then(() => {
          return data.sendSuccessReply("Sugestão inserida com sucesso!");
        })
        .catch((e: any) => {
          throw new DangerError(
            "Erro ao tentar inserir a sugestão no banco de dados!"
          );
        });
    } 
    // enviar as sugestões existenstes

    const suggestions = await prisma.suggestions.findMany({
    });

    if (suggestions.length === 0) {
      return data.sendWarningReply("Não existem sugestões pendentes!");
    }

    const users = await prisma.user.findMany({});
    const suggestionsList = suggestions.map((suggestion) => {
      const user = users.find((user) => user.number === suggestion.userNumber);
      return `👤 Usuário: ${user?.name || 'Desconhecido'}\n📱 Número: ${suggestion.userNumber}\💡 Sugestão: ${suggestion.sugestao}`;
    });
  }}