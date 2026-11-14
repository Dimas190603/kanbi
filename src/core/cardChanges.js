/**
 * =====> Mengembalikan hanya field yang NILAINYA berbeda dari card saat ini <=====
 */
export function getCardChanges(card, { title, description }) {
  const changes = {};
  if (title !== card.title) changes.title = title;
  if ((card.description ?? '') !== description)
    changes.description = description;

  return changes;
}
