import { isJidGroup } from 'baileys';
import { general } from '../../configuration/general';
import { ICommand } from '../../interfaces/ICommand';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const command: ICommand = {
  name: 'Sugestão',
  description: `Comando para sugestão de melhorias do ${general.BOT_NAME}`,
  commands: ['sugestão', 'sugestao', 'sugestões', 'sugestoes'],
  usage: `${general.PREFIX}sugestao [texto]`,
  handle: async (data) => {
    try {
      await data.sendWaitReact();

      if (data.args && data.args.length > 0) {
        const userSuggestion = data.args.join(' ');

        if (userSuggestion.length < 10) {
          return data.sendWarningReply(
            'Sua sugestão deve ter no mínimo 10 caracteres!',
          );
        }

        await prisma.suggestions.create({
          data: {
            sugestao: userSuggestion,
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
        });

        return data.sendSuccessReply('Sugestão inserida com sucesso!');
      }

      const suggestions = await prisma.suggestions.findMany({});

      if (!suggestions || suggestions.length === 0) {
        return data.sendWarningReply('Não existem sugestões pendentes!');
      }

      const users = await prisma.user.findMany({});
      let formattedSuggestion = '';

      suggestions.forEach((suggestion) => {
        const user = users.find(
          (user) => user.number === suggestion.userNumber,
        );
        formattedSuggestion += `👤 Usuário: ${
          user?.name ?? 'Desconhecido'
        }\n💡 Sugestão: ${suggestion.sugestao}\n\n`;
      });

      return data.sendSuccessReply(formattedSuggestion);
    } catch (error) {
      console.error('Erro no comando sugestão:', error);
      return data.sendErrorReply(
        'Erro interno do sistema. Tente novamente mais tarde.',
      );
    }
  },
};

export default command;
