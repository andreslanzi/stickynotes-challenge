import { useRef, useState } from 'react'
import { useNotes } from '../contexts/Notes/NotesContext'
import { MIN_NOTE_SIZE, DEFAULT_NOTE_SIZE } from '../constants'

export type DraftRectangle = {
  left: number
  top: number
  width: number
  height: number
}

// Pointer movement (px) below which the gesture counts as a click, not a drag.
const DRAG_THRESHOLD = 4

// Returns the handlers to spread onto the board plus the live draft rect.
export function useBoardGestures() {
  const { createNote } = useNotes()
  const [draft, setDraft] = useState<DraftRectangle | null>(null)

  const dragRef = useRef<{
    startX: number
    startY: number
    boardLeft: number
    boardTop: number
    boardWidth: number
    boardHeight: number
    moved: boolean
  } | null>(null)

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) {
      return
    }
    // Only start on the empty board, not when clicking an existing note.
    if (e.target !== e.currentTarget) {
      return
    }
    // Keep focus off the board so a new note's textarea can hold it.
    e.preventDefault()
    const board = e.currentTarget.getBoundingClientRect()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      startX: e.clientX - board.left,
      startY: e.clientY - board.top,
      boardLeft: board.left,
      boardTop: board.top,
      boardWidth: board.width,
      boardHeight: board.height,
      moved: false,
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag) {
      return
    }
    // Clamp the pointer to the board so the new note stays fully inside it.
    const currentX = Math.min(Math.max(0, e.clientX - drag.boardLeft), drag.boardWidth)
    const currentY = Math.min(Math.max(0, e.clientY - drag.boardTop), drag.boardHeight)
    const width = Math.abs(currentX - drag.startX)
    const height = Math.abs(currentY - drag.startY)

    // Ignore tiny drag so a click isn't mistaken for a drag.
    if (width < DRAG_THRESHOLD && height < DRAG_THRESHOLD) {
      return
    }

    // Anchor draft to the top-left corner of the box since drag can go any direction.
    drag.moved = true
    setDraft({
      left: Math.min(drag.startX, currentX),
      top: Math.min(drag.startY, currentY),
      width,
      height,
    })
  }

  const onPointerUp = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag) {
      return
    }
    e.currentTarget.releasePointerCapture(e.pointerId)

    if (drag.moved) {
      // Drag → create with the dragged size, clamping the pointer to the board
      // (same as the draft) so the note is never created outside it.
      const currentX = Math.min(
        Math.max(0, e.clientX - drag.boardLeft),
        drag.boardWidth,
      )
      const currentY = Math.min(
        Math.max(0, e.clientY - drag.boardTop),
        drag.boardHeight,
      )
      createNote(
        {
          x: Math.min(drag.startX, currentX),
          y: Math.min(drag.startY, currentY),
        },
        Math.max(MIN_NOTE_SIZE, Math.abs(currentX - drag.startX)),
        Math.max(MIN_NOTE_SIZE, Math.abs(currentY - drag.startY)),
      )
    } else {
      // Plain click → create with the default size at the clicked spot.
      createNote(
        { x: drag.startX, y: drag.startY },
        DEFAULT_NOTE_SIZE,
        DEFAULT_NOTE_SIZE,
      )
    }

    dragRef.current = null
    setDraft(null)
  }

  return {
    draft,
    boardProps: { onPointerDown, onPointerMove, onPointerUp },
  }
}
