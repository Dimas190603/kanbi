export function createCardElement(card) {
  const item = document.createElement('li');

  const title = document.createElement('h3');
  title.textContent = card.title;

  const description = document.createElement('p');
  description.textContent = card.description;

  item.append(title, description);
  return item;
}

export function createColumnElement(column, cards) {
  const container = document.createElement('div');

  const title = document.createElement('h2');
  title.textContent = column.name;

  const list = document.createElement('ul');
  cards.forEach((card) => {
    const cardElement = createCardElement(card);
    list.appendChild(cardElement);
  });

  container.append(title, list);
  return container;
}

export default function renderBoard(store, rootElement) {
  const state = store.getState();

  rootElement.innerHTML = ' ';

  state.columnOrder.forEach((columnId) => {
    const column = state.columns[columnId];
    const cardInColumn = column.cardIds.map((cardId) => state.cards[cardId]);

    const columnEl = createColumnElement(column, cardInColumn);
    rootElement.appendChild(columnEl);
  });
}
