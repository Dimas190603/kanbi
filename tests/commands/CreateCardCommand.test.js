import { describe, it, expect, beforeEach } from 'vitest';
import Store from '../../src/core/Store.js';
import Card from '../../src/models/Card.js';
import Column from '../../src/models/Column.js';
import CreateCardCommand from '../../src/commands/CreateCardCommand.js';

describe('CreateCardCommand', () => {
  let initialColumn;
  let store;
  let newCard;

  // Arrange: jalan otomatis sebelum SETIAP it(), jadi tiap test mulai dari data bersih
  beforeEach(() => {
    initialColumn = new Column({ id: 'col-1', name: 'To Do', cardIds: [] });

    store = new Store({
      board: { id: 'board-1', name: 'Board Test' },
      cards: {},
      columns: { [initialColumn.id]: initialColumn },
      columnOrder: ['col-1'],
    });

    newCard = new Card({
      id: 'card-1',
      title: 'Card Pertama',
      description: 'Deskripsi test card pertama.',
      columnId: 'col-1',
    });
  });

  it('menambahkan card baru ke dalam cards tanpa mutasi data lama', () => {
    // Act
    const command = new CreateCardCommand(store, initialColumn, newCard);
    command.execute();

    // Assert
    const updatedState = store.getState();
    expect(updatedState.cards['card-1']).toEqual(newCard);
    expect(updatedState.columns['col-1'].cardIds).toEqual(['card-1']);
    expect(initialColumn.cardIds).toEqual([]);
  });

  it('Mengembalikkan state seperti semula setelah di-undo', () => {
    const command = new CreateCardCommand(store, initialColumn, newCard);
    command.execute();
    command.undo();

    const updatedState = store.getState();
    expect(updatedState.cards['card-1']).toBeUndefined();
    expect(updatedState.cards).toEqual({});
    expect(updatedState.columns['col-1'].cardIds).toEqual([]);
  });
});
