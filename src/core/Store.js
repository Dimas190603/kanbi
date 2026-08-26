/**
 * CLASS STORE
 * Sebagai blueprint untuk menyimpan data
 */

export default class Store {
  constructor(state) {
    this.state = state;
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  setState(newState) {
    this.state = newState;

    this.listeners.forEach((listener) => {
      listener();
    });
  }
}
