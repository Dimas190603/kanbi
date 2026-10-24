import { describe, expect, it, vi } from 'vitest';
import Store from '../../src/core/Store.js';

describe('Store', () => {
  it('getState mengembalikan state awal', () => {
    const store = new Store({ message: 'Hello' });
    store.getState();

    expect(store.getState()).toEqual({ message: 'Hello' });
  });
  it('setState mengganti state', () => {
    const store = new Store({ message: 'Hello' });
    store.setState({ message: 'Hai Dimas' });

    expect(store.getState()).toEqual({ message: 'Hai Dimas' });
  });
  it('setState memanggil semua listener yang terdaftar', () => {
    const store = new Store({ message: 'Hello' });
    const listenerA = vi.fn();
    const listenerB = vi.fn();
    store.subscribe(listenerA);
    store.subscribe(listenerB);

    store.setState({ message: 'Hai Dimas' });

    expect(listenerA).toHaveBeenCalledTimes(1);
    expect(listenerB).toHaveBeenCalledTimes(1);
  });
  it('listener melihat state yang SUDAH diperbarui', () => {
    const store = new Store({ message: 'Hello' });
    let seen = null;
    store.subscribe(() => {
      seen = store.getState().message;
    });

    store.setState({ message: 'Hai Dimas' });
    expect(seen).toBe('Hai Dimas');
  });
  it('listener yang sama tidak terdaftar dua kali', () => {
    const store = new Store({ message: 'Hello' });
    const listener = vi.fn();
    store.subscribe(listener);
    store.subscribe(listener);

    store.setState({ message: 'Hai Dimas' });
    expect(listener).toHaveBeenCalledTimes(1);
  });
  it('unsubscribe menghentikan listener tanpa mengganggu yang lain', () => {
    const store = new Store({ message: 'Hello' });
    const removed = vi.fn();
    const kept = vi.fn();
    const unsubscribe = store.subscribe(removed);
    store.subscribe(kept);

    unsubscribe();
    store.setState({ message: 'Hai Dimas' });
    expect(kept).toHaveBeenCalledTimes(1);
    expect(store.getState()).toEqual({ message: 'Hai Dimas' });
  });
});
