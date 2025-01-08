import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

/**
 * Renderiza um arquivo STL utilizando o site fenrus75.github.io e retorna o caminho da imagem gerada.
 * @param stlPath Caminho para o arquivo STL.
 * @returns Caminho para a imagem PNG gerada.
 */
export async function renderSTLToImage(stlPath: string): Promise<string> {
  // Verifique se o arquivo STL existe
  if (!fs.existsSync(stlPath)) {
    throw new Error(`Arquivo STL não encontrado: ${stlPath}`);
  }

  // Inicie o Puppeteer
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // Defina o tamanho da janela
  await page.setViewport({ width: 800, height: 600 });

  // Carregue a página do site
  const url =
    "https://fenrus75.github.io/FenrusCNCtools/javascript/stl2png.html";
  await page.goto(url, { waitUntil: "networkidle0" });

  // Carregar o arquivo STL
  const inputUploadHandle = await page.$('input[type="file"]#files');
  if (!inputUploadHandle) {
    throw new Error("Could not find file input element");
  }
  await inputUploadHandle.uploadFile(stlPath);

  // Aguarde a renderização e a geração da imagem
  await page.waitForSelector("#download", { visible: true });

  // Capturar a imagem gerada
  const downloadLink = await page.$("#download");
  const imageData = await page.evaluate(
    (el) => el?.getAttribute("href") ?? "",
    downloadLink
  );

  // Converter a imagem base64 para buffer
  const base64Data = imageData.split(",")[1];
  const buffer = Buffer.from(base64Data, "base64");

  // Defina o caminho para salvar a imagem
  const outputPath = stlPath.replace(/\.stl$/i, ".png");
  fs.writeFileSync(outputPath, buffer);

  // Feche o navegador
  await browser.close();

  return outputPath;
}
