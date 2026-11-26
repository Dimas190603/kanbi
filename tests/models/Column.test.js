import { describe, it, expect } from 'vitest';
import Column from '../../src/models/Column';

describe('Column', () => {
  it('Menyimpan id, name, cardIds, dan wipLimit yang berikan', () => {
    const column = new Column({
      id: 'col-1',
      name: 'To Do',
      cardIds: ['a', 'b'],
      wipLimit: 3,
    });

    expect(column).toMatchObject({
      id: 'col-1',
      name: 'To Do',
      cardIds: ['a', 'b'],
      wipLimit: 3,
    });
  });

  it('cardIds default adalah array kosong', () => {
    expect(new Column({ id: 'col-1', name: 'Done' }).cardIds).toEqual([]);
  });

  it('cardIds default tidak berbagi instance', () => {
    const a = new Column({ id: 'col-1', name: 'In Progress' });
    const b = new Column({ id: 'col-2', name: 'Done' });

    a.cardIds.push('x');

    expect(b.cardIds).toEqual([]);
  });

  it('wipLimit default null (artinya tanpa batas', () => {
    expect(new Column({ id: 'col-1', name: 'Done' }).wipLimit).toBeNull();
  });
});
