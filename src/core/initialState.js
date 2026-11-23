import Board from '../models/board.js';
import Column from '../models/Column.js';

export function createInitialState() {
  const columns = [
    new Column({ id: 'col-todo', name: 'To Do', wipLimit: null }),
    new Column({ id: 'col-progress', name: 'In Progress', wipLimit: null }),
    new Column({ id: 'col-done', name: 'Done', wipLimit: null }),
  ];

  return {
    board: new Board({ id: 'board-1', name: 'Task Board' }),
    cards: {},
    columns: Object.fromEntries(columns.map((column) => [column.id, column])),
    columnOrder: columns.map((column) => column.id),
  };
}
