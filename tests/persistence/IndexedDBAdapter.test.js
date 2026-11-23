import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import IndexedDBAdapter from '../../src/persistence/IndexedDBAdapter';

describe('IndexedDBAdapter', () => {
  let adapter;

  beforeEach(async () => {
    adapter = new IndexedDBAdapter();
    await adapter.clear();
  });

  it('Load mengembalikan undefined kalau belum ada data', async () => {
    expect(await adapter.load()).toBeUndefined();
  });

  it('Save lalu load mengembalikan data yang sama', async () => {
    const record = { versin: 1, state: { cards: { card1: { id: 'card1' } } } };
    await adapter.save(record);

    expect(await adapter.load()).toEqual(record);
  });

  it('Save kedua menimpa yang kedua', async () => {
    await adapter.save({ versin: 1, state: { n: 1 } });
    await adapter.save({ versin: 1, state: { n: 2 } });

    expect((await adapter.load()).state).toEqual({ n: 2 });
  });

  it('Key berbeda tidak saling menimpa', async () => {
    await adapter.save({ version: 1, state: 'primary' });
    await adapter.save({ version: 2, state: 'secondary' }, 'board-backup');

    expect((await adapter.load()).state).toBe('primary');
    expect((await adapter.load('board-backup')).state).toBe('secondary');
  });

  it('Clear menghapus semua data', async () => {
    await adapter.save({ version: 1, state: 'new' });
    await adapter.clear();

    expect(await adapter.load()).toBeUndefined();
  });
});
