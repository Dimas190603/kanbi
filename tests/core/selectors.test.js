import { describe, it, expect } from 'vitest';
import { findColumnIdByCardId } from '../../src/core/selectors';

describe('findColumnIdByCardId', () => {
  const state = {
    columns: {
      'col-1': {
        id: 'col-1',
        name: 'First of Column',
        cardIds: ['card-1', 'card-2'],
      },
      'col-2': {
        id: 'col-2',
        name: 'Second of Column',
        cardIds: ['card-3'],
      },
    },
  };

  it('Mengembalikan id kolom yang memuat card', () => {
    expect(findColumnIdByCardId(state, 'card-3')).toBe('col-2');
  });

  it('Mengembalikan undefined ketika tidak ada card di kolom tersebut', () => {
    expect(findColumnIdByCardId(state, 'card-404')).toBeUndefined();
  });
});
