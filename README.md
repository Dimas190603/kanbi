# Kanbi
**Status:** work in progress. The live demo and screenshots are coming soon.

A Kanban board built with **vanilla JavaScript**: no framework and no state library. The reactive state engine, undo/redo, drag and drop, and offline persistence are all hand-written to show how these things work under the hood.

**Ringkasan (Bahasa Indonesia):** Kanbi adalah papan Kanban yang dibangun dengan JavaScript murni, tanpa framework dan tanpa library state management. Mesin state reaktif, undo/redo (Command pattern), drag and drop, dan penyimpanan offline (IndexedDB) ditulis sendiri untuk menunjukkan cara kerja di baliknya. Detail teknis ditulis dalam bahasa Inggris di bawah. Progres dan keputusan desain lengkap ada di [`docs/PROGRESS.md`](docs/PROGRESS.md).

**Live demo:** TODO (add the deployed link here)

<!-- TODO: add a screenshot or a short GIF showing: add card, drag and drop, undo -->

## Why this project exists

Most Kanban clones glue a drag-and-drop library onto a UI framework. Kanbi builds the interesting parts by hand instead: a small state store, a command system for undo/redo, drag and drop on the native browser API, and persistence on raw IndexedDB. The goal is to demonstrate engineering fundamentals (state management, design patterns, testing, accessibility), not knowledge of a particular library.

## Features

Implemented:

- Add, edit (in a modal dialog), delete, and move cards; reorder inside a column or move across columns
- Drag and drop with the mouse (native HTML5 API)
- Undo / redo for every card action (buttons, `Ctrl+Z` / `Ctrl+Y`)
- Offline persistence in IndexedDB: the board survives a refresh
- Graceful degradation: the app keeps working if storage is unavailable, and unrecognized saved data is backed up instead of overwritten

Planned (see [`docs/PROGRESS.md`](docs/PROGRESS.md)):

- Column management, WIP limits
- Keyboard-first interaction (select, move, drop without a mouse)
- Optimistic UI with rollback, command palette (`Ctrl+K`), activity log, search and filter
- Responsive layout and touch support

## Tech stack

- Vanilla JavaScript (ES modules), HTML, CSS
- [Vite](https://vite.dev) for the dev server and build
- [Vitest](https://vitest.dev) for unit tests (`fake-indexeddb` for the storage layer)
- ESLint and Prettier
- Native HTML5 Drag and Drop, raw IndexedDB API
- No UI framework and no state-management library

## Getting started

Requires a current Node.js LTS.

```bash
git clone https://github.com/Dimas190603/kanbi.git
cd kanbi
npm install

npm run dev        # development server
npm run build      # production build
npm run preview    # serve the production build locally
npm test           # tests in watch mode
npx vitest run     # run the tests once
npx eslint .       # lint
```

## Architecture

The app follows a Model-View-Presenter split with one-way data flow:

```
User action (click, key, drag)
        |
        v
Presenter (src/app.js)  -- builds a Command --> CommandManager --> command.execute()
                                                                        |
                                                                        v
                                                              Store.setState(newState)
                                                                        | notifies subscribers
                                                      +-----------------+------------------+
                                                      v                                    v
                                             BoardView re-renders           Persistence (debounced, IndexedDB)
```

- **Model**: plain data classes and a single `Store` holding the whole state.
- **View**: `BoardView` only draws the state; it knows nothing about commands.
- **Presenter** (`src/app.js`): turns DOM events into commands and decides what to do.
- **Commands**: every state change is an object with `execute()` and `undo()`.

### Project structure

```
src/
  core/          Store, Command, CommandManager, initialState, selectors, cardChanges
  commands/      CreateCardCommand, DeleteCardCommand, MoveCardCommand, EditCardCommand
  models/        Board, Card, Column
  views/         BoardView, dropIndex (drop position calculation)
  persistence/   IndexedDBAdapter, persistence (debounced sync), validateState
  app.js         Presenter: wires events, commands, and views
  main.js        Bootstrap: load saved state, create the store, start the app
tests/           Mirrors src/
docs/            PROGRESS.md: living checklist and design decision log
```

## Key design decisions

The full decision log is in [`docs/PROGRESS.md`](docs/PROGRESS.md). The ones that shaped the code the most:

- **Hand-rolled observer store.** `Store` holds the whole state. Every change goes through `setState`, which notifies subscribers, so data flows one way: state, view, action, state. It is the same idea behind Redux-style updates, small enough to read in one sitting.
- **Immutable updates.** State is never mutated; each change builds new objects. Changes are detectable by reference comparison, and undo/redo stays safe.
- **Normalized state.** Cards and columns are stored by id, and columns keep only an ordered list of card ids. Lookups are direct and moving a card never copies card data.
- **Command pattern.** Each user action is a command with `execute()` and `undo()`. Undo/redo was chosen on purpose as an engineering showcase; not every Kanban app has it.
- **Commands keep ids, not snapshots.** Commands re-read the latest state every time they run. An early version kept a column snapshot, which went stale after other commands ran and produced duplicated or lost cards. That bug now has regression tests.
- **Ids and timestamps exist before the command does.** Redo must reproduce exactly the same data, so nothing random is generated inside `execute()`.
- **The presenter skips no-op commands.** Running a command always pushes to the undo stack and clears the redo stack, so empty commands would corrupt the history.
- **Persistence is just a subscriber.** The store is saved 300 ms after the last change (debounced) and flushed when the tab is hidden. Undo history is deliberately not persisted: commands hold references to the store, and replaying old undo steps against changed data is unsafe.

## Testing

```bash
npx vitest run
```

Tests cover the store, the command manager, every command, the models, the drop-position math, and the storage layer. Behaviors that were once bugs have regression tests (for example, running several commands in a row). Test count: TODO (copy it from the `Tests` line of the output).

## Known limitations

- Drag and drop uses the native HTML5 API, which works poorly on touch screens. Pointer Events would be needed for full touch support.
- Two open tabs overwrite each other's saved state (the last write wins).
- The whole board re-renders on every change, so text being typed in an "add card" field is lost and keyboard focus returns to the page body after a render.
- Undo history is not kept after a refresh.

## Performance and accessibility

Lighthouse (mobile) on the deployed site: TODO

| Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|
| TODO | TODO | TODO | TODO |

## Roadmap

- [x] State store, command system, undo/redo
- [x] Card create, edit, delete, move, and drag and drop
- [x] Offline persistence
- [ ] Column management and WIP limits
- [ ] Keyboard-first interaction
- [ ] Optimistic UI, command palette, activity log, search and filter
- [ ] Responsive layout, deployment, CI

## Author

Dimas Ariandi: [github.com/Dimas190603](https://github.com/Dimas190603)

<!-- TODO: add contact or portfolio link -->

## License

TODO (choose a license, for example MIT, and add a LICENSE file)
