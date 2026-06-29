import { useEffect, useState, type ReactNode } from 'react'
import type { Note } from './types'
import { NotesContext } from './NotesContext'
import { COLORS } from '../../constants'

const STORAGE_KEY = 'sticky-notes'
// Wait for changes to settle before writing, so rapid drag/resize updates
// collapse into a single write instead of one per pointermove.
const PERSIST_DEBOUNCE_MS = 400

// Read the persisted notes, falling back to an empty board if storage is unavailable or holds corrupt data.
function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Note[]) : []
  } catch {
    return []
  }
}

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(loadNotes)
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0])

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
      const maxZ = Math.max(0, ...prev.map((note) => note.zIndex))
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          text: '',
          coordinates,
          zIndex: maxZ + 1,
          width,
          height,
          color: selectedColor,
        },
      ]
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
      if (!target || target.zIndex === maxZ) {
        return prev
      }
      return prev.map((note) =>
        note.id === id ? { ...note, zIndex: maxZ + 1 } : note,
      )
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
      }}
    >
      {children}
    </NotesContext.Provider>
  )
}
