import { describe, it, expect, beforeEach } from 'vitest';
import Store from '../../src/core/Store.js';
import Card from '../../src/models/Card.js';
import Column from '../../src/models/Column.js';
import DeleteCardCommand from '../../src/commands/DeleteCardCommand.js';

describe('DeleteCardCommand', () => {
  let store;
  let column;
  let card;

  beforeEach(() => {
    card = new Card({
      id: 'card-1',
      title: 'Card Pertama',
      description: 'Test Delete Card Pertama.',
      columnId: 'col-1',
    });

    column = new Column({
      id: 'col-1',
      name: 'Delete Card Test',
      cardIds: ['card-1'],
    });

    store = new Store({
      board: { id: 'board-1', name: 'Test Board' },
      cards: {
        [card.id]: card,
      },
      columns: {
        [column.id]: column,
      },
      columnOrder: [column.id],
    });
  });

  it('Menghapus card dari cards dan dari cardIds kolom tanpa mutasi data lama', () => {
    const command = new DeleteCardCommand(store, column, card.id);
    command.execute();

    const state = store.getState();
    expect(state.cards[card.id]).toBeUndefined();
    expect(state.columns[column.id].cardIds).toEqual([]);
    expect(column.cardIds).toEqual(['card-1']); // Object lama tidak ter-mutasi
  });

  it('Mengembalikan card persis seperti semula seperti setelah di-undo', () => {
    const command = new DeleteCardCommand(store, column, card.id);
    command.execute();
    command.undo();

    const updatedState = store.getState();
    expect(updatedState.cards[card.id]).toEqual(card);
    expect(updatedState.columns[column.id].cardIds).toEqual([card.id]);
  });

  it('mengembalikan card ke posisi aslinya, bukan ke urutan terakhir, setelah di-undo', () => {
    const makeCard = (id) =>
      new Card({ id, title: id, description: '', columnId: 'col-1' });

    const multiColumn = new Column({
      id: 'col-1',
      name: 'To Do',
      cardIds: ['card-0', 'card-1', 'card-2'],
    });

    const multiStore = new Store({
      board: { id: 'board-1', name: 'Test Board' },
      cards: {
        'card-0': makeCard('card-0'),
        'card-1': makeCard('card-1'),
        'card-2': makeCard('card-2'),
      },
      columns: { [multiColumn.id]: multiColumn },
      columnOrder: ['col-1'],
    });

    // card-1 ada di TENGAH
    const command = new DeleteCardCommand(multiStore, multiColumn, 'card-1');
    command.execute();
    command.undo();

    expect(multiStore.getState().columns['col-1'].cardIds).toEqual([
      'card-0',
      'card-1',
      'card-2',
    ]);
  });
});
