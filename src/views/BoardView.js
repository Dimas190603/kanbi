export function createCardElement(card) {
  const item = document.createElement('li');
  item.className = 'card';
  item.draggable = true;
  item.dataset.cardId = card.id;

  const title = document.createElement('h3');
  title.textContent = card.title;

  const description = document.createElement('p');
  description.textContent = card.description;

  const button = document.createElement('button');
  button.textContent = 'Hapus';
  button.type = 'button';
  button.className = 'delete-card-btn';
  button.setAttribute('aria-label', `Hapus card ${card.title}`);
  button.dataset.cardId = card.id;

  item.append(title, description, button);
  return item;
}

export function createColumnElement(column, cards) {
  const container = document.createElement('div');
  container.className = 'column';
  container.dataset.columnId = column.id;

  const title = document.createElement('h2');
  title.textContent = column.name;

  const list = document.createElement('ul');
  list.className = 'card-list';
  cards.forEach((card) => {
    const cardElement = createCardElement(card);
    list.appendChild(cardElement);
  });

  /**
   * Membuat form kecil di setiap kolom untuk menambahkan card baru
   */
  // Form
  const form = document.createElement('form');
  form.className = 'add-card-form';
  form.dataset.columnId = column.id;

  // Input Title
  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'title';
  input.placeholder = 'Title a new card...';
  input.setAttribute('aria-label', `Title a new card for ${column.name}`);

  // Button
  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = 'Add';

  form.append(input, button);
  container.append(title, form, list);
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
