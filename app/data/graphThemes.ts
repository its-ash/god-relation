export interface GraphTheme {
  nodeFont: string
  edgeFont: string
  edgeDefault: string
  edgeHover: string
  nodeShadow: string
  selectedBorder: string
}

export const graphTheme: GraphTheme = {
  nodeFont: '#e5e5e5',
  edgeFont: '#8a8a8a',
  edgeDefault: 'rgba(229,229,229,0.22)',
  edgeHover: 'rgba(229,229,229,0.5)',
  nodeShadow: 'rgba(0,0,0,0.5)',
  selectedBorder: '#f2b544'
}
