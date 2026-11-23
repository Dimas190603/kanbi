const isPlainObject = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function isValidState(state) {
  if (!isPlainObject(state)) return false;

  const { board, cards, columns, columnOrder } = state;
  if (
    !isPlainObject(board) ||
    !isPlainObject(cards) ||
    !isPlainObject(columns) ||
    !Array.isArray(columnOrder)
  ) {
    return false;
  }

  return columnOrder.every((columnId) => {
    const column = columns[columnId];
    return (
      isPlainObject(column) &&
      Array.isArray(column.cardIds) &&
      column.cardIds.every((cardId) => isPlainObject(cards[cardId]))
    );
  });
}
