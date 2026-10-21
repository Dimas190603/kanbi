import renderBoard from './views/BoardView.js';
import Card from './models/Card.js';
import CreateCardCommand from './commands/CreateCardCommand.js';

export default function initApp({ store, manager, boardEl, undoBtn, redoBtn }) {
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

  // Tambah card: satu listener delegasi di boardEl, karena form dibuat ulang tiap render
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
}
