const nodeFields = new Set(['shops', 'boss'])
const edgeFields = new Set(['bonus', 'refill', 'via', 'legendary_forge'])

function objectHtml(object, keys) {
  return [...keys].filter(k => object[k]).map(k => `<b>${k}</b>: ${object[k]}`).join('<br/>')
}

function renderGraph(g) {
  const svg = d3.select('svg')
  const group = svg.append('g')

  const config = g.graph()
  // at this point, config is just an empty object;
  // width & height aren't set until it's rendered
  Object.assign(config, {marginx: 10, marginy: 10})

  const render = new dagreD3.render()
  render(group, g)

  // set up tooltip
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)
  // activate tooltip for nodes
  group.selectAll('g.node')
    .on('mouseover', id => {
      const node = g.node(id)
      const content = objectHtml(node, nodeFields)
      if (content) {
        tooltip.style('opacity', 1)
          .html(content)
      }
    })
    .on('mousemove', () => {
      tooltip
        .style('left', `${d3.event.pageX}px`)
        .style('top', `${d3.event.pageY}px`)
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0)
    })
  // activate tooltip for edges
  group.selectAll('g.edgePath')
    .on('mouseover', id => {
      const edge = g.edge(id)
      const content = objectHtml(edge, edgeFields)
      if (content) {
        tooltip.style('opacity', 1)
          .html(content)
      }
    })
    .on('mousemove', () => {
      tooltip
        .style('left', `${d3.event.pageX}px`)
        .style('top', `${d3.event.pageY}px`)
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0)
    })

  // resize svg to match graph dimensions
  const {width, height} = config
  svg.attr('width', width)
  svg.attr('height', height)
}

/**
dagre-d3 supports _only_ these 'shape' values:
- rect
- ellipse
- circle
- diamond
*/
const dotShapeToDagreShape = new Map([
  ['box', 'rect'],
])

fetch('levels.dot').then(response => response.text()).then(text => {
  const g = graphlibDot.read(text)

  // set defaults
  g.nodes().forEach(v => {
    const node = g.node(v)
    node.shape = dotShapeToDagreShape.get(node.shape) || 'ellipse'
  })

  Object.assign(window, {g})
  renderGraph(g)
})
