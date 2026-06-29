import { useRef } from 'react'
import type { Note } from '../contexts/Notes/types'
import { useNotes } from '../contexts/Notes/NotesContext'

// Pointer position and note coordinates captured when a move gesture starts.
type MoveStart = {
  pointerX: number
  pointerY: number
  originX: number
  originY: number
}

export function useNoteDrag(note: Note) {
  const { moveNote } = useNotes()

  const startRef = useRef<MoveStart | null>(null)

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) {
      return
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    startRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      originX: note.coordinates.x,
      originY: note.coordinates.y,
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const start = startRef.current
    if (!start) {
      return
    }
    const nextX = start.originX + (e.clientX - start.pointerX)
    const nextY = start.originY + (e.clientY - start.pointerY)

    // The note is absolutely positioned inside the board (its offsetParent), so clamp it to the board's bounds on every edge.
    const board = e.currentTarget.parentElement?.offsetParent
    const maxX = board ? board.clientWidth - note.width : Infinity
    const maxY = board ? board.clientHeight - note.height : Infinity
    const clampedX = Math.min(Math.max(0, nextX), Math.max(0, maxX))
    const clampedY = Math.min(Math.max(0, nextY), Math.max(0, maxY))
    moveNote(note.id, clampedX, clampedY)
  }

  const onPointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    startRef.current = null
  }

  return { dragProps: { onPointerDown, onPointerMove, onPointerUp } }
}
