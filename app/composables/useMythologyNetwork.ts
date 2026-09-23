import { DataSet } from 'vis-data'
import { Network } from 'vis-network'
import type { Options, Node as VisNode, Edge as VisEdge } from 'vis-network'
import { mythologyGraph } from '~/data/mythology'
import { categoryStyles } from '~/data/categoryStyles'
import type { DeityNode, DeityEdge } from '~/types/graph'
import type { GraphTheme } from '~/data/graphThemes'
import { graphThemes } from '~/data/graphThemes'

const MOTHER_COLOR = '#e0559b' // pink
const FATHER_COLOR = '#e0c23f' // yellow

// Female parent nodes whose `parent_of` edges don't already say "mother of" in the label
// (e.g. Adishakti's emanation edges) but are nonetheless the maternal/feminine source.
const FEMALE_PARENT_IDS = new Set(['adishakti'])

function parentEdgeColor(e: DeityEdge, nodesById: Map<string, DeityNode>): string | undefined {
  if (e.type !== 'parent_of') return undefined
  const label = e.label.toLowerCase()
  if (label.includes('mother')) return MOTHER_COLOR
  if (label.includes('father')) return FATHER_COLOR
  const parent = nodesById.get(e.from)
  if (parent?.category === 'devi' || FEMALE_PARENT_IDS.has(e.from)) return MOTHER_COLOR
  return FATHER_COLOR
}

const DIM_ALPHA = 0.08

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function colorToRgba(color: string, alpha: number): string {
  if (color.startsWith('#')) return hexToRgba(color, alpha)
  const rgbaMatch = color.match(/rgba?\(([^)]+)\)/)
  if (rgbaMatch) {
    const parts = rgbaMatch[1].split(',').map(p => p.trim())
    return `rgba(${parts[0]},${parts[1]},${parts[2]},${alpha})`
  }
  return color
}

function toVisNode(n: DeityNode, theme: GraphTheme): VisNode {
  const style = categoryStyles[n.category]
  return {
    id: n.id,
    label: n.name,
    shape: 'circle',
    font: { color: theme.nodeFont, size: 13, face: 'Inter, sans-serif', strokeWidth: 0, multi: false },
    borderWidth: 2,
    color: { background: style.color, border: style.border, highlight: { background: style.border, border: theme.selectedBorder }, hover: { background: style.border, border: theme.selectedBorder } },
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    group: n.category
  }
}

function toVisEdge(e: DeityEdge, nodesById: Map<string, DeityNode>, theme: GraphTheme): VisEdge {
  const parentColor = parentEdgeColor(e, nodesById)
  return {
    id: e.id,
    from: e.from,
    to: e.to,
    label: e.label,
    arrows: { to: { enabled: true, scaleFactor: 0.5 } },
    color: { color: parentColor ?? theme.edgeDefault, highlight: '#f2b544', hover: parentColor ?? theme.edgeHover },
    font: { color: theme.edgeFont, size: 10, strokeWidth: 0, align: 'top' },
    smooth: { enabled: true, type: 'continuous', roundness: 0.4 },
    width: parentColor ? 1.5 : 1
  }
}

function buildOptions(theme: GraphTheme): Options {
  return {
    physics: {
      enabled: true,
      solver: 'forceAtlas2Based',
      forceAtlas2Based: { gravitationalConstant: -110, centralGravity: 0.006, springLength: 180, springConstant: 0.14, damping: 0.4, avoidOverlap: 0.9 },
      stabilization: { enabled: true, iterations: 200, fit: true }
    },
    interaction: { hover: true, tooltipDelay: 150, hideEdgesOnDrag: true, hideEdgesOnZoom: false, navigationButtons: false, keyboard: { enabled: true } },
    edges: { smooth: { enabled: true, type: 'continuous', roundness: 0.4 } },
    nodes: { shadow: { enabled: true, color: theme.nodeShadow, size: 8, x: 0, y: 2 } },
    layout: { improvedLayout: true }
  }
}

export function useMythologyNetwork() {
  const container = shallowRef<HTMLElement | null>(null)
  const network = shallowRef<Network | null>(null)
  const nodesDataSet = shallowRef<DataSet<VisNode> | null>(null)
  const edgesDataSet = shallowRef<DataSet<VisEdge> | null>(null)
  const selectedNodeId = ref<string | null>(null)
  const stabilizing = ref(true)

  const allNodes = mythologyGraph.nodes
  const allEdges = mythologyGraph.edges

  function nodeById(id: string): DeityNode | undefined {
    return allNodes.find(n => n.id === id)
  }

  function edgesForNode(id: string): DeityEdge[] {
    return allEdges.filter(e => e.from === id || e.to === id)
  }

  const nodesById = new Map(allNodes.map(n => [n.id, n]))
  let activeTheme: GraphTheme = graphThemes.dark

  const HIGHLIGHT_DEPTH = 2

  function connectionsWithinDepth(id: string, depth: number): { nodeIds: Set<string>, edgeIds: Set<string> } {
    const nodeIds = new Set<string>([id])
    const edgeIds = new Set<string>()
    let frontier = new Set<string>([id])

    for (let level = 0; level < depth; level++) {
      const nextFrontier = new Set<string>()
      for (const e of allEdges) {
        const fromIn = frontier.has(e.from)
        const toIn = frontier.has(e.to)
        if (!fromIn && !toIn) continue
        edgeIds.add(e.id)
        if (!nodeIds.has(e.from)) nextFrontier.add(e.from)
        if (!nodeIds.has(e.to)) nextFrontier.add(e.to)
        nodeIds.add(e.from)
        nodeIds.add(e.to)
      }
      if (nextFrontier.size === 0) break
      frontier = nextFrontier
    }

    return { nodeIds, edgeIds }
  }

  function highlightNode(id: string) {
    if (!nodesDataSet.value || !edgesDataSet.value) return
    const { nodeIds: related, edgeIds: relatedEdgeIds } = connectionsWithinDepth(id, HIGHLIGHT_DEPTH)

    const nodeUpdates = allNodes.map((n) => {
      const inFocus = related.has(n.id)
      const vis = toVisNode(n, activeTheme)
      if (inFocus) return vis
      const style = categoryStyles[n.category]
      return {
        ...vis,
        color: { background: colorToRgba(style.color, DIM_ALPHA), border: colorToRgba(style.border, DIM_ALPHA) },
        font: { ...vis.font, color: colorToRgba(activeTheme.nodeFont, DIM_ALPHA * 3) }
      }
    })
    nodesDataSet.value.update(nodeUpdates)

    const edgeUpdates = allEdges.map((e) => {
      const inFocus = relatedEdgeIds.has(e.id)
      const vis = toVisEdge(e, nodesById, activeTheme)
      if (inFocus) return vis
      const baseColor = typeof vis.color === 'object' && vis.color && 'color' in vis.color ? (vis.color as { color?: string }).color : undefined
      return {
        ...vis,
        color: { color: colorToRgba(baseColor ?? activeTheme.edgeDefault, DIM_ALPHA) },
        font: { ...vis.font, color: colorToRgba(activeTheme.edgeFont, DIM_ALPHA * 3) }
      }
    })
    edgesDataSet.value.update(edgeUpdates)

    network.value?.selectNodes(Array.from(related))
  }

  function clearHighlight() {
    if (!nodesDataSet.value || !edgesDataSet.value) return
    nodesDataSet.value.update(allNodes.map(n => toVisNode(n, activeTheme)))
    edgesDataSet.value.update(allEdges.map(e => toVisEdge(e, nodesById, activeTheme)))
    network.value?.unselectAll()
  }

  function init(el: HTMLElement, theme: GraphTheme = graphThemes.dark) {
    container.value = el
    activeTheme = theme
    nodesDataSet.value = new DataSet(allNodes.map(n => toVisNode(n, theme)))
    edgesDataSet.value = new DataSet(allEdges.map(e => toVisEdge(e, nodesById, theme)))

    const net = new Network(el, { nodes: nodesDataSet.value, edges: edgesDataSet.value }, buildOptions(theme))
    network.value = net

    net.once('stabilizationIterationsDone', () => { stabilizing.value = false })
    net.on('click', (params) => {
      if (params.nodes.length > 0) {
        const id = String(params.nodes[0])
        selectedNodeId.value = id
        highlightNode(id)
      } else {
        selectedNodeId.value = null
        clearHighlight()
      }
    })

    return net
  }

  function focusNode(id: string) {
    if (!network.value) return
    selectedNodeId.value = id
    network.value.focus(id, { scale: 1.1, animation: { duration: 500, easingFunction: 'easeInOutQuad' } })
    highlightNode(id)
  }

  function resetView() {
    if (!network.value) return
    network.value.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } })
    selectedNodeId.value = null
    clearHighlight()
  }

  const ZOOM_STEP = 1.25
  const ZOOM_MIN = 0.05
  const ZOOM_MAX = 4

  function zoomBy(factor: number) {
    if (!network.value) return
    const current = network.value.getScale()
    const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, current * factor))
    network.value.moveTo({ scale: next, animation: { duration: 200, easingFunction: 'easeInOutQuad' } })
  }

  function zoomIn() {
    zoomBy(ZOOM_STEP)
  }

  function zoomOut() {
    zoomBy(1 / ZOOM_STEP)
  }

  function filterByCategories(activeCategories: Set<string>) {
    if (!nodesDataSet.value) return
    const updates = allNodes.map(n => ({ id: n.id, hidden: !activeCategories.has(n.category) }))
    nodesDataSet.value.update(updates)
  }

  function searchHighlight(query: string): DeityNode[] {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return allNodes.filter(n =>
      n.name.toLowerCase().includes(q) ||
      n.sanskrit?.includes(q) ||
      n.epithet?.toLowerCase().includes(q) ||
      n.summary.toLowerCase().includes(q)
    ).slice(0, 8)
  }

  function setTheme(theme: GraphTheme) {
    if (!nodesDataSet.value || !edgesDataSet.value) return
    activeTheme = theme
    network.value?.setOptions(buildOptions(theme))
    if (selectedNodeId.value) {
      highlightNode(selectedNodeId.value)
    } else {
      clearHighlight()
    }
  }

  function destroy() {
    network.value?.destroy()
    network.value = null
  }

  return {
    network,
    selectedNodeId,
    stabilizing,
    allNodes,
    allEdges,
    init,
    destroy,
    focusNode,
    resetView,
    zoomIn,
    zoomOut,
    filterByCategories,
    searchHighlight,
    setTheme,
    nodeById,
    edgesForNode
  }
}
