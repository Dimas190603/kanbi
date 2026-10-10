import { describe, it, expect, beforeEach } from 'vitest';
import Store from '../../src/core/Store.js';
import Card from '../../src/models/Card.js';
import Column from '../../src/models/Column.js';
import MoveCardCommand from '../../src/commands/MoveCardCommand.js';

describe('MoveCardCommand', () => {
  let source;
  let destination;
  let store;

  beforeEach(() => {
    const makeCard = (id) =>
      new Card({ id, title: id, description: '', columnId: 'col-1' });

    source = new Column({
      id: 'col-1',
      name: 'To Do',
      cardIds: ['card-0', 'card-1', 'card-2'],
    });
    destination = new Column({ id: 'col-2', name: 'In Progress', cardIds: [] });

    store = new Store({
      board: { id: 'board-1', name: 'Test Board' },
      cards: {
        'card-0': makeCard('card-0'),
        'card-1': makeCard('card-1'),
        'card-2': makeCard('card-2'),
      },
      columns: { [source.id]: source, [destination.id]: destination },
      columnOrder: ['col-1', 'col-2'],
    });
  });

  it('memindahkan card ke kolom tujuan dan memperbarui columnId tanpa mutasi data lama', () => {
    new MoveCardCommand(store, 'card-1', source, destination).execute();

    const state = store.getState();
    expect(state.columns['col-1'].cardIds).toEqual(['card-0', 'card-2']);
    expect(state.columns['col-2'].cardIds).toEqual(['card-1']);
    expect(state.cards['card-1'].columnId).toBe('col-2');
    expect(source.cardIds).toEqual(['card-0', 'card-1', 'card-2']);
  });

  it('mengembalikan card ke posisi aslinya di kolom asal setelah di-undo', () => {
    const command = new MoveCardCommand(store, 'card-1', source, destination);
    command.execute();
    command.undo();

    const state = store.getState();
    expect(state.columns['col-1'].cardIds).toEqual([
      'card-0',
      'card-1',
      'card-2',
    ]);
    expect(state.columns['col-2'].cardIds).toEqual([]);
    expect(state.cards['card-1'].columnId).toBe('col-1');
  });
});
