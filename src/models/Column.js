export default class Column {
  constructor({ id, name, cardIds = [], wipLimit }) {
    this.id = id;
    this.name = name;
    this.cardIds = cardIds;
    this.wipLimit = wipLimit;
  }
}
