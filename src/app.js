import renderBoard from './views/BoardView';

export default function initApp(store, manager, boardEl, undoBtn, redoBtn) {
  const updateButtons = () => {
    undoBtn.disabled = !manager.canUndo();
    redoBtn.disabled = !manager.canRedo();
  };

  renderBoard(store, boardEl);
  updateButtons();
  store.subscribe(() => renderBoard(store, boardEl));
  manager.subscribe(updateButtons);

  undoBtn.addEventListener('click', () => manager.undo());
  redoBtn.addEventListener('click', () => manager.redo());

  document.addEventListener('keydown', (event) => {
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
}
