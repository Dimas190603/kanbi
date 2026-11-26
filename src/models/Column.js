export default class Column {
  constructor({ id, name, cardIds = [], wipLimit = null }) {
    this.id = id;
    this.name = name;
    this.cardIds = cardIds;
    this.wipLimit = wipLimit;
  }
}
