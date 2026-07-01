import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Note } from './types'
import { NotesContext } from './NotesContext'
import { COLORS } from '../../constants'

const STORAGE_KEY = 'sticky-notes'
// Wait for changes to settle before writing, so rapid drag/resize updates
// collapse into a single write instead of one per pointermove.
const PERSIST_DEBOUNCE_MS = 400

// Re-rank every note's zIndex to a dense 1..N range, ordered by their current
// stacking order. This keeps the max zIndex bounded by the note count instead
// of growing forever with every click, which would eventually climb above
// fixed-position UI chrome like the ColorsBar.
function rankByZIndex(notes: Note[], bringToFrontId?: string): Note[] {
  const sorted = [...notes].sort((a, b) => a.zIndex - b.zIndex)
  if (bringToFrontId) {
    const i = sorted.findIndex((note) => note.id === bringToFrontId)
    if (i !== -1) {
      sorted.push(sorted.splice(i, 1)[0])
    }
  }
  return sorted.map((note, index) => ({ ...note, zIndex: index + 1 }))
}

// Read the persisted notes, falling back to an empty board if storage is
// unavailable or holds corrupt data. Also re-ranks z-index on load, so notes
// saved before the bounded-ranking fix existed (or with any stale/out-of-
// range value) get normalized immediately instead of keeping a z-index that
// could sit above fixed UI chrome like the ColorsBar.
function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const notes = raw ? (JSON.parse(raw) as Note[]) : []
    return rankByZIndex(notes)
  } catch {
    return []
  }
}

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(loadNotes)
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0])
  const boardRef = useRef<HTMLDivElement>(null)

  // Persist after changes settle (debounced) so a drag/resize writes once when
  // movement stops, not on every pointermove.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
      } catch {
        // Ignore (e.g. storage disabled or quota exceeded).
      }
    }, PERSIST_DEBOUNCE_MS)
    return () => clearTimeout(timeoutId)
  }, [notes])

  const createNote = (
    coordinates: { x: number; y: number },
    width: number,
    height: number,
  ) => {
    setNotes((prev) => {
      const newNote: Note = {
        id: crypto.randomUUID(),
        text: '',
        coordinates,
        zIndex: 0, // placeholder; rankByZIndex assigns the real value below
        width,
        height,
        color: selectedColor,
      }
      return rankByZIndex([...prev, newNote], newNote.id)
    })
  }

  const updateNoteText = (id: string, text: string) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, text } : note)),
    )
  }

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }

  const resizeNote = (id: string, width: number, height: number) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, width, height } : note)),
    )
  }

  const moveNote = (id: string, x: number, y: number) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, coordinates: { x, y } } : note,
      ),
    )
  }

  const bringToFront = (id: string) => {
    setNotes((prev) => {
      const maxZ = Math.max(0, ...prev.map((note) => note.zIndex))
      const target = prev.find((note) => note.id === id)
      // No-op if it's already the front-most note, so dragging/clicking it
      // repeatedly doesn't keep triggering re-renders for nothing.
      if (!target || target.zIndex === maxZ) {
        return prev
      }
      return rankByZIndex(prev, id)
    })
  }

  return (
    <NotesContext.Provider
      value={{
        notes,
        selectedColor,
        selectColor: setSelectedColor,
        createNote,
        updateNoteText,
        deleteNote,
        resizeNote,
        moveNote,
        bringToFront,
        boardRef,
      }}
    >
      {children}
    </NotesContext.Provider>
  )
}
