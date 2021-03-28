let flagMap = new Map();
let faceMap = new Map();
let overallMap = new Map();
let bestPlayerMap = new Map();

let facts;
let seriesDim;
let nationalityDim;
let overallAgeDimension;

const promises = [
  d3.csv('https://raw.githubusercontent.com/icarodelay/projeto-datavis-fifa/main/FIFA21_official_data.csv', function(d) {
    let id = flagID.get(d.Nationality);
    flagMap.set(d.Nationality, 'https://media.contentapi.ea.com/content/dam/ea/fifa/fifa-21/ratings-collective/f20assets/country-flags/'+ id +'.png');
    faceMap.set(d.ID, 'https://www.fifaindex.com/static/FIFA21/images/players/10/'+ d.ID +'.webp');
    if (overallMap.get(d.Nationality) >= d.Overall) {
      // do nothing
    } else {
      overallMap.set(d.Nationality, +d.Overall);
    }
    if (rename.get(d.Nationality)) {
      overallMap.set(rename.get(d.Nationality), overallMap.get(d.Nationality));
    }
    d.Wage = +d.Wage.replace(/\D/g, '');
    return d;
  }),
  d3.json('https://raw.githubusercontent.com/icarodelay/projeto-datavis-fifa/main/custom.geo.json'),
  d3.json('https://raw.githubusercontent.com/icarodelay/projeto-datavis-fifa/main/club_transfers_data_over_74.json'),
  d3.json('countries-50m.json'),
  d3.csv('https://raw.githubusercontent.com/icarodelay/projeto-datavis-fifa/main/FIFA21_official_data.csv', function(d) {
    if (overallMap.get(d.Nationality) == d.Overall){
      bestPlayerMap.set(d.Nationality, [d.Name, d.ID]);
    }
    if(rename.get(d.Nationality)){
      bestPlayerMap.set(rename.get(d.Nationality), bestPlayerMap.get(d.Nationality));
    }
  })
];

Promise.all(promises).then(ready);

function ready([data, countries, graph, world]) {
  facts = crossfilter(data);

  overallMap.set('United States of America', overallMap.get('United States'));
  overallMap.set('United Kingdom', Math.max(
      overallMap.get('Wales'),
      overallMap.get('England'),
      overallMap.get('Scotland'),
      overallMap.get('Northern Ireland')
  ));
  bestPlayerMap.set('United States of America', bestPlayerMap.get('United States'));
  bestPlayerMap.set('United Kingdom', bestPlayerMap.get('England'));

  // Dimensions
  seriesDim = facts.dimension(d => [d.Overall, d.ID, d.Name]);
  nationalityDim = facts.dimension(d => d.Nationality);
  overallAgeDimension = facts.dimension(d => [d.Overall, d.Age]);

  loadField();
  loadMap(countries, world);
  loadTopFivePlayers();
  loadScatterPlot();
  loadBilevelEdgeBundling(graph);
}
