export default class CommandManager {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
    this.listeners = new Set();
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  subscribe(listener) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  #notify() {
    this.listeners.forEach((listener) => listener());
  }

  execute(command) {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];
    this.#notify();
  }

  undo() {
    if (!this.canUndo()) return;
    const command = this.undoStack.pop();
    command.undo();
    this.redoStack.push(command);
    this.#notify();
  }

  redo() {
    if (!this.canRedo()) return;
    const command = this.redoStack.pop();
    command.execute();
    this.undoStack.push(command);
    this.#notify();
  }
}
