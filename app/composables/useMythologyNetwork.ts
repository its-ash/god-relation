import { DataSet } from 'vis-data'
import { Network } from 'vis-network'
import type { Options, Node as VisNode, Edge as VisEdge } from 'vis-network'
import { mythologyGraph } from '~/data/mythology'
import { categoryStyles } from '~/data/categoryStyles'
import type { DeityNode, DeityEdge } from '~/types/graph'
import type { GraphTheme } from '~/data/graphThemes'
import { graphTheme } from '~/data/graphThemes'
import { MOTHER_COLOR, FATHER_COLOR, SISTER_COLOR, BROTHER_COLOR, WIFE_COLOR } from '~/data/relationLineStyles'

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

const FALLBACK_EDGE_COLOR = '#8a8a8a'

function siblingEdgeColor(e: DeityEdge): string | undefined {
  if (e.type !== 'sibling_of') return undefined
  const label = e.label.toLowerCase()
  if (label.includes('sister')) return SISTER_COLOR
  if (label.includes('brother')) return BROTHER_COLOR
  return FALLBACK_EDGE_COLOR
}

function edgeColor(e: DeityEdge, nodesById: Map<string, DeityNode>): string {
  if (e.type === 'consort_of') return WIFE_COLOR
  return parentEdgeColor(e, nodesById) ?? siblingEdgeColor(e) ?? FALLBACK_EDGE_COLOR
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
    label: n.sanskrit ?? n.name,
    shape: 'circle',
    font: { color: '#0a0a0a', size: 22, face: '300 Geist, Noto Sans Devanagari, sans-serif', strokeWidth: 0, multi: false },
    borderWidth: 2,
    color: { background: style.color, border: style.border, highlight: { background: style.border, border: theme.selectedBorder }, hover: { background: style.border, border: theme.selectedBorder } },
    margin: { top: 14, right: 14, bottom: 14, left: 14 },
    group: n.category
  }
}

function toVisEdge(e: DeityEdge, nodesById: Map<string, DeityNode>, theme: GraphTheme): VisEdge {
  const color = edgeColor(e, nodesById)
  return {
    id: e.id,
    from: e.from,
    to: e.to,
    label: e.label,
    arrows: { to: { enabled: true, scaleFactor: 0.5 } },
    color: { color, highlight: '#f2b544', hover: color },
    font: { color: theme.edgeFont, size: 10, strokeWidth: 0, align: 'top' },
    smooth: { enabled: true, type: 'continuous', roundness: 0.4 },
    width: 1.5
  }
}

function buildOptions(theme: GraphTheme): Options {
  return {
    physics: {
      enabled: true,
      solver: 'forceAtlas2Based',
      forceAtlas2Based: { gravitationalConstant: -220, centralGravity: 0.008, springLength: 260, springConstant: 0.1, damping: 0.65, avoidOverlap: 1 },
      stabilization: { enabled: true, iterations: 400, fit: true },
      adaptiveTimestep: true
    },
    interaction: { hover: true, tooltipDelay: 150, hideEdgesOnDrag: true, hideEdgesOnZoom: false, navigationButtons: false, keyboard: { enabled: true } },
    edges: { smooth: { enabled: true, type: 'continuous', roundness: 0.4 } },
    nodes: { shadow: { enabled: true, color: theme.nodeShadow, size: 8, x: 0, y: 2 } },
    layout: { improvedLayout: true, randomSeed: 42 }
  }
}

export function useMythologyNetwork() {
  const container = shallowRef<HTMLElement | null>(null)
  const network = shallowRef<Network | null>(null)
  const nodesDataSet = shallowRef<DataSet<VisNode> | null>(null)
  const edgesDataSet = shallowRef<DataSet<VisEdge> | null>(null)
  const selectedNodeId = ref<string | null>(null)
  const stabilizing = ref(true)

  const allEdges = mythologyGraph.edges

  // Nodes with no edges at all (e.g. avatar forms and cosmogony figures whose only
  // links were consort_of/avatar_of/etc. relations trimmed from this graph) are hidden —
  // they'd render as disconnected dots with nothing to show on click.
  const connectedIds = new Set<string>()
  for (const e of allEdges) {
    connectedIds.add(e.from)
    connectedIds.add(e.to)
  }
  const allNodes = mythologyGraph.nodes.filter(n => connectedIds.has(n.id))

  function nodeById(id: string): DeityNode | undefined {
    return allNodes.find(n => n.id === id)
  }

  function edgesForNode(id: string): DeityEdge[] {
    return allEdges.filter(e => e.from === id || e.to === id)
  }

  const nodesById = new Map(allNodes.map(n => [n.id, n]))
  const activeTheme: GraphTheme = graphTheme

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

  function init(el: HTMLElement) {
    container.value = el
    nodesDataSet.value = new DataSet(allNodes.map(n => toVisNode(n, activeTheme)))
    edgesDataSet.value = new DataSet(allEdges.map(e => toVisEdge(e, nodesById, activeTheme)))

    const net = new Network(el, { nodes: nodesDataSet.value, edges: edgesDataSet.value }, buildOptions(activeTheme))
    network.value = net

    net.once('stabilizationIterationsDone', () => {
      stabilizing.value = false
      net.setOptions({ physics: { enabled: false } })
    })
    // Re-enable physics only while a node is actively being dragged, so
    // rearranging still feels alive without the whole graph drifting/rotating at rest.
    net.on('dragStart', (params) => {
      if (params.nodes.length > 0) net.setOptions({ physics: { enabled: true } })
    })
    net.on('dragEnd', (params) => {
      if (params.nodes.length > 0) net.setOptions({ physics: { enabled: false } })
    })
    net.on('click', (params) => {
      if (params.nodes.length > 0) {
        focusNode(String(params.nodes[0]))
      } else {
        selectedNodeId.value = null
        clearHighlight()
      }
    })

    return net
  }

  const FOCUS_PADDING = 0.92 // fraction of the viewport half-extent left as breathing room
  const FOCUS_MIN_SCALE = 0.15
  const FOCUS_MAX_SCALE = 3.5

  function focusNode(id: string) {
    if (!network.value || !container.value) return
    selectedNodeId.value = id
    highlightNode(id)

    const { nodeIds: related } = connectionsWithinDepth(id, HIGHLIGHT_DEPTH)
    const positions = network.value.getPositions(Array.from(related))
    const center = positions[id]
    if (!center) return

    const { clientWidth, clientHeight } = container.value
    let maxDx = 0
    let maxDy = 0
    for (const otherId of related) {
      if (otherId === id) continue
      const pos = positions[otherId]
      if (!pos) continue
      maxDx = Math.max(maxDx, Math.abs(pos.x - center.x))
      maxDy = Math.max(maxDy, Math.abs(pos.y - center.y))
    }
    const scaleX = maxDx > 0 ? (clientWidth / 2) * FOCUS_PADDING / maxDx : FOCUS_MAX_SCALE
    const scaleY = maxDy > 0 ? (clientHeight / 2) * FOCUS_PADDING / maxDy : FOCUS_MAX_SCALE
    const scale = Math.min(FOCUS_MAX_SCALE, Math.max(FOCUS_MIN_SCALE, Math.min(scaleX, scaleY)))

    network.value.moveTo({
      position: center,
      scale,
      animation: { duration: 500, easingFunction: 'easeInOutQuad' }
    })
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
    nodeById,
    edgesForNode
  }
}
