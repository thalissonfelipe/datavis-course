async function loadBilevelEdgeBundling(graph) {
  const { nodes, links } = graph;
  const groupById = new Map();
  const nodeById = new Map(nodes.map(node => [node.club, node]));

  for (const node of nodes) {
    let group = groupById.get(node.id);
    if (!group) groupById.set(node.id, group = { id: node.id, children: [] });
    group.children.push(node);
    node.targets = [];
  }

  for (const { source: sourceId, target: targetId } of links) {
    nodeById.get(sourceId).targets.push(targetId);
  }

  const data = { children: [...groupById.values()] };
  const width = 954;
  const radius  = width / 2;
  const colorin = '#00f';
  const colorout = '#f00';
  const colornone = '#ccc';

  const tree = d3.cluster().size([2 * Math.PI, radius - 100]);
  const line = d3.lineRadial()
    .curve(d3.curveBundle.beta(0.85))
    .radius(d => d.y)
    .angle(d => d.x);
  const root = tree(bilink(d3.hierarchy(data)
    .sort((a, b) => d3.ascending(a.height, b.height) || d3.ascending(a.data.id, b.data.id))));

  const svg = d3.select('#bilevel').select('svg').attr('viewBox', [-width / 2, -width / 2, width, width]);
  svg.selectAll('*').remove();

  svg.append('g')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 10)
    .selectAll('g')
    .data(root.leaves())
    .join('g')
    .attr('transform', d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
    .append('text')
    .attr('dy', '0.31em')
    .attr('x', d => d.x < Math.PI ? 6 : -6)
    .attr('text-anchor', d => d.x < Math.PI ? 'start' : 'end')
    .attr('transform', d => d.x >= Math.PI ? 'rotate(180)' : null)
    .text(d => d.data.club)
    .each(function(d) { d.text = this; })
    .on('mouseover', overed)
    .on('mouseout', outed)
    .call(text => text.append('title').text(d => `${d.data.club}
      ${d.outgoing.length} chegando
      ${d.incoming.length} partindo`
    ));

  const link = svg.append('g')
    .attr('stroke', colornone)
    .attr('fill', 'none')
    .selectAll('path')
    .data(root.leaves().flatMap(leaf => leaf.outgoing))
    .join('path')
    .style('mix-blend-mode', 'multiply')
    .attr('d', ([i, o]) => line(i.path(o)))
    .each(function(d) { d.path = this; });
  
  const clubImage = document.querySelector('.club-image');

  function overed(event, d) {
    link.style('mix-blend-mode', null);
    d3.select(this).attr('font-weight', 'bold');
    d3.selectAll(d.incoming.map(d => d.path)).attr('stroke', colorin).raise();
    d3.selectAll(d.incoming.map(([d]) => d.text)).attr('fill', colorin).attr('font-weight', 'bold');
    d3.selectAll(d.outgoing.map(d => d.path)).attr('stroke', colorout).raise();
    d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr('fill', colorout).attr('font-weight', 'bold');
    clubImage.style.visibility = 'visible';
    clubImage.style.backgroundImage = `url(${clubMap.get(d.data.club)})`;
  }

  function outed(event, d) {
    link.style('mix-blend-mode', 'multiply');
    d3.select(this).attr('font-weight', null);
    d3.selectAll(d.incoming.map(d => d.path)).attr('stroke', null);
    d3.selectAll(d.incoming.map(([d]) => d.text)).attr('fill', null).attr('font-weight', null);
    d3.selectAll(d.outgoing.map(d => d.path)).attr('stroke', null);
    d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr('fill', null).attr('font-weight', null);
    clubImage.style.visibility = 'hidden';
    clubImage.style.backgroundImage = '';
  }

  return svg.node();
}
