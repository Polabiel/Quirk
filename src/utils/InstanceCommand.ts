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
import loadCommomFunctions from "./loadCommomFunctions";
import { addFilter, isFiltered } from "../middlewares/onAntiSpam";
import { logger } from "./logger";

export default async function (
  bot: WASocket,
  baileysMessage: proto.IWebMessageInfo
) {
  const { ...data } = loadCommomFunctions(bot, baileysMessage);
  const { type, command } = await findCommandImport(data.commandName!);

  if (
    !verifyPrefix(data.prefix!) ||
    !hasTypeOrCommand(type, command?.default.name!) ||
    !isCommand(data.fullMessage!)
  ) {
    return;
  }

  if (!(await checkPermissions(type, bot, baileysMessage, data))) return;
  if (isFiltered(data)) return;

  try {
    addFilter(data.user);
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
