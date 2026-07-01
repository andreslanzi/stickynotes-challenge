import Note from '../Note'
import { useNotes } from '../../contexts/Notes/NotesContext'
import { useBoardGestures } from '../../hooks/useBoardGestures'
import ColorsBar from '../ColorsBar'

function Board() {
  const { notes, selectedColor, boardRef } = useNotes()
  const { draft, boardProps } = useBoardGestures()

  return (
    <div
      ref={boardRef}
      // Not in the normal tab order (-1); it's a landmark other code can
      // send focus to programmatically, e.g. after a focused note is deleted.
      tabIndex={-1}
      aria-label="Notes board"
      className="relative flex-1 overflow-hidden py-8 outline-none"
      style={{
        background: 'linear-gradient(to right, #E9E4F0, #D3CCE3)',
      }}
      {...boardProps}
    >
      <ColorsBar />
      {notes.length > 0 ? (
        notes.map((note) => <Note key={note.id} note={note} />)
      ) : (
        <h2 className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center font-chewy text-3xl tracking-wider text-slate-700">
          Click & drag anywhere in the board to create your first note ...
        </h2>
      )}

      {draft && (
        <div
          className="pointer-events-none absolute rounded-sm border-2 border-dashed"
          style={{
            left: draft.left,
            top: draft.top,
            width: draft.width,
            height: draft.height,
            borderColor: selectedColor,
            backgroundColor: `${selectedColor}66`,
          }}
        />
      )}
    </div>
  )
}

export default Board
