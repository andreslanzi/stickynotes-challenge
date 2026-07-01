import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRef } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotesContext, type NotesContextValue } from '../../contexts/Notes/NotesContext'
import type { Note as NoteType } from '../../contexts/Notes/types'
import Note from './Note'

const baseNote: NoteType = {
  id: 'note-1',
  text: 'Hello',
  coordinates: { x: 10, y: 20 },
  zIndex: 1,
  width: 200,
  height: 150,
  color: '#FFC9C9',
}

function renderNote(overrides: Partial<NotesContextValue> = {}) {
  const contextValue: NotesContextValue = {
    notes: [baseNote],
    selectedColor: '#FFC9C9',
    selectColor: vi.fn(),
    createNote: vi.fn(),
    updateNoteText: vi.fn(),
    deleteNote: vi.fn(),
    resizeNote: vi.fn(),
    moveNote: vi.fn(),
    bringToFront: vi.fn(),
    boardRef: createRef<HTMLDivElement>(),
    ...overrides,
  }

  render(
    <NotesContext.Provider value={contextValue}>
      <Note note={baseNote} />
    </NotesContext.Provider>,
  )

  return contextValue
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('Note', () => {
  it('renders the note text', () => {
    renderNote()
    expect(screen.getByDisplayValue('Hello')).toBeInTheDocument()
  })

  it('calls updateNoteText with the note id when the text changes', async () => {
    const user = userEvent.setup()
    const ctx = renderNote()

    await user.type(screen.getByDisplayValue('Hello'), '!')

    expect(ctx.updateNoteText).toHaveBeenCalledWith('note-1', 'Hello!')
  })

  it('calls deleteNote with the note id when the delete button is clicked', async () => {
    const user = userEvent.setup()
    const ctx = renderNote()

    await user.click(screen.getByRole('button', { name: 'Delete note' }))

    expect(ctx.deleteNote).toHaveBeenCalledWith('note-1')
  })

  it('does not start a drag (bringToFront) when the delete button is pressed', () => {
    const ctx = renderNote()
    // The note auto-focuses its textarea on mount, which already triggers
    // one bringToFront call via onFocus - clear that before asserting.
    vi.mocked(ctx.bringToFront).mockClear()

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Delete note' }), {
      button: 0,
    })

    expect(ctx.bringToFront).not.toHaveBeenCalled()
  })

  it('calls bringToFront when the note body is pressed', () => {
    const ctx = renderNote()
    vi.mocked(ctx.bringToFront).mockClear()

    fireEvent.pointerDown(screen.getByDisplayValue('Hello'), { button: 0 })

    expect(ctx.bringToFront).toHaveBeenCalledWith('note-1')
  })
})
