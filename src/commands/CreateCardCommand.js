import Command from '../core/Command.js';

export default class CreateCardCommand extends Command {
  constructor(store, columnId, card) {
    super();
    this.store = store;
    this.columnId = columnId;
    this.card = card;
  }

  execute() {
    const state = this.store.getState();
    const column = state.columns[this.columnId];

    // New Cards
    const newCards = {
      ...state.cards,
      [this.card.id]: this.card,
    };

    // New Column
    const newColumn = {
      ...column,
      cardIds: [...column.cardIds, this.card.id],
    };

    // Kumpulan Column yang lama dengan entry dengan Column dituju
    const newColumns = {
      ...state.columns,
      [this.columnId]: newColumn,
    };

    // Memperbarui state setelah terjadi perubahan pada Cards
    this.store.setState({
      ...state,
      cards: newCards,
      columns: newColumns,
    });
  }

  undo() {
    // Soal penamaan variable tolong bantu aku ya, karena aku susah dalam penamaan
    const state = this.store.getState();
    const column = state.columns[this.columnId];

    // Card
    const newCards = { ...state.cards }; //Membuat salinan Cards dari data yang lama
    delete newCards[this.card.id]; // Menghapus card sesuai dari card yang dituju melalui salinan dari Cards

    // Column
    const newColumn = {
      ...column,
      cardIds: column.cardIds.filter((id) => id !== this.card.id),
    };

    const newColumns = {
      ...state.columns,
      [this.columnId]: newColumn,
    };

    // Memperbarui State yang sudah berhasil di Undo
    this.store.setState({
      ...state,
      cards: newCards,
      columns: newColumns,
    });
  }
}
