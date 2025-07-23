import fs from "fs";
import path from "path";
import { general } from "../configuration/general";
import { WASocket } from "baileys";
import PrismaSingleton from "../utils/PrismaSingleton";
import axios from "axios";

async function getEmbedding(text: string, model: string = "mxbai-embed-large") {
  const { data } = await axios.post("http://localhost:11434/api/embed", {
    model,
    input: text
  });
  return data.embeddings;
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

export async function searchDocuments(query: string): Promise<string[]> {
  const prisma = PrismaSingleton.getInstance();
  const fatos = await prisma.fatos.findMany({
    take: 20,
    orderBy: { id: 'desc' }
  });

  const queryEmbeddingArr = await getEmbedding(query);
  const queryEmbedding = Array.isArray(queryEmbeddingArr) ? queryEmbeddingArr[0] : queryEmbeddingArr;

  const scoredFatos: { fato: string, score: number }[] = [];
  for (const fatoObj of fatos) {
    const fatoEmbeddingArr = await getEmbedding(fatoObj.fato);
    const fatoEmbedding = Array.isArray(fatoEmbeddingArr) ? fatoEmbeddingArr[0] : fatoEmbeddingArr;
    const score = cosineSimilarity(queryEmbedding, fatoEmbedding);
    scoredFatos.push({ fato: fatoObj.fato, score });
  }

  scoredFatos.sort((a, b) => b.score - a.score);
  return scoredFatos.slice(0, 5).map(f => f.fato);
}

export async function cacheGroupInfo(bot: WASocket, groupJid: string): Promise<void> {
  try {
    const groupInfo = await bot.groupMetadata(groupJid);
    const cachePath = path.join(general.CACHE_DIR, "groups.json");
    let cacheData: Record<string, any> = {};
    if (fs.existsSync(cachePath)) {
      const raw = fs.readFileSync(cachePath, "utf-8");
      try {
        cacheData = JSON.parse(raw);
      } catch {
        cacheData = {};
      }
    }
    cacheData[groupJid] = groupInfo;
    fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro ao salvar informações do grupo em cache:", err);
  }
}