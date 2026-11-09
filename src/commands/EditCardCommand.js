import Command from '../core/Command';

const EDITABLE_FIELDS = ['title', 'description'];

export default class EditCardCommand extends Command {
  constructor(store, cardId, changes, updatedAt = new Date().toISOString()) {
    super();
    this.store = store;
    this.cardId = cardId;
    this.changes = Object.fromEntries(
      Object.entries(changes).filter(([key]) => EDITABLE_FIELDS.includes(key))
    );
    this.updatedAt = updatedAt;

    this.oldValues = {};
    this.oldUpdateAt = null;
  }

  execute() {
    const state = this.store.getState();
    const currentCard = state.cards[this.cardId];

    if (!currentCard) {
      throw new Error(`EditCardCommand: card ${this.cardId} tidak ditemukan`);
    }

    this.oldUpdateAt = {};
    Object.keys(this.changes).forEach((key) => {
      this.oldValues[key] = currentCard[key];
    });
    this.oldUpdateAt = currentCard.updatedAt;

    const updatedCard = {
      ...currentCard,
      ...this.changes,
      updatedAt: this.updatedAt,
    };

    this.store.setState({
      ...state,
      cards: { ...state.cards, [this.cardId]: updatedCard },
    });
  }

  undo() {
    const state = this.store.getState();
    const currentCard = state.cards[this.cardId];

    if (!currentCard) {
      throw new Error(`EditCardCommand: card ${this.cardId} tidak ditemukan!`);
    }

    const restoredCard = {
      ...currentCard,
      ...this.oldValues,
      updatedAt: this.oldUpdateAt,
    };

    this.store.setState({
      ...state,
      cards: { ...state.cards, [this.cardId]: restoredCard },
    });
  }
}
