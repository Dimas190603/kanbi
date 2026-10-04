import Command from '../core/Command.js';

export default class MoveCardCommand extends Command {
  constructor(store, cardId, sourceColumn, destinationColumn) {
    super();
    this.store = store;
    this.cardId = cardId;
    this.sourceColumn = sourceColumn;
    this.destinationColumn = destinationColumn;
  }

  execute() {
    this.#moveCard(this.sourceColumn, this.destinationColumn);
  }

  undo() {
    this.#moveCard(this.destinationColumn, this.sourceColumn);
  }

  #moveCard(from, to) {
    const state = this.store.getState();
    const freshFrom = state.columns[from.id];
    const freshTo = state.columns[to.id];

    const newFromCardIds = freshFrom.cardIds.filter((id) => id !== this.cardId);
    const newFromColumn = { ...freshFrom, cardIds: newFromCardIds };

    const newToCardIds = [...freshTo.cardIds, this.cardId];
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
