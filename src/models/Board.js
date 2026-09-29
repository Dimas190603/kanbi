export default class Board {
  constructor({ id, name, createdAt = new Date().toISOString() }) {
    this.id = id;
    this.name = name;
    this.createdAt = createdAt;
  }
}
