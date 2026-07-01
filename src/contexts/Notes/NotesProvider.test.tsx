import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { NotesProvider } from './NotesProvider'
import { useNotes } from './NotesContext'

const wrapper = ({ children }: { children: ReactNode }) => (
  <NotesProvider>{children}</NotesProvider>
)

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('NotesProvider', () => {
  it('starts with an empty board', () => {
    const { result } = renderHook(() => useNotes(), { wrapper })
    expect(result.current.notes).toEqual([])
  })

  it('createNote adds a note with the selected color and the next z-index', () => {
    const { result } = renderHook(() => useNotes(), { wrapper })

    act(() => {
      result.current.createNote({ x: 10, y: 20 }, 200, 150)
    })

    expect(result.current.notes).toHaveLength(1)
    const note = result.current.notes[0]
    expect(note.coordinates).toEqual({ x: 10, y: 20 })
    expect(note.width).toBe(200)
    expect(note.height).toBe(150)
    expect(note.text).toBe('')
    expect(note.color).toBe(result.current.selectedColor)
    expect(note.zIndex).toBe(1)
  })

  it('deleteNote removes only the targeted note', () => {
    const { result } = renderHook(() => useNotes(), { wrapper })
    act(() => {
      result.current.createNote({ x: 0, y: 0 }, 100, 100)
      result.current.createNote({ x: 50, y: 50 }, 100, 100)
    })
    const [first, second] = result.current.notes

    act(() => {
      result.current.deleteNote(first.id)
    })

    expect(result.current.notes).toHaveLength(1)
    expect(result.current.notes[0].id).toBe(second.id)
  })

  it('updateNoteText only changes the targeted note', () => {
    const { result } = renderHook(() => useNotes(), { wrapper })
    act(() => {
      result.current.createNote({ x: 0, y: 0 }, 100, 100)
      result.current.createNote({ x: 50, y: 50 }, 100, 100)
    })
    const [first, second] = result.current.notes

    act(() => {
      result.current.updateNoteText(first.id, 'hello world')
    })

    expect(result.current.notes.find((n) => n.id === first.id)?.text).toBe(
      'hello world',
    )
    expect(result.current.notes.find((n) => n.id === second.id)?.text).toBe(
      '',
    )
  })

  it('moveNote updates only the coordinates of the targeted note', () => {
    const { result } = renderHook(() => useNotes(), { wrapper })
    act(() => {
      result.current.createNote({ x: 0, y: 0 }, 100, 100)
    })
    const id = result.current.notes[0].id

    act(() => {
      result.current.moveNote(id, 300, 400)
    })

    expect(result.current.notes[0].coordinates).toEqual({ x: 300, y: 400 })
  })

  it('resizeNote updates only the size of the targeted note', () => {
    const { result } = renderHook(() => useNotes(), { wrapper })
    act(() => {
      result.current.createNote({ x: 0, y: 0 }, 100, 100)
    })
    const id = result.current.notes[0].id

    act(() => {
      result.current.resizeNote(id, 250, 260)
    })

    expect(result.current.notes[0]).toMatchObject({ width: 250, height: 260 })
  })

  it('bringToFront is a no-op when the note is already on top', () => {
    const { result } = renderHook(() => useNotes(), { wrapper })
    act(() => {
      result.current.createNote({ x: 0, y: 0 }, 100, 100)
      result.current.createNote({ x: 0, y: 0 }, 100, 100)
    })
    const notesBefore = result.current.notes
    const topId = notesBefore[notesBefore.length - 1].id

    act(() => {
      result.current.bringToFront(topId)
    })

    // Same array reference back out means the provider bailed out early.
    expect(result.current.notes).toBe(notesBefore)
  })

  it('keeps z-index bounded by note count no matter how many times bringToFront runs', () => {
    const { result } = renderHook(() => useNotes(), { wrapper })
    act(() => {
      result.current.createNote({ x: 0, y: 0 }, 100, 100)
      result.current.createNote({ x: 0, y: 0 }, 100, 100)
      result.current.createNote({ x: 0, y: 0 }, 100, 100)
    })

    // Simulate 50 clicks alternating between notes, like a user repeatedly
    // interacting with a handful of notes over a long session. Before the
    // z-index re-ranking fix, this would grow past any fixed UI z-index
    // (e.g. the ColorsBar) even with only 3 notes on the board.
    for (let i = 0; i < 50; i++) {
      const id = result.current.notes[i % result.current.notes.length].id
      act(() => {
        result.current.bringToFront(id)
      })
    }

    const zIndexes = result.current.notes.map((n) => n.zIndex)
    expect(Math.max(...zIndexes)).toBeLessThanOrEqual(result.current.notes.length)
    expect(new Set(zIndexes).size).toBe(result.current.notes.length)
  })

  it('debounces persistence so a rapid drag writes to localStorage once, after it settles', () => {
    vi.useFakeTimers()
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

    const { result } = renderHook(() => useNotes(), { wrapper })
    act(() => {
      result.current.createNote({ x: 0, y: 0 }, 100, 100)
    })
    const id = result.current.notes[0].id
    setItemSpy.mockClear()

    // Simulate a fast drag: many moveNote calls in quick succession, like
    // one per pointermove.
    for (let i = 0; i < 30; i++) {
      act(() => {
        result.current.moveNote(id, i, i)
      })
    }

    // The debounce window hasn't elapsed yet, so nothing was written.
    expect(setItemSpy).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(setItemSpy).toHaveBeenCalledTimes(1)
  })

  it('restores notes already saved in localStorage on load', () => {
    const seeded = [
      {
        id: 'seed-1',
        text: 'from storage',
        coordinates: { x: 1, y: 2 },
        zIndex: 1,
        width: 100,
        height: 100,
        color: '#FFC9C9',
      },
    ]
    localStorage.setItem('sticky-notes', JSON.stringify(seeded))

    const { result } = renderHook(() => useNotes(), { wrapper })

    expect(result.current.notes).toEqual(seeded)
  })
})
