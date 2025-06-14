import { proto, WASocket } from "baileys";
import {
  findCommandImport,
  isCommand,
  verifyIfIsAdmin,
  verifyIfIsGroupSecure,
  verifyIfIsOwner,
} from ".";
import { handleError } from "../errors";
import hasTypeOrCommand from "../middlewares/hasTypeOrCommand";
import verifyPrefix from "../middlewares/verifyPrefix";
import { shouldSendSpamWarning, markSpamWarningSent } from "../middlewares/onAntiSpam";
import loadCommomFunctions from "./loadCommomFunctions";
import { logger } from "./logger";
import { general } from "../configuration/general";

export default async function (
  bot: WASocket,
  baileysMessage: proto.IWebMessageInfo
) {
  const { ...data } = loadCommomFunctions(bot, baileysMessage);
  
  if (shouldSendSpamWarning(data.remoteJid!)) {
    await data.sendWarningReply(
      `${data.nickName} está enviando mensagens muito rápido! Aguarde ${
        general.TIMEOUT_IN_MILLISECONDS_BY_EVENT / 1000
      } segundos para enviar novamente!`
    );
    markSpamWarningSent(data.remoteJid!);
    return; 
  }
  
  const { type, command } = await findCommandImport(data.commandName!);

  if (
    !verifyPrefix(data.prefix!) ||
    !hasTypeOrCommand(type, command?.default.name!) ||
    !isCommand(data.fullMessage!)
  ) {
    return;
  }

  if (!(await checkPermissions(type, bot, baileysMessage, data))) return;

  try {
    await command?.default.handle(data);
    logger.info(
      {
        Grupo: data.isGroup ? `👥 ${data.remoteJid}` : "Privado",
        Mensagem: `💬 ${data.fullMessage}`,
        Usuario: `👤 ${data.user}`,
        Data: `📅 ${new Date().toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
        })}`,
      },
      "🤖 Comando"
    );
  } catch (error: any) {
    await handleError(error, data, command);
  }
}

async function checkPermissions(
  type: any,
  bot: WASocket,
  baileysMessage: proto.IWebMessageInfo,
  data: any
): Promise<boolean> {
  const valueAdmin = await verifyIfIsAdmin(type, bot, baileysMessage);
  const valueOwner = await verifyIfIsOwner(type, baileysMessage);
  const groupSecure = await verifyIfIsGroupSecure(type, baileysMessage);

  if (!valueAdmin) {
    if (!data.isGroup) {
      await data.sendWarningReply(
        "Este comando só pode ser executado em grupos!"
      );
      return false;
    }
    await data.sendWarningReply(
      "Você não tem permissão para executar este comando!"
    );
    return false;
  }

  if (!valueOwner || !groupSecure) return false;
  return true;
}
