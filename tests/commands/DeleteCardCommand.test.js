import { describe, it, expect, beforeEach } from 'vitest';
import Store from '../../src/core/Store.js';
import Card from '../../src/models/Card.js';
import Column from '../../src/models/Column.js';
import DeleteCardCommand from '../../src/commands/DeleteCardCommand.js';

const makeCard = (id) =>
  new Card({ id, title: id, description: '', columnId: 'col-1' });

describe('DeleteCardCommand', () => {
  let column;
  let card;
  let store;

  beforeEach(() => {
    card = makeCard('card-1');
    column = new Column({ id: 'col-1', name: 'To Do', cardIds: ['card-1'] });
    store = new Store({
      board: { id: 'board-1', name: 'Test Board' },
      cards: { [card.id]: card },
      columns: { [column.id]: column },
      columnOrder: ['col-1'],
    });
  });

  it('menghapus card dari cards dan dari cardIds kolom tanpa mutasi data lama', () => {
    new DeleteCardCommand(store, 'col-1', 'card-1').execute();

    const state = store.getState();
    expect(state.cards['card-1']).toBeUndefined();
    expect(state.columns['col-1'].cardIds).toEqual([]);
    expect(column.cardIds).toEqual(['card-1']);
  });

  it('mengembalikan card persis seperti semula setelah di-undo', () => {
    const command = new DeleteCardCommand(store, 'col-1', 'card-1');
    command.execute();
    command.undo();

    const state = store.getState();
    expect(state.cards['card-1']).toEqual(card);
    expect(state.columns['col-1'].cardIds).toEqual(['card-1']);
  });

  it('mengembalikan card ke posisi aslinya, bukan ke urutan terakhir, setelah di-undo', () => {
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

    const command = new DeleteCardCommand(multiStore, 'col-1', 'card-1');
    command.execute();
    command.undo();

    expect(multiStore.getState().columns['col-1'].cardIds).toEqual([
      'card-0',
      'card-1',
      'card-2',
    ]);
  });
});
