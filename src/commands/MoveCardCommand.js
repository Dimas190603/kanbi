import Command from '../core/Command.js';

export default class MoveCardCommand extends Command {
  constructor(store, cardId, sourceColumnId, destinationColumnId) {
    super();
    this.store = store;
    this.cardId = cardId;
    this.sourceColumnId = sourceColumnId;
    this.destinationColumnId = destinationColumnId;
    this.sourceIndex = -1;
  }

  execute() {
    const state = this.store.getState();

    this.sourceIndex = state.columns[this.sourceColumnId].cardIds.indexOf(
      this.cardId
    );
    this.#moveCard(this.sourceColumnId, this.destinationColumnId);
  }

  undo() {
    this.#moveCard(
      this.destinationColumnId,
      this.sourceColumnId,
      this.sourceIndex
    );
  }

  #moveCard(fromId, toId, insertIndex = null) {
    const state = this.store.getState();
    const from = state.columns[fromId];
    const to = state.columns[toId];

    const newFromColumn = {
      ...from,
      cardIds: from.cardIds.filter((id) => id !== this.cardId),
    };

    const index = insertIndex ?? to.cardIds.length;
    const newToColumn = {
      ...to,
      cardIds: [
        ...to.cardIds.slice(0, index),
        this.cardId,
        ...to.cardIds.slice(index),
      ],
    };

    const newCard = { ...state.cards[this.cardId], columnId: toId };

    this.store.setState({
      ...state,
      cards: { ...state.cards, [this.cardId]: newCard },
      columns: {
        ...state.columns,
        [fromId]: newFromColumn,
        [toId]: newToColumn,
      },
    });
  }
}
