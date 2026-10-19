import { describe, it, expect, vi } from 'vitest';
import CommandManager from '../../src/core/CommandManager';

const makeCommand = () => ({ execute: vi.fn(), undo: vi.fn() });

describe('CommandManager', () => {
  it('Awalnya tidak bisa undo maupun redo', () => {
    const manager = new CommandManager();
    expect(manager.canUndo()).toBe(false);
    expect(manager.canRedo()).toBe(false);
  });

  it('Bisa undo setelah execute, bisa redo setelah undo', () => {
    const manager = new CommandManager();
    manager.execute(makeCommand());
    expect(manager.canUndo()).toBe(true);
    expect(manager.canRedo()).toBe(false);

    manager.undo();
    expect(manager.canUndo()).toBe(false);
    expect(manager.canRedo()).toBe(true);
  });

  it('Execute baru mengosongkan redoStack', () => {
    const manager = new CommandManager();
    manager.execute(makeCommand());
    manager.undo();
    manager.execute(makeCommand());
    expect(manager.canRedo()).toBe(false);
  });

  it('Listener melihat stack yang SUDAH diperbarui', () => {
    const manager = new CommandManager();
    let canUndoSeen = null;
    manager.subscribe(() => {
      canUndoSeen = manager.canUndo();
    });
    manager.execute(makeCommand());
    expect(canUndoSeen).toBe(true);
  });

  it('Berhenti dipanggil setelah unsubscribe', () => {
    const manager = new CommandManager();
    const listener = vi.fn();
    const unsubscribe = manager.subscribe(listener);
    unsubscribe();
    manager.execute(makeCommand());
    expect(listener).not.toHaveBeenCalled();
  });
});
