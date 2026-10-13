import Command from '../core/Command';

export default class DeleteCardCommand extends Command {
  constructor(store, columnId, cardId) {
    super();
    this.store = store;
    this.columnId = columnId;
    this.cardId = cardId;
    this.deletedCard = null;
    this.deletedIndex = -1;
  }

  execute() {
    const state = this.store.getState();
    const column = state.columns[this.columnId];

    this.deletedCard = state.cards[this.cardId];
    this.deletedIndex = column.cardIds.indexOf(this.cardId);

    const newCards = { ...state.cards };
    delete newCards[this.cardId];

    const newColumn = {
      ...column,
      cardIds: column.cardIds.filter((id) => id !== this.cardId),
    }; // <- pakai column

    const newColumns = {
      ...state.columns,
      [this.columnId]: newColumn,
    };

    this.store.setState({
      ...state,
      cards: newCards,
      columns: newColumns,
    });
  }

  undo() {
    const state = this.store.getState();
    const column = state.columns[this.columnId];

    const newCards = { ...state.cards, [this.cardId]: this.deletedCard };

    const newColumn = {
      ...column,
      cardIds: [
        ...column.cardIds.slice(0, this.deletedIndex),
        this.cardId,
        ...column.cardIds.slice(this.deletedIndex),
      ],
    };

    const newColumns = {
      ...state.columns,
      [this.columnId]: newColumn,
    };

    this.store.setState({
      ...state,
      cards: newCards,
      columns: newColumns,
    });
  }
}
