// Utility for reading/writing JSON data files for recipes, history, and config
import * as fs from 'fs/promises';
import * as path from 'path';

// Always use the Nx workspace root to resolve the data directory
const DATA_DIR = path.resolve(process.cwd(), 'apps/server/src/data');

export async function readJson(filename: string) {
  const filePath = path.join(DATA_DIR, filename);
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

export async function writeJson(filename: string, data: any) {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
