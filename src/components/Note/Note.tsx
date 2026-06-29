import { useEffect, useRef } from 'react'
import type { Note as NoteType } from '../../contexts/Notes/types'
import { useNotes } from '../../contexts/Notes/NotesContext'
import { useNoteResize } from '../../hooks/useNoteResize'
import { useNoteDrag } from '../../hooks/useNoteDrag'

type NoteProps = {
  note: NoteType
}

function Note({ note }: NoteProps) {
  const { id, text, coordinates, zIndex, width, height, color } = note
  const { updateNoteText, deleteNote, bringToFront } = useNotes()
  const { resizeProps } = useNoteResize(note)
  const { dragProps } = useNoteDrag(note)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus the textarea when the note mounts (i.e. right after it is created).
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  return (
    <div
      onPointerDown={() => bringToFront(id)}
      className="absolute flex flex-col overflow-hidden rounded-sm font-medium text-slate-800 shadow-lg shadow-black/10 ring-1 ring-black/5 transition-shadow hover:shadow-xl"
      style={{
        left: coordinates.x,
        top: coordinates.y,
        width,
        height,
        zIndex,
        backgroundColor: color,
      }}
    >
      <header
        {...dragProps}
        aria-label="Move note"
        className="flex cursor-move items-center justify-between gap-2 bg-black/5 px-2 py-1 select-none"
      >
        <span
          aria-hidden
          className="text-[12px] tracking-[2px] text-black font-bold"
        >
          ⋮⋮
        </span>
        <button
          type="button"
          // Don't start a move when the delete button is pressed.
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => deleteNote(id)}
          aria-label="Delete note"
          className="flex h-5 w-5 items-center justify-center rounded text-xs leading-none text-slate-600/70 hover:bg-black/10 hover:text-red-600"
        >
          X
        </button>
      </header>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => updateNoteText(id, e.target.value)}
        onFocus={() => bringToFront(id)}
        placeholder="Empty note..."
        className="note-scrollbar min-h-0 w-full flex-1 resize-none bg-transparent px-3 pt-2 pb-3 text-sm leading-snug outline-none placeholder:text-slate-500/60 placeholder:italic"
      />
      <div
        {...resizeProps}
        aria-label="Resize note"
        className="absolute right-0 bottom-0 h-4 w-4 cursor-se-resize bg-black/20 hover:bg-black/30"
        style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
      />
    </div>
  )
}

export default Note
