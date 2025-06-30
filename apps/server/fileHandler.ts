import * as fs from 'fs/promises';
import upath from 'upath';

const DATA_DIR = upath.resolve(process.cwd(), 'apps/server/src/data');

export async function readJson(filename: string) {
  const filePath = upath.join(DATA_DIR, filename);
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

export async function writeJson(filename: string, data: any) {
  const filePath = upath.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
