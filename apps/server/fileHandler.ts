// Utility for reading/writing JSON data files for recipes, history, and config
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robust data directory resolution: prefer ./src/data (production), fallback to ../src/data (dev)
function resolveDataDir() {
  const prodPath = path.resolve(__dirname, 'src/data');
  const devPath = path.resolve(__dirname, '../src/data');
  return fs.stat(prodPath).then(() => prodPath).catch(() => devPath);
}

export async function readJson(filename: string) {
  const dataDir = await resolveDataDir();
  const filePath = path.join(dataDir, filename);
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

export async function writeJson(filename: string, data: any) {
  const dataDir = await resolveDataDir();
  const filePath = path.join(dataDir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
