import renderBoard from './views/BoardView.js';
import Card from './models/Card.js';

// -----> Commands <-----
import CreateCardCommand from './commands/CreateCardCommand.js';
import DeleteCardCommand from './commands/DeleteCardCommand.js';
import MoveCardCommand from './commands/MoveCardCommand.js';
import EditCardCommand from './commands/EditCardCommand.js';

// -----> Core <-----
import { findColumnIdByCardId } from './core/selectors.js';
import { getDropIndex } from './core/dropIndex.js';
import { getCardChanges } from './core/cardChanges.js';

export default function initApp({
  store,
  manager,
  boardEl,
  undoBtn,
  redoBtn,
  editDialog,
}) {
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
    if (editDialog.open) return;
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

  // =====> Command Add Card <=====
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

  // =====> Command Delete Card <=====
  boardEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.delete-card-btn');
    if (!btn) return;

    const cardId = btn.dataset.cardId;
    const state = store.getState();
    const columnId = findColumnIdByCardId(state, cardId);
    if (!columnId) return;

    manager.execute(new DeleteCardCommand(store, columnId, cardId));
  });

  // =====> Command Edit Card <=====
  const editForm = editDialog.querySelector('form');
  const titleInput = editForm.elements.title;
  const descriptionInput = editForm.elements.description;
  const cancelBtn = editDialog.querySelector('#edit-card-cancel');
  let editingCardId = null;

  boardEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.edit-card-btn');
    if (!btn) return;

    const card = store.getState().cards[btn.dataset.cardId];
    if (!card) return;

    editingCardId = card.id;
    titleInput.value = card.title;
    descriptionInput.value = card.description ?? '';
    editDialog.showModal();
  });
  // --- Edit Save Button ---
  editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const card = store.getState().cards[editingCardId];
    if (!card) {
      editDialog.close();
      return;
    }

    const title = titleInput.value.trim();
    if (!title) {
      titleInput.focus();
      return;
    }

    const changes = getCardChanges(card, {
      title,
      description: descriptionInput.value.trim(),
    });

    editDialog.close();
    if (Object.keys(changes).length === 0) return;

    manager.execute(new EditCardCommand(store, card.id, changes));
  });
  // --- Edit Cancelled Button ---
  cancelBtn.addEventListener('click', () => editDialog.close());

  editDialog.addEventListener('close', () => {
    editingCardId = null;
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
