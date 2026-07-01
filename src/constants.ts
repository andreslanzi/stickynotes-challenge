export const DEFAULT_NOTE_SIZE = 192
export const MIN_NOTE_SIZE = 96
export const COLORS = [
  '#FFC9C9',
  '#FFE3A3',
  '#C3F0CA',
  '#BFE3FF',
  '#E0C9FF',
] as const

// Human-readable names for each color, used for accessible labels.
export const COLOR_NAMES: Record<(typeof COLORS)[number], string> = {
  '#FFC9C9': 'red',
  '#FFE3A3': 'yellow',
  '#C3F0CA': 'green',
  '#BFE3FF': 'blue',
  '#E0C9FF': 'purple',
}
