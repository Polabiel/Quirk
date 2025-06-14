import { general } from "../../configuration/general";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { WarningError } from "../../errors/WarningError";
import { ICommand } from "../../interfaces/ICommand";
import PrismaSingleton from "../../utils/PrismaSingleton";

const prisma = PrismaSingleton.getInstance();

const command: ICommand = {
 name: "Newsletter",
 description: "Ativa ou desativa o recebimento de newsletters no grupo",
 commands: ["newsletter", "news", "comunicado", "avisos"],
 usage: `${general.PREFIX}newsletter [on|off|status]`, handle: async (data) => {
  if (!data.isGroup) {
   throw new WarningError("Este comando só funciona em grupos!");
  }

  const action = data.args[0]?.toLowerCase();

  if (!action) {
   throw new InvalidParameterError(
    "Você precisa especificar uma ação: on, off ou status"
   );
  }

  const groupNumber = data.remoteJid!;

  try {

   let group = await prisma.group.findUnique({
    where: { number: groupNumber },
   });

   if (!group) {
    group = await prisma.group.create({
     data: {
      number: groupNumber,
      newsletter: true,
     },
    });
   }

   switch (action) {
    case "on":
    case "ativar":
    case "ativa":
    case "ligar": {
     await prisma.group.update({
      where: { number: groupNumber },
      data: { newsletter: true },
     });
     return data.sendSuccessReply(
      "✅ Newsletter ativada! Este grupo agora receberá newsletters."
     );
    }

    case "off":
    case "desativar":
    case "desativa":
    case "desligar": {
     await prisma.group.update({
      where: { number: groupNumber },
      data: { newsletter: false },
     });
     return data.sendSuccessReply(
      "🔕 Newsletter desativada! Este grupo não receberá mais newsletters."
     );
    }

    case "status":
    case "verificar":
    case "check": {
     const statusText = group.newsletter ? "✅ Ativada" : "🔕 Desativada";
     return data.sendReply(
      `📰 *Status da Newsletter*\n\n${statusText}\n\n💡 Use \`${general.PREFIX}newsletter on\` para ativar ou \`${general.PREFIX}newsletter off\` para desativar.`
     );
    }

    default:
     throw new InvalidParameterError(
      "Ação inválida! Use: on, off ou status"
     );
   }
  } catch (error) {
   console.error("Erro no comando newsletter:", error);
   return data.sendErrorReply(
    "Erro ao alterar configuração de newsletter. Tente novamente."
   );
  }
 },
};

export default command;
