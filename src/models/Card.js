export default class Card {
  constructor({
    id,
    title,
    description,
    columnId,
    createdAt = new Date().toISOString(),
    updatedAt = null,
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.columnId = columnId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
