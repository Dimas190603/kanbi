import Command from '../core/Command.js';

export default class CreateCardCommand extends Command {
  constructor(store, column, card) {
    super();
    this.store = store;
    this.column = column;
    this.card = card;
  }

  execute() {
    const state = this.store.getState();

    // New Cards
    const newCards = {
      ...state.cards,
      [this.card.id]: this.card,
    };

    // New Column
    const newCardIds = [...this.column.cardIds, this.card.id];
    const newColumn = {
      ...this.column,
      cardIds: newCardIds,
    };

    // Kumpulan Column yang lama dengan entry dengan Column dituju
    const newColumns = {
      ...state.columns,
      [this.column.id]: newColumn,
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

    // Card
    const cardId = this.card.id; // Mengambil Id card yang dituju
    const newCards = { ...state.cards }; //Membuat salinan Cards dari data yang lama
    delete newCards[cardId]; // Menghapus card sesuai dari card yang dituju melalui salinan dari Cards

    // Column
    const newCardIds = this.column.cardIds.filter((id) => id !== cardId);

    const newColumn = {
      ...this.column,
      cardIds: newCardIds,
    };

    const newColumns = {
      ...state.columns,
      [this.column.id]: newColumn,
    };

    // Memperbarui State yang sudah berhasil di Undo
    this.store.setState({
      ...state,
      cards: newCards,
      columns: newColumns,
    });
  }
}
