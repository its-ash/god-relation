export interface GraphTheme {
  nodeFont: string
  edgeFont: string
  edgeDefault: string
  edgeHover: string
  nodeShadow: string
  selectedBorder: string
}

export const graphThemes: Record<'dark' | 'light', GraphTheme> = {
  dark: {
    nodeFont: '#e8e2f0',
    edgeFont: '#a89bc4',
    edgeDefault: 'rgba(232,226,240,0.28)',
    edgeHover: 'rgba(232,226,240,0.6)',
    nodeShadow: 'rgba(0,0,0,0.4)',
    selectedBorder: '#ffffff'
  },
  light: {
    nodeFont: '#2b2016',
    edgeFont: '#74695c',
    edgeDefault: 'rgba(43,30,20,0.22)',
    edgeHover: 'rgba(43,30,20,0.45)',
    nodeShadow: 'rgba(43,30,20,0.18)',
    selectedBorder: '#2b2016'
  }
}
