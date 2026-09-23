import type { DeityCategory } from '~/types/graph'

export interface CategoryStyle {
  label: string
  color: string
  border: string
  size: number
}

export const categoryStyles: Record<DeityCategory, CategoryStyle> = {
  source: { label: 'Primordial Source', color: '#3d2c6b', border: '#8b6fd8', size: 26 },
  trimurti: { label: 'Trimurti', color: '#b8862f', border: '#f2b544', size: 32 },
  devi: { label: 'Devi (Goddess)', color: '#a3275f', border: '#ec5f96', size: 28 },
  deva: { label: 'Deva (God)', color: '#1f6f8b', border: '#4fc3e0', size: 22 },
  avatar: { label: 'Avatar of Vishnu', color: '#1c6b4a', border: '#3fd08a', size: 26 },
  sage: { label: 'Sage / Rishi', color: '#6b5327', border: '#c9a153', size: 18 },
  demigod: { label: 'Demigod', color: '#7a4a9e', border: '#c48ce8', size: 20 },
  asura: { label: 'Asura', color: '#7a1f1f', border: '#e05353', size: 20 },
  epic: { label: 'Epic Figure', color: '#2b4a7a', border: '#6f9fe0', size: 18 },
  realm: { label: 'Realm / Loka', color: '#3a3a3a', border: '#9a9a9a', size: 20 }
}
