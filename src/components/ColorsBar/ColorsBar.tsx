import { COLORS, COLOR_NAMES } from '../../constants'
import { useNotes } from '../../contexts/Notes/NotesContext'

function ColorsBar() {
  const { selectedColor, selectColor } = useNotes()

  const handleColorSelection = (color: string) => {
    selectColor(color)
  }

  return (
    // Notes are re-ranked to 1..N (see rankByZIndex in NotesProvider), so any
    // value comfortably above a realistic note count keeps this above them all.
    <div className="relative z-[1000] mx-auto flex w-fit items-center gap-2.5 rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 shadow-lg ring-1 ring-black/5 backdrop-blur">
      {COLORS.map((color) => {
        const isSelected = color === selectedColor
        return (
          <button
            key={color}
            type="button"
            onClick={() => handleColorSelection(color)}
            aria-label={`Select ${COLOR_NAMES[color]} note color`}
            aria-pressed={isSelected}
            className={`h-6 w-6 rounded-full ring-offset-white transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 cursor-pointer ${
              isSelected ? 'scale-110 ring-2 ring-slate-700' : ''
            }`}
            style={{ backgroundColor: color }}
          />
        )
      })}
    </div>
  )
}

export default ColorsBar
