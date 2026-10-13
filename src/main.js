// import './style.css';
// import javascriptLogo from './assets/javascript.svg';
// import viteLogo from './assets/vite.svg';
// import heroImg from './assets/hero.png';
import Board from './models/board.js';
import Card from './models/Card.js';
import Column from './models/Column.js';
import Store from './core/Store.js';
import CommandManager from './core/CommandManager.js';
import CreateCardCommand from './commands/CreateCardCommand.js';
import DeleteCardCommand from './commands/DeleteCardCommand.js';

import renderBoard from './views/BoardView.js';
import MoveCardCommand from './commands/MoveCardCommand.js';

// document.querySelector('#app').innerHTML = `
// <section id="center">
//   <div class="hero">
//     <img src="${heroImg}" class="base" width="170" height="179">
//     <img src="${javascriptLogo}" class="framework" alt="JavaScript logo"/>
//     <img src="${viteLogo}" class="vite" alt="Vite logo" />
//   </div>
//   <div>
//     <h1>Get started</h1>
//     <p>Edit <code>src/main.js</code> and save to test <code>HMR</code></p>
//   </div>
//   <button id="counter" type="button" class="counter"></button>
// </section>

// <div class="ticks"></div>

// <section id="next-steps">
//   <div id="docs">
//     <svg class="icon" role="presentation" aria-hidden="true"><use href="/icons.svg#documentation-icon"></use></svg>
//     <h2>Documentation</h2>
//     <p>Your questions, answered</p>
//     <ul>
//       <li>
//         <a href="https://vite.dev/" target="_blank">
//           <img class="logo" src="${viteLogo}" alt="" />
//           Explore Vite
//         </a>
//       </li>
//       <li>
//         <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
//           <img class="button-icon" src="${javascriptLogo}" alt="">
//           Learn more
//         </a>
//       </li>
//     </ul>
//   </div>
//   <div id="social">
//     <svg class="icon" role="presentation" aria-hidden="true"><use href="/icons.svg#social-icon"></use></svg>
//     <h2>Connect with us</h2>
//     <p>Join the Vite community</p>
//     <ul>
//       <li><a href="https://github.com/vitejs/vite" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#github-icon"></use></svg>GitHub</a></li>
//       <li><a href="https://chat.vite.dev/" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#discord-icon"></use></svg>Discord</a></li>
//       <li><a href="https://x.com/vite_js" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#x-icon"></use></svg>X.com</a></li>
//       <li><a href="https://bsky.app/profile/vite.dev" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#bluesky-icon"></use></svg>Bluesky</a></li>
//     </ul>
//   </div>
// </section>

// <div class="ticks"></div>
// <section id="spacer"></section>
// `;

// DOM
const boardEl = document.querySelector('#board');

// Card
const card = new Card({
  id: 'card-1',
  title: 'Managing State',
  description: 'Bab 1 Reacting to Input with State',
  columnId: 'col-1',
});

// Column
const column = new Column({
  id: 'col-1',
  name: 'Belajar React',
  cardIds: ['card-1'],
});

const inProgresColumn = new Column({
  id: 'col-2',
  name: 'In Progress',
  cardIds: [],
});

// Board
const board = new Board({
  id: 'board-1',
  name: 'Aktifitas Harian',
});

const state = {
  board,
  cards: {
    [card.id]: card,
  },
  columns: {
    [column.id]: column,
    [inProgresColumn.id]: inProgresColumn,
  },
  columnOrder: ['col-1', 'col-2'],
};

// Store data
const store = new Store(state);
console.log(store);

// Board element
renderBoard(store, boardEl);
store.subscribe(() => renderBoard(store, boardEl));

// New Command Manager
const manager = new CommandManager();
// Bikin Card baru untuk tes Command "membuat Card baru"
const newCard = new Card({
  id: 'card-2',
  title: 'Membuat Perintah Untuk Membuat Card Baru',
  description:
    'Mencoba menjalankan perintah membuat card baru, berhasil atau tidak',
  columnId: 'col-1',
});

manager.execute(new CreateCardCommand(store, 'col-1', newCard));
manager.execute(new DeleteCardCommand(store, 'col-1', 'card-2'));
manager.execute(new MoveCardCommand(store, 'card-1', 'col-1', 'col-2'));
