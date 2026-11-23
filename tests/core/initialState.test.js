import { describe, it, expect } from 'vitest';
import { createInitialState } from '../../src/core/intialState';

describe('createInitialState', () => {
  it('Punya 3 kolom To Do, In Progress, Done tanpa card', () => {
    const state = createInitialState();

    expect(state.columnOrder.map((id) => state.columns[id].name)).toEqual([
      'To Do',
      'In Progress',
      'Done',
    ]);

    expect(state.cards).toEqual({});
  });

  it('Semua kolom awalnya kosong dan semua id di columnOrder ada di columns', () => {
    const state = createInitialState();
    state.columnOrder.forEach((id) => {
      expect(state.columns[id]).toBeDefined();
      expect(state.columns[id].cardIds).toEqual([]);
    });
  });

  it('Setiap pemanggilan menghasilkan object baru (tanpa berbagi referensi)', () => {
    const a = createInitialState();
    const b = createInitialState();

    a.columns['col-todo'].cardIds.push('x');
    expect(b.columns['col-todo'].cardIds).toEqual([]);
  });
});
