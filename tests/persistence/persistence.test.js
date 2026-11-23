import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Store from '../../src/core/Store.js';
import {
  attachPersistence,
  SCHEMA_VERSION,
} from '../../src/persistence/persistence.js';

describe('attachPersistence', () => {
  let adapter;
  let store;

  beforeEach(() => {
    vi.useFakeTimers();
    adapter = { save: vi.fn().mockResolvedValue(undefined) };
    store = new Store({ n: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Tidak menyimpan sebelum delay berlalu', () => {
    attachPersistence({ store, adapter, delay: 300 });
    store.setState({ n: 1 });

    vi.advanceTimersByTime(299);
    expect(adapter.save).not.toHaveBeenCalled();
  });

  it('Menyimpan sekali delay dengan format {version, state}', () => {
    attachPersistence({ store, adapter, delay: 300 });
    store.setState({ n: 1 });

    vi.advanceTimersByTime(300);

    expect(adapter.save).toHaveBeenCalled(1);
    expect(adapter.save).toHaveBeenCalledWith({
      version: SCHEMA_VERSION,
      state: { n: 1 },
    });
  });

  it('Perubahan beruntun hanya menghasilkan satu simpan dengan state terakhir', () => {
    attachPersistence({ store, adapter, delay: 300 });

    store.setState({ n: 1 });
    vi.advanceTimersByTime(100);
    store.setState({ n: 2 });
    vi.advanceTimersByTime(100);
    store.setState({ n: 3 });
    vi.advanceTimersByTime(300);

    expect(adapter.save).toHaveBeenCalled(1);
    expect(adapter.save).toHaveBeenCalledWith({
      version: SCHEMA_VERSION,
      state: { n: 3 },
    });
  });

  it('Flush menyimpan langsung tanpa menunggu delay dan membatalkan delay', async () => {
    const persistence = attachPersistence({ store, adapter, delay: 300 });
    store.setState({ n: 1 });

    await persistence.flush();
    expect(adapter.save).toHaveBeenCalled(1);

    vi.advanceTimersByTime(1000);
    expect(adapter.save).toHaveBeenCalled(1);
  });

  it('Flush tidak menyimpan kalau tidak ada perubahan yang tertunda', async () => {
    const persistence = attachPersistence({ store, adapter });
    store.setState({ n: 1 });

    expect(adapter.save).not.toHaveBeenCalled();
  });

  it('Kegagalan menyimpan, dilaporkan lewat onError dan tidak melempar', async () => {
    const error = new Error('Quota full');
    adapter.save.mockRejectedValue(error);
    const onError = vi.fn();
    attachPersistence({ store, adapter, delay: 300, onError });

    store.setState({ n: 1 });
    await vi.advanceTimersByTime(300);

    expect(onError).toHaveBeenCalledWith(error);
  });

  it('Detach menghentikan penyimpanan', async () => {
    const persistence = attachPersistence({ store, adapter, delay: 300 });
    store.setState({ n: 1 });
    await persistence.detach();

    vi.advanceTimersByTime(300);
    expect(adapter.save).not.toHaveBeenCalled();
  });
});
