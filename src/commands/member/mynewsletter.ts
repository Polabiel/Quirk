import { general } from "../../configuration/general";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { ICommand } from "../../interfaces/ICommand";
import PrismaSingleton from "../../utils/PrismaSingleton";

const prisma = PrismaSingleton.getInstance();

const command: ICommand = {
  name: "Minhas Newsletters",
  description: "Controla o recebimento de newsletters pessoais",
  commands: ["mynewsletter", "mynews", "meunews", "newsletter-pessoal"],
  usage: `${general.PREFIX}mynewsletter [on|off|status]`,
  handle: async (data) => {
    const action = data.args[0]?.toLowerCase();

    if (!action) {
      throw new InvalidParameterError(
        "Você precisa especificar uma ação: on, off ou status"
      );
    }

    const userNumber = data.isGroup ? data.participant! : data.remoteJid!;

    try {
      // Busca ou cria o usuário no banco de dados
      let user = await prisma.user.findUnique({
        where: { number: userNumber },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            number: userNumber,
            name: data.nickName || "Usuário",
            newsletter: true, // Padrão: ativado
          },
        });
      }

      switch (action) {
        case "on":
        case "ativar":
        case "ativa":
        case "ligar": {
          await prisma.user.update({
            where: { number: userNumber },
            data: { newsletter: true },
          });
          return data.sendSuccessReply(
            "✅ Newsletter pessoal ativada! Você receberá newsletters no privado."
          );
        }

        case "off":
        case "desativar":
        case "desativa":
        case "desligar": {
          await prisma.user.update({
            where: { number: userNumber },
            data: { newsletter: false },
          });
          return data.sendSuccessReply(
            "🔕 Newsletter pessoal desativada! Você não receberá mais newsletters no privado."
          );
        }

        case "status":
        case "verificar":
        case "check": {
          const statusText = user.newsletter ? "✅ Ativada" : "🔕 Desativada";
          return data.sendReply(
            `📰 *Status da Newsletter Pessoal*\n\n${statusText}\n\n💡 Use \`${general.PREFIX}mynewsletter on\` para ativar ou \`${general.PREFIX}mynewsletter off\` para desativar.\n\n📝 *Nota:* Esta configuração controla apenas as newsletters enviadas para você no privado. Para configurar newsletters em grupos, use \`${general.PREFIX}newsletter\` (apenas admins).`
          );
        }

        default:
          throw new InvalidParameterError(
            "Ação inválida! Use: on, off ou status"
          );
      }
    } catch (error) {
      console.error("Erro no comando mynewsletter:", error);
      return data.sendErrorReply(
        "Erro ao alterar configuração de newsletter pessoal. Tente novamente."
      );
    }
  },
};

export default command;
