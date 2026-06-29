# Sticky Notes

A desktop web app for creating draggable, resizable sticky notes on an infinite-feel board. Notes are created with a click or by dragging to set their size, can be edited, moved, resized, recolored, brought to front, and deleted — and they persist across refreshes via `localStorage`.

Built with React 19, TypeScript, Vite, and Tailwind CSS v4.

## Features

- **Create** a note by clicking the board (default size) or **click-and-drag** to draw it at a custom size, with a live preview rectangle.
- **Edit** the text inline; the textarea auto-focuses on creation.
- **Move** a note by dragging its header (clamped to the board edges).
- **Resize** from the bottom-right corner handle (down to a minimum size).
- **Color** picker toolbar — new notes use the selected color.
- **Bring to front** automatically on click, focus, or edit.
- **Delete** from the note's header button.
- **Persistence** — notes are saved to `localStorage` and restored on reload.

## Tech stack

- **React 19** + **TypeScript** on **Vite 8**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **ESLint 10** (flat config) + **Prettier**

## Prerequisites

- **Node.js 20.19+ or 22.12+** (required by Vite 8) — check with `node --version`
- **npm** (bundled with Node)

## Getting started

```bash
# 1. Clone the repository
git clone https://github.com/andreslanzi/stickynotes-challenge
cd react-app

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open the URL printed in the terminal (by default <http://localhost:5173>).

## Available scripts

| Command           | What it does                                     |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Start the Vite dev server with HMR               |
| `npm run build`   | Type-check and build for production into `dist/` |
| `npm run preview` | Serve the production build locally               |
| `npm run lint`    | Run ESLint over the project                      |
| `npm run format`  | Format the codebase with Prettier                |

## Project structure

```
src/
├── components/        # Board, Note, ColorsBar (each in its own folder)
├── contexts/Notes/    # NotesProvider + context (shared notes state & actions)
├── hooks/             # Pointer-gesture hooks (create, drag, resize)
├── constants.ts       # Note sizes and color palette
└── main.tsx           # App entry (fonts, providers, render)
```

The architecture separates concerns: **context** holds the shared state and mutations, **hooks** encapsulate the pointer-gesture logic, and **components** handle rendering.

## System requirements

- **Desktop** browser, minimum screen resolution **1024×768**.
- Latest versions of **Google Chrome** (Windows/macOS), **Mozilla Firefox** (all platforms), and **Microsoft Edge**.
