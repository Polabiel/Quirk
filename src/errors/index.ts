import fs from "fs";
import path from "path";
import { WarningError } from "./WarningError";
import { InvalidParameterError } from "./InvalidParameterError";
import { DangerError } from "./DangerError";
import { Forbidden } from "./Forbidden";
import { general } from "../configuration/general";

export function createLogFile(error: Error): void {
  try {
    // Criar diretório de logs se não existir
    const logDir = path.join(__dirname, "..", "logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Sanitizar nome do arquivo
    const date = new Date().toISOString().split("T")[0];
    const sanitizedError = error.message.replace(/[^a-z0-9]/gi, "_");
    const filename = `${date}_${sanitizedError.substring(0, 50)}.log`;
    const logPath = path.join(logDir, filename);

    // Criar conteúdo do log
    const logContent = `
Timestamp: ${new Date().toISOString()}
Error: ${error.message}
Stack: ${error.stack}
    `;

    // Escrever arquivo de log
    fs.writeFileSync(logPath, logContent);
  } catch (err) {
    console.error("Falha ao criar arquivo de log:", err);
  }
}

export async function handleError(error: any, data: any, command: any) {
  if (error instanceof InvalidParameterError) {
    await data.sendWarningReply(
      `Parâmetros inválidos!\n\n${
        error.message
      }\n\nUse o comando assim \n\`${command?.default.usage!}\``
    );
  } else if (error instanceof WarningError) {
    await data.sendWarningReply(error.message);
  } else if (error instanceof DangerError) {
    createLogFile(error);
    await data.sendErrorReply(error.message);
  } else if (
    error.message === "forbidden" ||
    error.message === "unathorized" ||
    error instanceof Forbidden ||
    error.message === "not-authorized"
  ) {
    await data.sendErrorReply(
      `Eu não tenho permissão para fazer isso!\n\n📄 *Solução*: Colocar o ${general.BOT_NAME} como administrador do grupo`
    );
  } else {
    createLogFile(error);
    await data.sendErrorReply(
      `Ocorreu um erro não identificado ao executar o comando ${command?.default.name}!\n\n💻 O desenvolvedor foi notificado!`
    );
    await data.sendLogOwner(
      `Ocorreu um erro ao executar o comando ${command?.default.name}!\n\n📄 *Detalhes*: ${error.message}`
    );
    console.log(error);
  }
}
