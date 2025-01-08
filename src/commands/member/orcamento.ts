import { general } from "../../configuration/general";
import { DangerError } from "../../errors/DangerError";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { v4 as uuidv4 } from "uuid";
import { ICommand } from "../../interfaces/ICommand";
import { downloadFile } from "../../utils";
import { promises as fs, existsSync } from "fs";
import STL from "node-stl"; // Biblioteca para processar STL
import { renderSTLToImage } from "../../services/renderSTL";
import { exec } from "child_process";
import path from "path";

/** Configurações da Impressora 3D Raise3D Pro3 */
const DENSIDADE_MATERIAL_G_PER_CM3 = 1.24; // Densidade do PLA em g/cm³
const CONSUMO_FILAMENTO_G_PER_MIN = 0.233; // Taxa de consumo ajustada: 0.233 g/min
const CUSTO_MATERIAL_POR_GRAMA = 0.1; // Custo do filamento: R$0,10 por g
const CUSTO_ENERGIA_POR_MIN = 0.3; // Custo de energia: R$0,30 por minuto

const command: ICommand = {
  name: "Orçamento de peça 3D",
  description: "Utilize um arquivo STL para orçar a impressão 3D",
  commands: [
    "orcamento",
    "orçamento",
    "orcamento3d",
    "orçamento3d",
    "orçar",
    "o",
  ],
  usage: `${general.PREFIX}orcamento <envie ou marque um arquivo STL>`,
  handle: async (data) => {
    await data.sendWaitReact();

    if (!data.isDocumentFile) {
      throw new InvalidParameterError(
        "Você precisa anexar um arquivo STL para orçar a impressão 3D."
      );
    }
    const inputPath = await downloadFile(data.baileysMessage, "stl");

    if (!inputPath) {
      throw new DangerError("Erro ao baixar o arquivo STL.");
    }

    const volumeGramas = processarSTL(inputPath);

    // Estimar tempo de impressão (minutos)
    const tempoMinutos = volumeGramas / CONSUMO_FILAMENTO_G_PER_MIN;

    // Converter tempo para horas, minutos e segundos
    const horas = Math.floor(tempoMinutos / 60);
    const minutos = Math.floor(tempoMinutos % 60);
    const segundos = Math.round((tempoMinutos * 60) % 60);

    // Estimar consumo de energia
    const custoEnergia = tempoMinutos * CUSTO_ENERGIA_POR_MIN;

    // Cálculo de custo material
    const custoMaterial = volumeGramas * CUSTO_MATERIAL_POR_GRAMA;

    // Cálculo do custo total
    const custoTotal = custoMaterial + custoEnergia;

    const resposta = `
📦 *Orçamento Impressão 3D*
------------------------
🔹 *Filamento Utilizado*: ${volumeGramas.toFixed(2)} g
⏱️ *Tempo de Impressão*: ${horas}h ${minutos}min ${segundos}s
💰 *Custo Material*: R$ ${custoMaterial.toFixed(2)}
⚡ *Custo Energia*: R$ ${custoEnergia.toFixed(2)}
------------------------
💵 *Total*: R$ ${custoTotal.toFixed(2)}

📄 *Detalhes*: Cálculos estimados com base na Raise3D Pro3

🚧 *Observação*: Este é um orçamento estimado. Consulte um especialista para orçamento preciso.
    `;

    await data.sendReply(resposta);

    // Gerar imagem do modelo 3D usando Puppeteer
    try {
      await data.sendReply(
        "🔍 *Visualização do Modelo 3D*\n------------------------"
      );

      const imagePath = await renderSTLToImage(inputPath);

      const outputPath = path.resolve(general.TEMP_DIR, `${uuidv4()}.webp`);

      exec(
        `ffmpeg -i ${imagePath} -vf scale=512:512 ${outputPath}`,
        async (error: any) => {
          if (error) {
            await data.sendErrorReply("Ocorreu um erro ao criar a figurinha");
            throw new Error(error);
          }

          await data.sendSuccessReact();

          await data.sendStickerFromFile(outputPath);
        }
      );

      await fs.unlink(imagePath);
      await fs.unlink(inputPath);
      await fs.unlink(outputPath);
    } catch (error) {
      console.error("Erro ao gerar ou enviar a imagem do STL:", error);
      throw new DangerError("Erro ao gerar ou enviar a imagem do modelo 3D.");
    }
  },
};

/**
 * Processa o arquivo STL e calcula o volume em gramas.
 * @param inputPath Caminho para o arquivo STL.
 * @returns Volume total em gramas.
 */
function processarSTL(inputPath: string): number {
  if (!existsSync(inputPath)) {
    throw new DangerError("Arquivo não encontrado.");
  }

  const stl = new STL(inputPath, { density: DENSIDADE_MATERIAL_G_PER_CM3 });
  if (!stl.volume) {
    throw new DangerError("Geometria STL inválida ou vazia.");
  }

  // Retorna o volume em gramas
  return stl.volume;
}

export default command;