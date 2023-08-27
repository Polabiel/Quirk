import fs from "fs";
import path from "path";
import { general } from "../configuration/general";

const cachePath = path.resolve(general.CACHE_DIR, "cache.json");

export default async function (remoteJid: string) {
  const cache: string[] = JSON.parse(fs.readFileSync(cachePath, "utf-8"));

  if (cache.includes(remoteJid)) {
    return true;
  } else {
    return false;
  }
}

export async function addCache(remoteJid: string) {
  const cache: string[] = JSON.parse(fs.readFileSync(cachePath, "utf-8"));

  cache.push(remoteJid);

  fs.writeFileSync(cachePath, JSON.stringify(cache));
}
