import { describe, it, expect } from 'vitest';
import { saveData, loadData } from '../src/utils/fileHandler';

describe('fileHandler', () => {
  it('should save and load data (mock)', async () => {
    const data = { foo: 'bar' };
    const result = await saveData('test.json', data);
    expect(result).toBe('Data saved (mock)');
    const loaded = await loadData('test.json');
    expect(loaded).toBe(null); // mock always returns null
  });
});
