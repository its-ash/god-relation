import type { DeityCategory } from '~/types/graph'

export interface CategoryStyle {
  label: string
  color: string
  border: string
  size: number
}

export const categoryStyles: Record<DeityCategory, CategoryStyle> = {
  source: { label: 'Primordial Source', color: '#8b8bf5', border: '#c2c2ff', size: 26 },
  trimurti: { label: 'Trimurti', color: '#f5c542', border: '#ffe28a', size: 32 },
  devi: { label: 'Devi (Goddess)', color: '#f5568f', border: '#ff9dc0', size: 28 },
  deva: { label: 'Deva (God)', color: '#42c5f5', border: '#9fe4ff', size: 22 },
  avatar: { label: 'Avatar of Vishnu', color: '#3fe09b', border: '#9cf4ce', size: 26 },
  sage: { label: 'Sage / Rishi', color: '#e0b64f', border: '#f5d998', size: 18 },
  demigod: { label: 'Demigod', color: '#b384f5', border: '#dcc0ff', size: 20 },
  asura: { label: 'Asura', color: '#f5504f', border: '#ff9c9b', size: 20 },
  epic: { label: 'Epic Figure', color: '#5b8ff5', border: '#a9c4ff', size: 18 },
  realm: { label: 'Realm / Loka', color: '#b0b0b0', border: '#e8e8e8', size: 20 }
}
