import Command from '../core/Command.js';

export default class MoveCardCommand extends Command {
  constructor(store, cardId, sourceColumn, destinationColumn) {
    super();
    this.store = store;
    this.cardId = cardId;
    this.sourceColumn = sourceColumn;
    this.destinationColumn = destinationColumn;
    this.sourceIndex = -1;
  }

  execute() {
    const state = this.store.getState();
    this.sourceIndex = state.columns[this.sourceColumn.id].cardIds.indexOf(
      this.cardId
    );
    this.#moveCard(this.sourceColumn, this.destinationColumn);
  }

  undo() {
    this.#moveCard(this.destinationColumn, this.sourceColumn, this.sourceIndex);
  }

  #moveCard(from, to, insertIndex = null) {
    const state = this.store.getState();
    const freshFrom = state.columns[from.id];
    const freshTo = state.columns[to.id];

    const newFromCardIds = freshFrom.cardIds.filter((id) => id !== this.cardId);
    const newFromColumn = { ...freshFrom, cardIds: newFromCardIds };

    const index = insertIndex ?? freshTo.cardIds.length;
    const newToCardIds = [
      ...freshTo.cardIds.slice(0, index),
      this.cardId,
      ...freshTo.cardIds.slice(index),
    ];
    const newToColumn = { ...freshTo, cardIds: newToCardIds };

    const originalCard = state.cards[this.cardId];
    const newCard = { ...originalCard, columnId: to.id };

    const newCards = { ...state.cards, [this.cardId]: newCard };
    const newColumns = {
      ...state.columns,
      [from.id]: newFromColumn,
      [to.id]: newToColumn,
    };

    this.store.setState({ ...state, cards: newCards, columns: newColumns });
  }
}
