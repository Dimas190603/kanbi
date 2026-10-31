import renderBoard from './views/BoardView.js';
import Card from './models/Card.js';
import CreateCardCommand from './commands/CreateCardCommand.js';
import DeleteCardCommand from './commands/DeleteCardCommand.js';
import MoveCardCommand from './commands/MoveCardCommand.js';

// Core
import { findColumnIdByCardId } from './core/selectors.js';
import { getDropIndex } from './core/dropIndex.js';

export default function initApp({ store, manager, boardEl, undoBtn, redoBtn }) {
  if (!store || !manager || !boardEl || !undoBtn || !redoBtn) {
    throw new Error(
      'initApp: butuh { store, manager, boardEl, undoBtn, redoBtn}. Periksa pemanggilan di main.js'
    );
  }

  const updateButtons = () => {
    undoBtn.disabled = !manager.canUndo();
    redoBtn.disabled = !manager.canRedo();
  };

  // Render awal + subscribe (dipasang sekali, di elemen yang tidak pernah dibuat ulang)
  renderBoard(store, boardEl);
  updateButtons();
  store.subscribe(() => renderBoard(store, boardEl));
  manager.subscribe(updateButtons);

  // Undo / Redo lewat tombol
  undoBtn.addEventListener('click', () => manager.undo());
  redoBtn.addEventListener('click', () => manager.redo());

  // Undo / Redo lewat keyboard
  document.addEventListener('keydown', (event) => {
    // Jangan membajak undo bawaan browser saat user sedang mengetik
    if (event.target.matches('input, textarea, [contenteditable="true"]'))
      return;
    if (!(event.ctrlKey || event.metaKey)) return;

    const key = event.key.toLowerCase();
    if (key === 'z' && !event.shiftKey) {
      event.preventDefault();
      manager.undo();
    } else if (key === 'y' || (key === 'z' && event.shiftKey)) {
      event.preventDefault();
      manager.redo();
    }
  });

  // Tambah card: satu listener delegasi di boardEl
  boardEl.addEventListener('submit', (event) => {
    const form = event.target.closest('.add-card-form');
    if (!form) return;
    event.preventDefault();

    const title = form.elements.title.value.trim();
    if (!title) return;

    const card = new Card({
      id: crypto.randomUUID(),
      title,
      description: '',
      columnId: form.dataset.columnId,
    });
    manager.execute(new CreateCardCommand(store, card));
  });

  // Event Hapus Card
  boardEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.delete-card-btn');
    if (!btn) return;

    const cardId = btn.dataset.cardId;
    const state = store.getState();
    const columnId = findColumnIdByCardId(state, cardId);
    if (!columnId) return;

    manager.execute(new DeleteCardCommand(store, columnId, cardId));
  });

  // =====> Drag & Drop (native HTML) <=====
  let draggedCardId = null;

  const resetDragState = () => {
    draggedCardId = null;
    boardEl
      .querySelectorAll('.dragging, .drop-target')
      .forEach((el) => el.classList.remove('dragging', 'drop-target'));
  };

  boardEl.addEventListener('dragstart', (e) => {
    const cardEl = e.target.closest?.('.card');
    if (!cardEl) return;

    draggedCardId = cardEl.dataset.cardId;
    e.dataTransfer.setData('text/plain', draggedCardId);
    e.dataTransfer.effectAllowed = 'move';
    cardEl.classList.add('dragging');
  });

  boardEl.addEventListener('dragover', (e) => {
    if (!draggedCardId) return;

    const columnEl = e.target.closest('.column');
    if (!columnEl) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (!columnEl.classList.contains('drop-target')) {
      boardEl
        .querySelectorAll('.drop-target')
        .forEach((e) => e.classList.remove('drop-target'));
      columnEl.classList.add('drop-target');
    }
  });

  boardEl.addEventListener('drop', (e) => {
    if (!draggedCardId) return;

    const columnEl = e.target.closest('.column');
    if (!columnEl) return;

    e.preventDefault();

    const cardId = draggedCardId;
    const toColumnId = columnEl.dataset.columnId;
    const toIndex = getDropIndex(columnEl, cardId, e.clientY);

    const state = store.getState();
    const fromColumnId = findColumnIdByCardId(state, cardId);

    resetDragState();

    if (!fromColumnId) return;

    const fromIndex = state.columns[fromColumnId].cardIds.indexOf(cardId);
    const isNoOp = fromColumnId === toColumnId && fromIndex === toIndex;
    if (isNoOp) return;

    manager.execute(
      new MoveCardCommand(store, cardId, fromColumnId, toColumnId, toIndex)
    );
  });

  boardEl.addEventListener('dragend', resetDragState);
}
