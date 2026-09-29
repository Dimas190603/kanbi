import Command from '../core/Command';

export default class DeleteCardCommand extends Command {
  constructor(store, column, cardId) {
    super();
    this.store = store;
    this.column = column;
    this.cardId = cardId;
    this.deletedCard = null;
  }

  execute() {
    const state = this.store.getState();

    this.deletedCard = state.cards[this.cardId];

    // Delete Card
    const currentCards = { ...state.cards };
    delete currentCards[this.cardId];

    // Detele key cardIds yang ada didalam Object column
    const currentCardIds = this.column.cardIds.filter(
      (id) => id !== this.cardId
    );
    const currentColumn = {
      ...this.column,
      cardIds: currentCardIds,
    };

    const currentColumns = {
      ...state.columns,
      [this.column.id]: currentColumn,
    };

    this.store.setState({
      ...state,
      cards: currentCards,
      columns: currentColumns,
    });
  }

  undo() {
    const state = this.store.getState();

    const currentCards = {
      ...state.cards,
      [this.cardId]: this.deletedCard,
    };

    const currentCardIds = [...this.column.cardIds, this.cardId];
    const currentColumn = {
      ...this.column,
      cardIds: currentCardIds,
    };

    const currentColumns = {
      ...state.columns,
      [this.column.id]: currentColumn,
    };

    this.store.setState({
      ...state,
      cards: currentCards,
      columns: currentColumns,
    });
  }
}
