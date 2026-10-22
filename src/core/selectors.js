export function findColumnIdByCardId(state, cardId) {
  return Object.keys(state.columns).find((columnId) =>
    state.columns[columnId].cardIds.includes(cardId)
  );
}
