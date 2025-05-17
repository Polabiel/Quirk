import { general } from "../../configuration/general";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import path from "node:path";
import fs from "node:fs";
import ffmpeg from "fluent-ffmpeg";
import { ICommand } from "../../interfaces/ICommand";
import { downloadImage, downloadVideo, getRandomName } from "../../utils";

const command: ICommand = {
name: "revelar",
  description: "Revela uma imagem ou vídeo com visualização única",
  commands: ["revelar", "rv", "reveal"],
  usage: `${general.PREFIX}revelar (marque a imagem/vídeo) ou ${general.PREFIX}revelar (responda a imagem/vídeo).`,
  handle: async ({
    isImage,
    isVideo,
    baileysMessage,
    sendSuccessReact,
    sendWaitReact,
    sendImageFromFile,
    sendVideoFromFile,
  }) => {
    if (!isImage && !isVideo) {
      throw new InvalidParameterError(
        "Você precisa marcar uma imagem/vídeo ou responder a uma imagem/vídeo para revelá-la"
      );
    }

    await sendWaitReact();

    const mediaCaption =
      baileysMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage?.[
        isImage ? "imageMessage" : "videoMessage"
      ]?.caption || `Aqui está sua ${isImage ? "imagem" : "vídeo"} revelada!`;

    const outputPath = path.resolve(
      general.TEMP_DIR,
      `${getRandomName()}.${isImage ? "jpg" : "mp4"}`
    );

    let inputPath: string = "";

    try {
      if (isImage) {
        inputPath = await downloadImage(baileysMessage) ?? "";

        if (!inputPath) {
          throw new InvalidParameterError(
            "Não foi possível baixar a imagem. Tente novamente."
          );
        }

        await new Promise<void>((resolve, reject) => {
          ffmpeg(inputPath)
            .outputOptions("-q:v 2")
            .on("end", async () => {
              await sendImageFromFile(outputPath, mediaCaption);
              await sendSuccessReact();
              resolve();
            })
            .on("error", (err: Error) => {
              console.error("Erro FFmpeg:", err);
              reject(err);
            })
            .save(outputPath);
        });
      } else if (isVideo) {
        inputPath = await downloadVideo(baileysMessage) ?? "";

        if (!inputPath) {
          throw new InvalidParameterError(
            "Não foi possível baixar o vídeo. Tente novamente."
          );
        }

        await new Promise<void>((resolve, reject) => {
          ffmpeg(inputPath)
            .outputOptions("-c copy")
            .on("end", async () => {
              await sendVideoFromFile(outputPath, mediaCaption);
              await sendSuccessReact();
              resolve();
            })
            .on("error", (err: Error) => {
              console.error("Erro FFmpeg:", err);
              reject(err);
            })
            .save(outputPath);
        });
      }
    } catch (error) {
      console.error("Erro geral:", error);
      throw new Error("Ocorreu um erro ao processar a mídia. Tente novamente.");
    } finally {
      const cleanFile = (filePath: string) => {
        if (filePath && fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (cleanError) {
            console.error("Erro ao limpar arquivo:", cleanError);
          }
        }
      };

      cleanFile(inputPath);
      cleanFile(outputPath);
    }
  },
};

export default command;
