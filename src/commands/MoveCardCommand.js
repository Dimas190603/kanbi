import Command from '../core/Command.js';

export default class MoveCardCommand extends Command {
  constructor(store, cardId, sourceColumnId, destinationColumnId, toIndex) {
    super();
    this.store = store;
    this.cardId = cardId;
    this.sourceColumnId = sourceColumnId;
    this.destinationColumnId = destinationColumnId;
    this.toIndex = toIndex;
    this.sourceIndex = -1;
  }

  execute() {
    const state = this.store.getState();
    this.sourceIndex = state.columns[this.sourceColumnId].cardIds.indexOf(
      this.cardId
    );
    if (this.sourceIndex === -1) {
      throw new Error(
        `MoveCardCommand: card "${this.cardId}" tidak ada dikolom "${this.sourceColumnId}"`
      );
    }

    this.#move(this.sourceColumnId, this.destinationColumnId, this.toIndex);
  }

  undo() {
    this.#move(this.destinationColumnId, this.sourceColumnId, this.sourceIndex);
  }

  #move(fromId, toId, insertIndex) {
    const state = this.store.getState();
    const fromCol = state.columns[fromId];
    const toCol = state.columns[toId];

    const withoutCard = fromCol.cardIds.filter((id) => id !== this.cardId);

    // Kolom yang sama: Menyisipkan ke daftar yang card-nya sudah dikeluarkan
    const targetIds = fromId === toId ? withoutCard : toCol.cardIds;
    const index = Math.max(
      0,
      Math.min(insertIndex ?? targetIds.length, targetIds.length)
    );

    const newToIds = [
      ...targetIds.slice(0, index),
      this.cardId,
      ...targetIds.slice(index),
    ];

    const columns = {
      ...state.columns,
      [fromId]: { ...fromCol, cardIds: withoutCard },
    };
    // Untuk kolom yang sama, ini menimpa dengan hasil akhir
    columns[toId] = { ...toCol, cardIds: newToIds };

    const cards = {
      ...state.cards,
      [this.cardId]: { ...state.cards[this.cardId], columnId: toId },
    };

    this.store.setState({ ...state, columns, cards });
  }
}
