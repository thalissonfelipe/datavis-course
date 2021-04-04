L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
  maxZoom: 12,
  minZoom: 2,
}).addTo(map);

// InfoControl
let infoControl = L.control();

infoControl.onAdd = () => {
  this._div = L.DomUtil.create('div', 'info');
  infoControl.update();
  return this._div;
}

infoControl.update = feat => {
  this._div.innerHTML = '<h5>Melhor Overall</h5>' +
  (feat && bestPlayerMap.get(feat.properties.name) ?
    '<b>' + feat.properties.name + '</b><br/>' +
    '<img onerror="this.src=\'assets/notfound.webp\'" src="' + faceMap.get(bestPlayerMap.get(feat.properties.name)[1]) +
    '" width="50px"/><b style="font-size: 20px">' + overallMap.get(feat.properties.name) +
    '</b><br/><i>' + bestPlayerMap.get(feat.properties.name)[0] + '</i>'
  : '<span>Passe o mouse sobre um país.</span><br/><br/><span>Clique duas vezes para resetar o mapa.</span>');
}

infoControl.addTo(map);

// GeoJSON
let geoj;

function highlightFeature(e) {
  let layer = e.target;

  layer.setStyle({
    weight: 2,
    color: '#AAA',
    dashArray: '',
    fillOpacity: 0.7
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  infoControl.update(layer.feature);
}

function resetHighlight(e) {
  geoj.resetStyle(e.target);
  infoControl.update();
}

const countryName = document.getElementById('country-name');

function updateFilters(e) {
  const country = e.properties.name;

  if (disabledCountries.includes(country)) return;

  if (country === 'United Kingdom') {
    nationalityDim.filter(n => ['England', 'Scotland', 'Northern Ireland', 'Wales'].includes(n));
    loadField(country);
  } else if (renameInverted.get(country)) {
    nationalityDim.filter(n => n === renameInverted.get(country));
    loadField(renameInverted.get(country));
  } else {
    nationalityDim.filter(n => n === country);
    loadField(country);
  }

  countryName.innerHTML = `Região: ${country}`;

  dc.redrawAll();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
  updateFilters(e.target.feature);
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature,
  });
}

// Reset all graphs to their initial state
map.on('dblclick', () => {
  map.setView([0, 0], 2);
  nationalityDim.filter(n => n);
  loadField();
  dc.redrawAll();
  countryName.innerHTML = 'Região: Mundo';
});

function loadMap(countries, world) {
  const mapSVG = d3.select('#mapid').select('svg').attr('viewBox', [0, 0, mapWidth, mapHeight()]);
  mapSVG.selectAll('*').remove();

  const style = feature => ({
    weight: 1,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.6,
    fillColor: colorScale(overallMap.get(feature.properties.name))
  });

  const defs = mapSVG.append('defs');

  defs.append('path')
    .attr('id', 'outline')
    .attr('d', path(outline));

  defs.append('clipPath')
    .attr('id', 'clip')
    .append('use')
    .attr('xlink:href', new URL('#outline', location));

  const g = mapSVG.append('g')
    .attr('clip-path', `url(${new URL('#clip', location)})`);

  g.append('use')
    .attr('xlink:href', new URL('#outline', location))
    .attr('fill', 'white');

  g.append('g')
    .selectAll('path')
    .data(countries.features)
    .join('path')
    .attr('fill', d => colorScale(overallMap.get(d.properties.name)))
    .attr('d', path)
    .append('title')
    .text(d => `${d.properties.name}
      ${overallMap.has(d.properties.name) ? overallMap.get(d.properties.name) : 'N/A'}
      ${bestPlayerMap.has(d.properties.name) ? bestPlayerMap.get(d.properties.name) : 'N/A'}`
    );

  g.append('path')
    .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-linejoin', 'round')
    .attr('d', path);

  geoj = L.geoJson(countries, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);
}
