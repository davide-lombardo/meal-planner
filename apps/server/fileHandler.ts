import * as fs from 'fs/promises';
import upath from 'upath';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory path for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set the data directory relative to the current file
const DATA_DIR = upath.resolve(__dirname, 'src/data');

export async function readJson(filename: string) {
  const filePath = upath.join(DATA_DIR, filename);
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

export async function writeJson(filename: string, data: any) {
  const filePath = upath.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
