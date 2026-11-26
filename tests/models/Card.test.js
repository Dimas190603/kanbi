import { describe, it, expect, vi, afterEach } from 'vitest';
import Card from '../../src/models/Card.js';

describe('Card', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const baseProps = {
    id: 'card-1',
    title: "Omniscient Reader's Viewpoint",
    description:
      'Following ordinary office worker Kim Dokja after the web novel he alone has read for years suddenly becomes reality.',
    columnId: 'col-1',
  };

  it('Menyimpan semua field yang diberikan', () => {
    const card = new Card({
      ...baseProps,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });

    expect(card).toMatchObject({
      ...baseProps,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });
  });

  it('createdAt default berupa string ISO pada waktu pembuatan', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01T10:00:00.000Z'));

    const card = new Card(baseProps);

    expect(card.createdAt).toBe('2026-03-01T10:00:00.000Z');
  });

  it('createdAt yang diberikan dipertahankan', () => {
    const card = new Card({
      ...baseProps,
      createdAt: '2025-05-05T00:00:00.000Z',
    });

    expect(card.createdAt).toBe('2025-05-05T00:00:00.000Z');
  });

  it('updatedAt defaultnya null (belum pernah diedit)', () => {
    expect(new Card(baseProps).updatedAt).toBeNull();
  });

  it('Tidak punya properti order (urutan dimiliki column.cardIds)', () => {
    expect('order' in new Card(baseProps)).toBe(false);
  });
});
