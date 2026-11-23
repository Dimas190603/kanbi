import { describe, it, expect } from 'vitest';
import { isValidState } from '../../src/persistence/validateState';
import { createInitialState } from '../../src/core/intialState';

describe('isValidate', () => {
  const validState = () => ({
    board: { id: 'board' },
    cards: { card1: { id: 'card1' } },
    columns: { col1: { id: 'col1', cardIds: ['card1'] } },
    columnOrder: ['col1'],
  });

  it('Menerima state awal dari createInitialState', () => {
    expect(isValidState(createInitialState())).toBe(true);
  });

  it('Menerima state yang lengkap dan konsisten', () => {
    expect(isValidState(validState())).toBe(true);
  });

  it('Menolak null, array, dan nilai yang bukan object', () => {
    expect(isValidState(null)).toBe(false);
    expect(isValidState([])).toBe(false);
    expect(isValidState('state')).toBe(false);
  });

  it('Menolak state yang kehilangan bagian wajib', () => {
    const state = validState();
    delete state.cards;

    expect(isValidState(state)).toBe(false);
  });

  it('Menolak columnOrder yang merujuk ke kolom yang tidak ada', () => {
    const state = validState();
    state.columnOrder = ['col1', 'col404'];

    expect(isValidState(state)).toBe(false);
  });

  it('Menolak cardIds yang merujuk ke card yang tidak ada', () => {
    const state = validState();
    state.columnOrder = ['card1', 'card404'];

    expect(isValidState(state)).toBe(false);
  });

  it('Menolak cardIds yang bukan array', () => {
    const state = validState();
    state.columns.col1.cardIds = 'col1';

    expect(isValidState(state)).toBe(false);
  });
});
