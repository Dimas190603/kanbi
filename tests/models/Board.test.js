import { describe, it, expect, vi, afterEach } from 'vitest';
import Board from '../../src/models/board';

describe('Board', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('Menyimpan id dan name', () => {
    expect(new Board({ id: 'board-1', name: 'Task Board' })).toMatchObject({
      id: 'board-1',
      name: 'Task Board',
    });
  });

  it('createdAt default berupa string ISO pada waktu pembuatan', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01T10:00:00.000Z'));

    expect(new Board({ id: 'board-1', name: 'Task Board' }).createdAt).toBe(
      '2026-03-01T10:00:00.000Z'
    );
  });

  it('createdAt yang diberikan akan dipertahankan', () => {
    const board = new Board({
      id: 'board-1',
      name: 'Task Board',
      createdAt: '2025-05-05T00:00:00.000Z',
    });
    expect(board.createdAt).toBe('2025-05-05T00:00:00.000Z');
  });
});
