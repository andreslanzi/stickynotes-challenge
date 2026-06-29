import { useRef } from 'react'
import type { Note } from '../contexts/Notes/types'
import { useNotes } from '../contexts/Notes/NotesContext'
import { MIN_NOTE_SIZE } from '../constants'

type ResizeStart = {
  pointerX: number
  pointerY: number
  width: number
  height: number
}

export function useNoteResize(note: Note) {
  const { resizeNote } = useNotes()

  const startRef = useRef<ResizeStart | null>(null)

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) {
      return
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    startRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      width: note.width,
      height: note.height,
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const start = startRef.current
    if (!start) {
      return
    }
    const nextWidth = start.width + (e.clientX - start.pointerX)
    const nextHeight = start.height + (e.clientY - start.pointerY)

    // Clamp so the note can't grow past the board's right/bottom edges.
    // It grows from its top-left corner (note.coordinates).
    const board = e.currentTarget.parentElement?.offsetParent
    const maxWidth = board ? board.clientWidth - note.coordinates.x : Infinity
    const maxHeight = board ? board.clientHeight - note.coordinates.y : Infinity
    resizeNote(
      note.id,
      Math.max(MIN_NOTE_SIZE, Math.min(nextWidth, maxWidth)),
      Math.max(MIN_NOTE_SIZE, Math.min(nextHeight, maxHeight)),
    )
  }

  const onPointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    startRef.current = null
  }

  return { resizeProps: { onPointerDown, onPointerMove, onPointerUp } }
}
