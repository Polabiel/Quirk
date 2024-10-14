import fs from "fs";
import path from "path";
import { WarningError } from "./WarningError";
import { InvalidParameterError } from "./InvalidParameterError";
import { DangerError } from "./DangerError";
import { Forbidden } from "./Forbidden";
import { general } from "../configuration/general";

export const logCreate = (erro: any) => {
  const dataAtual = new Date().toISOString().split("T")[0];
  const nomeArquivo = `${dataAtual}_${erro.message.replace(/\s/g, "_")}.log`;
  const caminhoPastaLogs = path.join(__dirname, "..", "logs");
  const caminhoArquivo = path.join(caminhoPastaLogs, nomeArquivo);
  const mensagem = `[${new Date().toISOString()}] Ocorreu um erro: ${
    erro.stack
  }\n Erro completo: ${erro}`;

  if (!fs.existsSync(caminhoPastaLogs)) {
    fs.mkdirSync(caminhoPastaLogs, { recursive: true });
  }

  fs.appendFile(caminhoArquivo, mensagem, (err: any) => {
    if (err) {
      console.error("Erro ao criar o log de erro:", err);
    }
  });
};

export async function handleError(error: any, data: any, command: any) {
  if (error instanceof InvalidParameterError) {
    await data.sendWarningReply(
      `Parâmetros inválidos!\n\n${error.message}\n\nUse o comando assim \n\`${command?.default.usage!}\``
    );
  } else if (error instanceof WarningError) {
    await data.sendWarningReply(error.message);
  } else if (error instanceof DangerError) {
    logCreate(error);
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
    logCreate(error);
    await data.sendErrorReply(
      `Ocorreu um erro não identificado ao executar o comando ${command?.default.name}!\n\n💻 O desenvolvedor foi notificado!`
    );
    await data.sendLogOwner(
      `Ocorreu um erro ao executar o comando ${command?.default.name}!\n\n📄 *Detalhes*: ${error.message}`
    );
    console.log(error);
  }
}
