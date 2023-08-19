import { proto, WASocket } from "@whiskeysockets/baileys";
import {
  findCommandImport,
  isCommand,
  verifyIfIsAdmin,
  verifyIfIsGroupSecure,
  verifyIfIsOwner,
} from ".";
import { logCreate } from "../errors/createLog";
import { DangerError } from "../errors/DangerError";
import { InvalidParameterError } from "../errors/InvalidParameterError";
import { WarningError } from "../errors/WarningError";
import hasTypeOrCommand from "../middlewares/hasTypeOrCommand";
import verifyPrefix from "../middlewares/verifyPrefix";
import loadCommomFunctions from "./loadCommomFunctions";

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

  const valueAdmin = await verifyIfIsAdmin(type, bot, baileysMessage);
  const valueOwner = await verifyIfIsOwner(type, baileysMessage);
  const groupSecure = await verifyIfIsGroupSecure(type, baileysMessage);

  if (!valueAdmin) {
    if (!data.isGroup) {
      return await data.sendWarningReply(
        "Este comando só pode ser executado em grupos!"
      );
    }
    return await data.sendWarningReply(
      "Você não tem permissão para executar este comando!"
    );
  }

  if (!valueOwner) return;
  if (!groupSecure) return;

  try {
    await command?.default.handle({
      ...data,
    });
  } catch (error: any) {
    if (error instanceof InvalidParameterError) {
      await data.sendWarningReply(
        `Parâmetros inválidos!\n\n${
          error.message
        } Use o comando assim \n*${command?.default.usage!}*`
      );
    } else if (error instanceof WarningError) {
      logCreate(error);
      await data.sendWarningReply(error.message);
    } else if (error instanceof DangerError) {
      logCreate(error);
      await data.sendErrorReply(error.message);
    } else {
      logCreate(error);
      await data.sendErrorReply(
        `Ocorreu um erro ao executar o comando ${command?.default.name}!\n\n💻 O desenvolvedor foi notificado!`
      );
      await data.sendLogOwner(
        `Ocorreu um erro ao executar o comando ${command?.default.name}!\n\n📄 *Detalhes*: ${error.message}`
      );
    }
  }
}
