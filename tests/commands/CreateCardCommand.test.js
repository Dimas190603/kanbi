import { describe, it, expect, beforeEach } from 'vitest';
import Store from '../../src/core/Store.js';
import Card from '../../src/models/Card.js';
import Column from '../../src/models/Column.js';
import CreateCardCommand from '../../src/commands/CreateCardCommand.js';

describe('CreateCardCommand', () => {
  let initialColumn;
  let store;
  let newCard;

  beforeEach(() => {
    initialColumn = new Column({ id: 'col-1', name: 'To Do', cardIds: [] });
    store = new Store({
      board: { id: 'board-1', name: 'Test Board' },
      cards: {},
      columns: { [initialColumn.id]: initialColumn },
      columnOrder: ['col-1'],
    });
    newCard = new Card({
      id: 'card-1',
      title: 'Card Pertama',
      description: 'Deskripsi test',
      columnId: 'col-1',
    });
  });

  it('menambahkan card baru ke dalam cards tanpa mutasi data lama', () => {
    new CreateCardCommand(store, 'col-1', newCard).execute();

    const state = store.getState();
    expect(state.cards['card-1']).toEqual(newCard);
    expect(state.columns['col-1'].cardIds).toEqual(['card-1']);
    expect(initialColumn.cardIds).toEqual([]);
  });

  it('mengembalikan state seperti semula setelah di-undo', () => {
    const command = new CreateCardCommand(store, 'col-1', newCard);
    command.execute();
    command.undo();

    const state = store.getState();
    expect(state.cards['card-1']).toBeUndefined();
    expect(state.cards).toEqual({});
    expect(state.columns['col-1'].cardIds).toEqual([]);
  });
});
