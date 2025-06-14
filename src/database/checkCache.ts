import fs from "fs";
import path from "path";
import { general } from "../configuration/general";

const cachePath = path.resolve(general.CACHE_DIR, "cache.json");

function ensureCacheExists() {
  try {
    const cacheDir = path.dirname(cachePath);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    if (!fs.existsSync(cachePath)) {
      fs.writeFileSync(cachePath, "[]");
    }
  } catch (error) {
    console.error("Erro ao criar estrutura de cache:", error);
    throw error;
  }
}

export default async function (remoteJid: string) {
  try {
    ensureCacheExists();

    const cache: string[] = JSON.parse(fs.readFileSync(cachePath, "utf-8"));

    if (cache.includes(remoteJid)) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Erro ao verificar cache:", error);
    return false;
  }
}

export async function addCache(remoteJid: string) {
  try {
    ensureCacheExists();

    const cache: string[] = JSON.parse(fs.readFileSync(cachePath, "utf-8"));

    cache.push(remoteJid);

    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.error("Erro ao adicionar ao cache:", error);
  }
}
