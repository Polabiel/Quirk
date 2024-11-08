const {facebook} = require('betabotz-tools');
import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from "uuid";
import { general } from '../configuration/general';

export default async function downloadFacebookVideo(url: string): Promise<{buffer: Buffer, filePath: string}> {

  const video: { status: number, creator: string, result: { title: string, thumbnail: string, Normal_video: string, HD: string } } = await facebook(url);

  const response = await axios.get(video.result.HD, { responseType: 'arraybuffer' });

  const tempDir = general.TEMP_DIR;
  await fs.mkdir(tempDir, { recursive: true });

  const filePath = path.join(tempDir, `${uuidv4()}.mp4`);

  await fs.writeFile(filePath, response.data);

  const buffer = await fs.readFile(filePath);

  return {buffer, filePath};

}

export async function deletefile(filePath: string): Promise<void> {
  await fs.unlink(filePath);
}