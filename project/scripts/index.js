
// BarChart
// const barChartRank = new dc.RowChart('#bar-chart');

window.onload = async () => {
    const response = await fetchData();
    dataset = response.dataset;
    flagMap = response.flagMap;
    faceMap = response.faceMap;
    overallMap = response.overallMap;
    facts = crossfilter(dataset);
    seriesDim = facts.dimension(d => [d.Overall, d.ID, d.Name, d.Nationality]);
    overallDimension = seriesDim.group().reduceSum(d => d.Overall);
    names = overallDimension.top(Infinity).map(d => d.key);
    names_rank = names.slice(0, 5);
    bestPlayersName = names_rank.map(player => player[2]);
    barScale = d3.scaleOrdinal().domain(bestPlayersName).range(names_rank);
    loadAll();
};

async function loadAll(country = 'Brazil') {
    // const { dataset, flagMap, faceMap, overallMap } = await fetchData();
    // const facts = crossfilter(dataset);
    // const seriesDim = facts.dimension(d => [d.Overall, d.ID, d.Name, d.Nationality]);

    loadField(country);
    loadBarChart();
    // loadBilevelEdgeBundling(flagMap);
    loadMap();
}

function loadBarChart() {
    const width = 480;
    const height = 200;
    // const group_id = seriesDim.group().reduceSum(d => d.Overall);
    // const names = group_id.top(Infinity).map(d => d.key);
    // const names_rank = names.slice(0, 5);
    // const bestPlayersName = names_rank.map(player => player[2]);
    // const barScale = d3.scaleOrdinal().domain(bestPlayersName).range(names_rank);

    barChartRank
        .width(width)
        .height(height)
        .elasticX(true)
        .labelOffsetX(10)
        .margins({ top: 2, right: 40, bottom: 25, left: 2 })
        .x(barScale)
        .dimension(names_rank)
        .group(overallDimension)
        .cap(5)
        .keyAccessor(d => d.key[2])
        .valueAccessor(d => d.value)
        .colorAccessor(d => d.key[0])
        .othersGrouper(false)

    barChartRank.render();
}

async function loadBilevelEdgeBundling(flagMap) {
    const { nodes, links } = await fetchGraph();
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
            ${d.outgoing.length} outgoing
            ${d.incoming.length} incoming`
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

    function overed(event, d) {
        link.style('mix-blend-mode', null);
        d3.select(this).attr('font-weight', 'bold');
        d3.selectAll(d.incoming.map(d => d.path)).attr('stroke', colorin).raise();
        d3.selectAll(d.incoming.map(([d]) => d.text)).attr('fill', colorin).attr('font-weight', 'bold');
        d3.selectAll(d.outgoing.map(d => d.path)).attr('stroke', colorout).raise();
        d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr('fill', colorout).attr('font-weight', 'bold');
        // console.log(event, d)
        console.log(flagMap.get(d.data.club))
    }

    function outed(event, d) {
        link.style('mix-blend-mode', 'multiply');
        d3.select(this).attr('font-weight', null);
        d3.selectAll(d.incoming.map(d => d.path)).attr('stroke', null);
        d3.selectAll(d.incoming.map(([d]) => d.text)).attr('fill', null).attr('font-weight', null);
        d3.selectAll(d.outgoing.map(d => d.path)).attr('stroke', null);
        d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr('fill', null).attr('font-weight', null);

    }

    return svg.node();
}

async function loadMap() {
    const outline = ({type: 'Sphere'});
    const projection = d3.geoNaturalEarth1();
    const path = d3.geoPath(projection);
    const width = 975;
    const height = () => {
        const [[x0, y0], [x1, y1]] = d3.geoPath(projection.fitWidth(width, outline)).bounds(outline);
        const dy = Math.ceil(y1 - y0), l = Math.min(Math.ceil(x1 - x0), dy);
        projection.scale(projection.scale() * (l - 1) / l).precision(0.2);
        return dy;
    }
    const countries = await d3.json('https://raw.githubusercontent.com/icarodelay/projeto-datavis-fifa/main/custom.geo.json');
    const nationalityBestPlayer = await getBestPlayerMap(overallMap);
    const svg = d3.select('#mapid').select('svg').attr('viewBox', [0, 0, width, height()]);
    svg.selectAll('*').remove();
    const colorScale = d3.scaleSequential()
        .domain(d3.extent(Array.from(overallMap.values())))
        .interpolator(d3.interpolateYlGnBu)
        .unknown("#ccc");
    const style = feature => ({
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.6,
        fillColor: colorScale(overallMap.get(feature.properties.name))
    });
    const world = await d3.json("countries-50m.json");

    const defs = svg.append("defs");

    defs.append("path")
        .attr("id", "outline")
        .attr("d", path(outline));
    
    defs.append("clipPath")
        .attr("id", "clip")
        .append("use")
        .attr("xlink:href", new URL("#outline", location));
    
    const g = svg.append("g")
        .attr("clip-path", `url(${new URL("#clip", location)})`);

    g.append("use")
        .attr("xlink:href", new URL("#outline", location))
        .attr("fill", "white");

    g.append("g")
        .selectAll("path")
        .data(countries.features)
        .join("path")
        .attr("fill", d => colorScale(overallMap.get(d.properties.name)))
        .attr("d", path)
        .append("title")
        .text(d => `${d.properties.name}
            ${overallMap.has(d.properties.name) ? overallMap.get(d.properties.name) : "N/A"}
            ${nationalityBestPlayer.has(d.properties.name) ? nationalityBestPlayer.get(d.properties.name) : "N/A"}`
        );

    g.append("path")
        .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("d", path);

    const map = createMapInstance();
    const infoControl = createInfoControl(map, nationalityBestPlayer);
    const geojson = getGeoJSON(map, infoControl, countries, style);
}