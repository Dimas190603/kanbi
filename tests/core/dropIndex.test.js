import { describe, it, expect } from 'vitest';
import { indexFromMidpoints } from '../../src/core/dropIndex';

describe('indexFromMidpoints', () => {
  const mids = [50, 150, 250];

  it('Diatas semua card -> 0', () => {
    expect(indexFromMidpoints(mids, 10)).toBe(0);
  });

  it('Diantara card pertama dan kedua -> 1', () => {
    expect(indexFromMidpoints(mids, 80)).toBe(1);
  });

  it('Tepat di titik tengah dianggap setelah card itu', () => {
    expect(indexFromMidpoints(mids, 150)).toBe(2);
  });

  it('Di bawah semua card -> jumlah card (ujung)', () => {
    expect(indexFromMidpoints(mids, 260)).toBe(3);
  });

  it('Jika kolomnya kosong', () => {
    expect(indexFromMidpoints([], 100)).toBe(0);
  });
});
