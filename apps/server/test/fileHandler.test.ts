import { readJson, writeJson } from '../utils/fileHandler';
import * as fs from 'fs/promises';
import upath from 'upath';

describe('fileHandler', () => {
  const testFile = 'test.json';
  const testPath = upath.join(upath.resolve(process.cwd(), 'apps/server/src/data'), testFile);
  const testData = { foo: 'bar', num: 42 };

  afterEach(async () => {
    try {
      await fs.unlink(testPath);
    } catch {}
  });

  it('should write and read JSON data correctly', async () => {
    await writeJson(testFile, testData);
    const data = await readJson(testFile);
    expect(data).toEqual(testData);
  });

  it('should throw if file does not exist', async () => {
    await expect(readJson('nonexistent.json')).rejects.toThrow();
  });
});
