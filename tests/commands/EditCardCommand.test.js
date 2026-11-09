import { describe, it, expect, vi } from 'vitest';
import Store from '../../src/core/Store.js';
import Card from '../../src/models/Card.js';
import Column from '../../src/models/Column.js';
import EditCardCommand from '../../src/commands/EditCardCommand.js';

const T1 = '2026-01-01T00:00:00.000Z';
const T2 = '2026-01-02T00:00:00.000Z';
const CREATED = '2025-12-31T00:00:00.000Z';

function setup() {
  const card = new Card({
    id: 'card-1',
    title: 'Judul Lama',
    description: 'Deskripsi lama',
    columnId: 'col-1',
    createdAt: CREATED,
  });
  const column = new Column({
    id: 'col-1',
    name: 'To Do',
    cardIds: ['card-1'],
  });
  const store = new Store({
    board: { id: 'board-1', name: 'Test Board' },
    cards: { 'card-1': card },
    columns: { 'col-1': column },
    columnOrder: ['col-1'],
  });
  return { store, card };
}

const cardOf = (store) => store.getState().cards['card-1'];

describe('EditCardCommand', () => {
  it('mengubah title dan memperbarui updatedAt tanpa menyentuh field lain', () => {
    const { store } = setup();
    new EditCardCommand(store, 'card-1', { title: 'Judul Baru' }, T1).execute();

    const card = cardOf(store);
    expect(card.title).toBe('Judul Baru');
    expect(card.updatedAt).toBe(T1);
    expect(card.description).toBe('Deskripsi lama');
    expect(card.columnId).toBe('col-1');
    expect(card.createdAt).toBe(CREATED);
  });

  it('mengubah title dan description sekaligus', () => {
    const { store } = setup();
    new EditCardCommand(
      store,
      'card-1',
      { title: 'A', description: 'B' },
      T1
    ).execute();

    expect(cardOf(store).title).toBe('A');
    expect(cardOf(store).description).toBe('B');
  });

  it('undo mengembalikan nilai lama dan updatedAt lama (null)', () => {
    const { store } = setup();
    const command = new EditCardCommand(store, 'card-1', { title: 'Baru' }, T1);
    command.execute();
    command.undo();

    expect(cardOf(store).title).toBe('Judul Lama');
    expect(cardOf(store).updatedAt).toBeNull();
  });

  it('redo (execute ulang) menghasilkan updatedAt yang sama dengan execute pertama', () => {
    const { store } = setup();
    const command = new EditCardCommand(store, 'card-1', { title: 'Baru' }, T1);
    command.execute();
    command.undo();
    command.execute();

    expect(cardOf(store).updatedAt).toBe(T1);
  });

  it('tidak memutasi object card yang lama', () => {
    const { store, card } = setup();
    new EditCardCommand(store, 'card-1', { title: 'Baru' }, T1).execute();

    expect(card.title).toBe('Judul Lama');
    expect(card.updatedAt).toBeNull();
  });

  it('mengabaikan field di luar whitelist (id, columnId)', () => {
    const { store } = setup();
    new EditCardCommand(
      store,
      'card-1',
      { title: 'x', id: 'hack', columnId: 'col-9' },
      T1
    ).execute();

    const card = cardOf(store);
    expect(card.title).toBe('x');
    expect(card.id).toBe('card-1');
    expect(card.columnId).toBe('col-1');
  });

  it('memanggil listener Store tepat sekali per execute dan per undo', () => {
    const { store } = setup();
    const listener = vi.fn();
    store.subscribe(listener);

    const command = new EditCardCommand(store, 'card-1', { title: 'Baru' }, T1);
    command.execute();
    expect(listener).toHaveBeenCalledTimes(1);
    command.undo();
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('melempar error jelas kalau card tidak ada', () => {
    const { store } = setup();
    expect(() =>
      new EditCardCommand(store, 'card-404', { title: 'x' }, T1).execute()
    ).toThrow('card-404');
  });

  it('dua edit berturut-turut: undo satu per satu kembali ke B lalu ke A', () => {
    const { store } = setup();
    const first = new EditCardCommand(store, 'card-1', { title: 'B' }, T1);
    const second = new EditCardCommand(store, 'card-1', { title: 'C' }, T2);
    first.execute();
    second.execute();

    second.undo();
    expect(cardOf(store).title).toBe('B');
    expect(cardOf(store).updatedAt).toBe(T1);

    first.undo();
    expect(cardOf(store).title).toBe('Judul Lama');
    expect(cardOf(store).updatedAt).toBeNull();
  });
});
