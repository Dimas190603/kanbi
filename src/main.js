import './style.css';
import Store from './core/Store.js';
import CommandManager from './core/CommandManager.js';
import { createInitialState } from './core/initialState.js';
import IndexedDBAdapter from './persistence/IndexedDBAdapter.js';
import {
  attachPersistence,
  SCHEMA_VERSION,
} from './persistence/persistence.js';
import { isValidState } from './persistence/validateState.js';
import initApp from './app.js';

const statusEl = document.querySelector('#persistence-status');

function showStatus(message) {
  statusEl.textContent = message;
  statusEl.hidden = false;
}

async function bootstrap() {
  const adapter = new IndexedDBAdapter();
  let state = null;
  let storageAvailable = true;

  try {
    const record = await adapter.load();
    if (record) {
      if (record.version === SCHEMA_VERSION && isValidState(record.state)) {
        state = record.state;
      } else {
        showStatus(
          'Stored data is unrecognized. A new board is initialized, and the old data is copied as a backup.'
        );
        await adapter.save(record, 'board-backup').catch(() => {});
      }
    }
  } catch {
    storageAvailable = false;
    showStatus(
      'Storage is unavailable: changes will be lost when the page is closed.'
    );
  }

  const store = new Store(state ?? createInitialState());
  const manager = new CommandManager();

  if (storageAvailable) {
    const persistence = attachPersistence({
      store,
      adapter,
      onError: () =>
        showStatus(
          'Failed to save the lates t changes. The data may not have been saved'
        ),
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') persistence.flush();
    });
    window.addEventListener('pagehide', () => persistence.flush());
  }

  initApp({
    store,
    manager,
    boardEl: document.querySelector('#board'),
    undoBtn: document.querySelector('#undo-btn'),
    redoBtn: document.querySelector('#redo-btn'),
    editDialog: document.querySelector('#edit-card-dialog'),
  });
}

bootstrap();
