export const SCHEMA_VERSION = 1;

export function attachPersistence({
  store,
  adapter,
  delay = 300,
  onError = () => {},
}) {
  let timer = null;
  let pending = false; // ada perubahan yang belum tersimpan

  const save = async () => {
    timer = null;
    pending = false;
    try {
      await adapter.save({ version: SCHEMA_VERSION, state: store.getState() });
    } catch (error) {
      onError(error);
    }
  };

  const unsubscribe = store.subscribe(() => {
    pending = true;
    clearTimeout(timer);
    timer = setTimeout(save, delay);
  });

  return {
    flush() {
      if (!pending) return Promise.resolve();
      clearTimeout(timer);
      return save();
    },
    detach() {
      clearTimeout(timer);
      unsubscribe();
    },
  };
}
