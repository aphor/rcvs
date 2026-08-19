import { useMemo } from 'react'

// A round-by-round RCV flow diagram. Columns are rounds (left → right); each
// candidate is a vertical bar sized by its votes that round; ribbons show ballots
// staying with a candidate or transferring from an eliminated candidate to its
// next choice (or exhausting). Rendered as inline SVG inside a horizontally
// scrolling pane.

const PALETTE = [
  '#b8860b', '#3f7d3f', '#2b6c8a', '#b13a7a', '#8a5a2b', '#6b3fa0',
  '#7d8a1f', '#c0392b', '#158a72', '#8e44ad', '#d35400', '#34506b',
]
const EXHAUSTED_COLOR = '#c9c2b5'

const NODE_W = 14
const COL_W = 210
const PAD_TOP = 30
const PAD_BOTTOM = 16
const INNER_H = 460
const GAP = 6
const LABEL_W = 168

function ribbonPath({ x0, x1, sy0, sy1, ty0, ty1 }) {
  const mx = (x0 + x1) / 2
  return (
    `M${x0},${sy0} C${mx},${sy0} ${mx},${ty0} ${x1},${ty0} ` +
    `L${x1},${ty1} C${mx},${ty1} ${mx},${sy1} ${x0},${sy1} Z`
  )
}

export default function Sankey({ sankey, order }) {
  const geo = useMemo(() => {
    const { num_rounds, nodes, links } = sankey
    const orderIndex = new Map(order.map((id, i) => [id, i]))
    const colorFor = (node) =>
      node.exhausted ? EXHAUSTED_COLOR : PALETTE[(orderIndex.get(node.candidate) ?? 0) % PALETTE.length]
    const rank = (node) =>
      node.exhausted ? Number.MAX_SAFE_INTEGER : (orderIndex.get(node.candidate) ?? 1e6)

    const cols = Array.from({ length: num_rounds }, () => [])
    for (const n of nodes) cols[n.round].push(n)
    cols.forEach((col) => col.sort((a, b) => rank(a) - rank(b)))

    const totalBallots = Math.max(...cols.map((c) => c.reduce((s, n) => s + n.value, 0)), 1)
    const maxNodes = Math.max(...cols.map((c) => c.length), 1)
    const scale = (INNER_H - GAP * (maxNodes - 1)) / totalBallots

    const layout = new Map() // node.id -> { x, y0, y1, node }
    cols.forEach((col, r) => {
      let y = PAD_TOP
      const x = 8 + r * COL_W
      for (const n of col) {
        const h = Math.max(n.value * scale, 1.5)
        layout.set(n.id, { x, y0: y, y1: y + h, node: n })
        y += h + GAP
      }
    })

    const present = links.filter((l) => layout.has(l.source) && layout.has(l.target))
    const bySource = {}
    const byTarget = {}
    for (const l of present) {
      ;(bySource[l.source] ??= []).push(l)
      ;(byTarget[l.target] ??= []).push(l)
    }
    // Order each node's outgoing links by the target's vertical position (and
    // incoming by the source's) so ribbons cross as little as possible.
    for (const list of Object.values(bySource)) list.sort((a, b) => layout.get(a.target).y0 - layout.get(b.target).y0)
    for (const list of Object.values(byTarget)) list.sort((a, b) => layout.get(a.source).y0 - layout.get(b.source).y0)
    const sy = {}
    const ty = {}
    for (const [src, list] of Object.entries(bySource)) {
      let off = layout.get(src).y0
      for (const l of list) {
        sy[key(l)] = [off, off + l.value * scale]
        off += l.value * scale
      }
    }
    for (const [tgt, list] of Object.entries(byTarget)) {
      let off = layout.get(tgt).y0
      for (const l of list) {
        ty[key(l)] = [off, off + l.value * scale]
        off += l.value * scale
      }
    }

    const ribbons = present.map((l) => {
      const s = layout.get(l.source)
      const t = layout.get(l.target)
      const [sy0, sy1] = sy[key(l)]
      const [ty0, ty1] = ty[key(l)]
      return {
        d: ribbonPath({ x0: s.x + NODE_W, x1: t.x, sy0, sy1, ty0, ty1 }),
        color: colorFor(s.node),
        id: key(l),
      }
    })

    const width = 8 + (num_rounds - 1) * COL_W + NODE_W + LABEL_W
    const height = PAD_TOP + INNER_H + PAD_BOTTOM
    const bars = [...layout.values()].map((p) => ({ ...p, color: colorFor(p.node) }))
    return { cols, bars, ribbons, width, height, num_rounds }

    function key(l) {
      return `${l.source}->${l.target}`
    }
  }, [sankey, order])

  return (
    <div className="sankey-scroll">
      <svg width={geo.width} height={geo.height} role="img" aria-label="Round-by-round vote flow">
        {/* round headers */}
        {Array.from({ length: geo.num_rounds }, (_, r) => (
          <text key={r} className="sankey-round" x={8 + r * COL_W + NODE_W / 2} y={18}>
            Round {r + 1}
          </text>
        ))}
        {/* ribbons under bars */}
        {geo.ribbons.map((rb) => (
          <path key={rb.id} d={rb.d} fill={rb.color} fillOpacity="0.32" />
        ))}
        {/* candidate bars + labels */}
        {geo.bars.map((b) => {
          const h = b.y1 - b.y0
          return (
            <g key={b.node.id}>
              <rect x={b.x} y={b.y0} width={NODE_W} height={h} rx="2" fill={b.color} />
              {h >= 11 && (
                <text className="sankey-label" x={b.x + NODE_W + 5} y={(b.y0 + b.y1) / 2 + 3}>
                  {b.node.label} · {b.node.value}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
