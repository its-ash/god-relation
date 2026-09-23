import { DataSet } from 'vis-data'
import { Network } from 'vis-network'
import type { Options, Node as VisNode, Edge as VisEdge } from 'vis-network'
import { mythologyGraph } from '~/data/mythology'
import { categoryStyles } from '~/data/categoryStyles'
import type { DeityNode, DeityEdge } from '~/types/graph'

const FONT_COLOR = '#e8e2f0'

function toVisNode(n: DeityNode): VisNode {
  const style = categoryStyles[n.category]
  return {
    id: n.id,
    label: n.name,
    shape: 'dot',
    size: style.size,
    color: { background: style.color, border: style.border, highlight: { background: style.border, border: '#ffffff' }, hover: { background: style.border, border: '#ffffff' } },
    font: { color: FONT_COLOR, size: 14, face: 'Inter, sans-serif', strokeWidth: 0 },
    borderWidth: 2,
    group: n.category
  }
}

function toVisEdge(e: DeityEdge): VisEdge {
  return {
    id: e.id,
    from: e.from,
    to: e.to,
    label: e.label,
    arrows: { to: { enabled: true, scaleFactor: 0.5 } },
    color: { color: 'rgba(232,226,240,0.28)', highlight: '#f2b544', hover: 'rgba(232,226,240,0.6)' },
    font: { color: '#a89bc4', size: 10, strokeWidth: 0, align: 'top' },
    smooth: { enabled: true, type: 'continuous', roundness: 0.4 },
    width: 1
  }
}

const baseOptions: Options = {
  physics: {
    enabled: true,
    solver: 'forceAtlas2Based',
    forceAtlas2Based: { gravitationalConstant: -70, centralGravity: 0.008, springLength: 140, springConstant: 0.16, damping: 0.4, avoidOverlap: 0.6 },
    stabilization: { enabled: true, iterations: 200, fit: true }
  },
  interaction: { hover: true, tooltipDelay: 150, hideEdgesOnDrag: true, hideEdgesOnZoom: false, navigationButtons: false, keyboard: { enabled: true } },
  edges: { smooth: { enabled: true, type: 'continuous', roundness: 0.4 } },
  nodes: { shadow: { enabled: true, color: 'rgba(0,0,0,0.4)', size: 8, x: 0, y: 2 } },
  layout: { improvedLayout: true }
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

  function init(el: HTMLElement) {
    container.value = el
    nodesDataSet.value = new DataSet(allNodes.map(toVisNode))
    edgesDataSet.value = new DataSet(allEdges.map(toVisEdge))

    const net = new Network(el, { nodes: nodesDataSet.value, edges: edgesDataSet.value }, baseOptions)
    network.value = net

    net.once('stabilizationIterationsDone', () => { stabilizing.value = false })
    net.on('click', (params) => {
      if (params.nodes.length > 0) {
        selectedNodeId.value = String(params.nodes[0])
      } else {
        selectedNodeId.value = null
      }
    })

    return net
  }

  function focusNode(id: string) {
    if (!network.value) return
    selectedNodeId.value = id
    network.value.focus(id, { scale: 1.1, animation: { duration: 500, easingFunction: 'easeInOutQuad' } })
    network.value.selectNodes([id])
  }

  function resetView() {
    if (!network.value) return
    network.value.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } })
    selectedNodeId.value = null
    network.value.unselectAll()
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
    filterByCategories,
    searchHighlight,
    nodeById,
    edgesForNode
  }
}
