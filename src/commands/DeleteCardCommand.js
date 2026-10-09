import Command from '../core/Command';

export default class DeleteCardCommand extends Command {
  constructor(store, column, cardId) {
    super();
    this.store = store;
    this.column = column;
    this.cardId = cardId;
    this.deletedCard = null;
    this.deletedCardIndex = -1;
  }

  execute() {
    const state = this.store.getState();
    const freshColumn = state.columns[this.column.id]; // <- BARU, ambil fresh

    this.deletedCard = state.cards[this.cardId];
    this.deletedCardIndex = freshColumn.cardIds.indexOf(this.cardId);

    const currentCards = { ...state.cards };
    delete currentCards[this.cardId];

    const currentCardIds = freshColumn.cardIds.filter(
      (id) => id !== this.cardId
    ); // <- pakai freshColumn
    const currentColumn = { ...freshColumn, cardIds: currentCardIds }; // <- pakai freshColumn

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
    const freshColumn = state.columns[this.column.id];

    const currentCards = { ...state.cards, [this.cardId]: this.deletedCard };

    const currentCardIds = [
      ...freshColumn.cardIds.slice(0, this.deletedCardIndex),
      this.cardId,
      ...freshColumn.cardIds.slice(this.deletedCardIndex),
    ];
    const currentColumn = { ...freshColumn, cardIds: currentCardIds };

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
