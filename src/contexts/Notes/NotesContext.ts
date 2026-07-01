import { createContext, useContext, type RefObject } from 'react'
import type { Note } from './types'

export type NotesContextValue = {
  notes: Note[]
  selectedColor: string
  selectColor: (color: string) => void
  createNote: (
    coordinates: { x: number; y: number },
    width: number,
    height: number,
  ) => void
  updateNoteText: (id: string, text: string) => void
  deleteNote: (id: string) => void
  resizeNote: (id: string, width: number, height: number) => void
  moveNote: (id: string, x: number, y: number) => void
  bringToFront: (id: string) => void
  // Focusable landmark (see Board's root) so keyboard/screen-reader focus has
  // somewhere stable to land on, e.g. after the focused note is deleted.
  boardRef: RefObject<HTMLDivElement | null>
}

export const NotesContext = createContext<NotesContextValue | null>(null)

export function useNotes() {
  const ctx = useContext(NotesContext)
  if (!ctx) {
    throw new Error('useNotes must be used within a NotesProvider')
  }
  return ctx
}
