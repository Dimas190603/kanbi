import { describe, it, expect, vi } from 'vitest';
import Store from '../../src/core/Store.js';
import Card from '../../src/models/Card.js';
import Column from '../../src/models/Column.js';
import MoveCardCommand from '../../src/commands/MoveCardCommand.js';

// ------> Helper <------
const makeCard = (id, columnId) =>
  new Card({ id, title: id, description: id, columnId });

// ------> Setup membuat 2 kolom <------
function setup({ col1 = [], col2 = [] } = {}) {
  const cards = {};
  col1.forEach((id) => (cards[id] = makeCard(id, col1)));
  col2.forEach((id) => (cards[id] = makeCard(id, col2)));

  const source = new Column({ id: 'col-1', name: 'To Do', cardIds: col1 });
  const destination = new Column({
    id: 'col-2',
    name: 'In Progres',
    cardIds: col2,
  });

  const store = new Store({
    board: { id: 'board-1', name: 'Testing Board' },
    cards,
    columns: {
      'col-1': source,
      'col-2': destination,
    },
    columnOrder: ['col-1', 'col-2'],
  });

  return { store, source, destination };
}

const idsOf = (store, columnId) => store.getState().columns[columnId].cardIds;
const columnIdOf = (store, cardId) => store.getState().cards[cardId].columnId;

// ------> Test <------
describe('MoveCardCommand', () => {
  describe('Antar kolom', () => {
    it('Memindahkan card ke pisisi tengah kolom tujuan dan memperbarui columnId', () => {
      const { store } = setup({
        col1: ['card-1', 'card-2', 'card-3'],
        col2: ['x', 'y'],
      });

      new MoveCardCommand(store, 'card-2', 'col-1', 'col-2', 1).execute();
      expect(idsOf(store, 'col-1')).toEqual(['card-1', 'card-3']);
      expect(idsOf(store, 'col-2')).toEqual(['x', 'card-2', 'y']);
      expect(columnIdOf(store, 'card-2')).toBe('col-2');
    });

    it('Menaruh card di paling atas kalau toIndex = 0', () => {
      const { store } = setup({ col1: ['card-1'], col2: ['x', 'y'] });
      new MoveCardCommand(store, 'card-1', 'col-1', 'col-2', 0).execute();

      expect(idsOf(store, 'col-2')).toEqual(['card-1', 'x', 'y']);
    });

    it('Menaruh card diujung kalau toIndex tidak diberikan', () => {
      const { store } = setup({ col1: ['card-1'], col2: ['x', 'y'] });
      new MoveCardCommand(store, 'card-1', 'col-1', 'col-2').execute();

      expect(idsOf(store, 'col-2')).toEqual(['x', 'y', 'card-1']);
    });

    it('Menaruh card diujung kalau toIndex melebihi panjang daftar', () => {
      const { store } = setup({ col1: ['card-1'], col2: ['x', 'y'] });
      new MoveCardCommand(store, 'card-1', 'col-1', 'col-2', 99).execute();

      expect(idsOf(store, 'col-2')).toEqual(['x', 'y', 'card-1']);
    });

    it('Tidak memutasi object kolom yang lama', () => {
      const { store, source, destination } = setup({
        col1: ['card-1', 'card-2', 'card-3'],
        col2: ['x', 'y'],
      });

      const sourceBefore = [...source.cardIds];
      const destinationBefore = [...destination.cardIds];

      new MoveCardCommand(store, 'card-2', 'col-1', 'col-2', 1).execute();
      expect(source.cardIds).toEqual(sourceBefore);
      expect(destination.cardIds).toEqual(destinationBefore);
    });

    it('Undo mengembalikan urutan di kedua kolom dan columnId', () => {
      const { store } = setup({
        col1: ['card-1', 'card-2', 'card-3'],
        col2: ['x', 'y'],
      });

      const command = new MoveCardCommand(store, 'card-2', 'col-1', 'col-2', 1);
      command.execute();
      command.undo();

      expect(columnIdOf(store, 'card-2')).toBe('col-1');
    });
  });

  describe('Dalam kolom yang sama', () => {
    it('Memindahkan a ke index 2 menghasilkan [b, c, a]', () => {
      const { store } = setup({ col1: ['a', 'b', 'c'] });
      new MoveCardCommand(store, 'a', 'col-1', 'col-1', 2).execute();

      expect(idsOf(store, 'col-1')).toEqual(['b', 'c', 'a']);
    });

    it('Memindahkan c ke index 0 menghasilkan [c, a, b]', () => {
      const { store } = setup({ col1: ['a', 'b', 'c'] });
      new MoveCardCommand(store, 'c', 'col-1', 'col-1', 0).execute();

      expect(idsOf(store, 'col-1')).toEqual(['c', 'a', 'b']);
    });

    it('Memindahkan ke posisi yang sama tidak mengubah urutan', () => {
      const { store } = setup({ col1: ['a', 'b', 'c'] });
      new MoveCardCommand(store, 'b', 'col-1', 'col-1', 1).execute();

      expect(idsOf(store, 'col-1')).toEqual(['a', 'b', 'c']);
    });

    it('Undo mengembalikan urutan semula', () => {
      const { store } = setup({ col1: ['a', 'b', 'c'] });

      const command = new MoveCardCommand(store, 'a', 'col-1', 'col-1', 2);
      command.execute();
      command.undo();

      expect(idsOf(store, 'col-1')).toEqual(['a', 'b', 'c']);
    });

    it('columnId card tetap id kolom (tidak rusak) setelah execute maupun undo', () => {
      const { store } = setup({ col1: ['a', 'b', 'c'] });

      const command = new MoveCardCommand(store, 'a', 'col-1', 'col-1', 2);
      command.execute();
      expect(columnIdOf(store, 'a')).toBe('col-1');

      command.undo();
      expect(columnIdOf(store, 'a')).toBe('col-1');
    });
  });

  describe('Keamanan dan Konsistensi', () => {
    it('Memanggil listener store tepat sekali per-execute dan per-undo', () => {
      const { store } = setup({ col1: ['card-1'], col2: [] });
      const listener = vi.fn();
      store.subscribe(listener);

      const command = new MoveCardCommand(store, 'card-1', 'col-1', 'col-2', 0);
      command.execute();
      expect(listener).toHaveBeenCalledTimes(1);

      command.undo();
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('execute ulang setelah undo (redo) menghasilkan state yang sama dengan execute pertama', () => {
      const { store } = setup({
        col1: ['card-1', 'card-2', 'card-3'],
        col2: ['x'],
      });

      const command = new MoveCardCommand(store, 'card-1', 'col-1', 'col-2', 0);
      command.execute();
      const afterFirst = {
        col1: [...idsOf(store, 'col-1')],
        col2: [...idsOf(store, 'col-2')],
      };

      command.undo();
      command.execute();
      expect(idsOf(store, 'col-1')).toEqual(afterFirst.col1);
      expect(idsOf(store, 'col-2')).toEqual(afterFirst.col2);
    });

    it('Melempar error yang jelas kalau card tidak ada di kolom asal', () => {
      const { store } = setup({ col1: ['card-1'], col2: [] });

      expect(() =>
        new MoveCardCommand(store, 'card-404', 'col-1', 'col-2', 0).execute()
      ).toThrow('card-404');
    });
  });
});
