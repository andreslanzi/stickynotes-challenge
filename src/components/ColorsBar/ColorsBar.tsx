import { COLORS } from '../../constants'
import { useNotes } from '../../contexts/Notes/NotesContext'

function ColorsBar() {
  const { selectedColor, selectColor } = useNotes()

  const handleColorSelection = (color: string) => {
    selectColor(color)
  }

  return (
    <div className="relative z-50 mx-auto flex w-fit items-center gap-2.5 rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 shadow-lg ring-1 ring-black/5 backdrop-blur">
      {COLORS.map((color) => {
        const isSelected = color === selectedColor
        return (
          <button
            key={color}
            type="button"
            onClick={() => handleColorSelection(color)}
            className={`h-6 w-6 rounded-full ring-offset-white transition-transform hover:scale-110 cursor-pointer ${
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
