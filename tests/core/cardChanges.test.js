import { describe, it, expect } from 'vitest';
import { getCardChanges } from '../../src/core/cardChanges';

describe('getCardChanges', () => {
  const card = {
    id: 'card-1',
    title: "Omniscient Reader's Viewpoint",
    description:
      'An ordinary office worker whose favorite online story suddenly becomes real',
  };

  it('Mengembalikan object kosong kalau tidak ada yang berubah', () => {
    expect(
      getCardChanges(card, {
        title: "Omniscient Reader's Viewpoint",
        description:
          'An ordinary office worker whose favorite online story suddenly becomes real',
      })
    ).toEqual({});
  });

  it('Hanya memuat title kalau hanya title yang berubah', () => {
    expect(
      getCardChanges(card, {
        title: 'Lord Of Mystery',
        description:
          'An ordinary office worker whose favorite online story suddenly becomes real',
      })
    ).toEqual({ title: 'Lord Of Mystery' });
  });

  it('Hanya memuat description kalau hanya description yang berubah', () => {
    expect(
      getCardChanges(card, {
        title: "Omniscient Reader's Viewpoint",
        description: 'Change',
      })
    ).toEqual({ description: 'Change' });
  });

  it('Memuat keduanya jika keduanya (title & description) berubah', () => {
    expect(
      getCardChanges(card, {
        title: 'Lord Of Mystery',
        description: 'The Fool',
      })
    ).toEqual({ title: 'Lord Of Mystery', description: 'The Fool' });
  });

  it('description undefined dianggap sama dengan string kosong (bukan perubahan)', () => {
    const noDescriptionCard = {
      id: 'c1',
      title: "Omniscient Reader's Viewpoint",
    };

    expect(
      getCardChanges(noDescriptionCard, {
        title: "Omniscient Reader's Viewpoint",
        description: '',
      })
    ).toEqual({});
  });
});
