import { describe, it, expect, beforeEach } from 'vitest';
import Store from '../../src/core/Store.js';
import CommandManager from '../../src/core/CommandManager.js';
import Card from '../../src/models/Card.js';
import Column from '../../src/models/Column.js';
import CreateCardCommand from '../../src/commands/CreateCardCommand.js';
import DeleteCardCommand from '../../src/commands/DeleteCardCommand.js';
import MoveCardCommand from '../../src/commands/MoveCardCommand.js';

describe('Beberapa command berturut-turut tetap konsisten', () => {
  let store;
  let manager;
  let card2;

  beforeEach(() => {
    const card1 = new Card({
      id: 'card-1',
      title: 'Satu',
      description: '',
      columnId: 'col-1',
    });
    card2 = new Card({
      id: 'card-2',
      title: 'Dua',
      description: '',
      columnId: 'col-1',
    });

    store = new Store({
      board: { id: 'board-1', name: 'Test Board' },
      cards: { 'card-1': card1 },
      columns: {
        'col-1': new Column({
          id: 'col-1',
          name: 'To Do',
          cardIds: ['card-1'],
        }),
        'col-2': new Column({ id: 'col-2', name: 'In Progress', cardIds: [] }),
      },
      columnOrder: ['col-1', 'col-2'],
    });
    manager = new CommandManager();
  });

  it('create -> move -> undo tidak menggandakan card', () => {
    manager.execute(new CreateCardCommand(store, 'col-1', card2));
    manager.execute(new MoveCardCommand(store, 'card-1', 'col-1', 'col-2'));
    manager.undo();

    const { columns } = store.getState();
    expect(columns['col-1'].cardIds).toEqual(['card-1', 'card-2']);
    expect(columns['col-2'].cardIds).toEqual([]);
  });

  it('create -> delete -> undo tidak menghilangkan card lain', () => {
    manager.execute(new CreateCardCommand(store, 'col-1', card2));
    manager.execute(new DeleteCardCommand(store, 'col-1', 'card-1'));
    manager.undo();

    const { columns, cards } = store.getState();
    expect(columns['col-1'].cardIds).toEqual(['card-1', 'card-2']);
    expect(cards['card-2']).toBeDefined();
  });
});
