let flagMap = new Map();
let faceMap = new Map();
let overallMap = new Map();
let bestPlayerMap = new Map();
let clubMap = new Map();

let facts;
let seriesDim;
let nationalityDim;
let heightWeightDim;
let ageDimension;
let colorScale;

const promises = [
  d3.csv('https://raw.githubusercontent.com/icarodelay/projeto-datavis-fifa/main/FIFA21_official_data.csv', function(d) {
    // handle and populate maps
    let id = flagID.get(d.Nationality);
    flagMap.set(d.Nationality, 'https://media.contentapi.ea.com/content/dam/ea/fifa/fifa-21/ratings-collective/f20assets/country-flags/'+ id +'.png');
    faceMap.set(d.ID, 'https://www.fifaindex.com/static/FIFA21/images/players/10/'+ d.ID +'.webp');
    d.Overall = +d.Overall;
    d.Age = +d.Age;
    let clubId = d['Club Logo'].match('https://cdn.sofifa.com/teams/(.*)/light_30.png');
    if (clubId !== null) {
      clubMap.set(d.Club, 'https://www.fifaindex.com/static/FIFA20/images/crest/3/light/'+clubId[1]+'@3x.webp');
    } else {
      clubMap.set(d.Club, 'https://www.kindpng.com/picc/m/547-5479953_grey-shield-svg-clip-arts-hd-png-download.png');
    }
    if (overallMap.get(d.Nationality) >= d.Overall) {
      // do nothing
    } else {
      overallMap.set(d.Nationality, +d.Overall);
    }
    if (rename.get(d.Nationality)) {
      overallMap.set(rename.get(d.Nationality), overallMap.get(d.Nationality));
    }

    // handle wage values
    if (d.Wage.includes('K')) {
      d.Wage = +d.Wage.replace(/\D/g, '') * 1000;
    } else {
      d.Wage = +d.Wage.replace(/\D/g, '');
    }

    // handle height and weight
    let [feet, inches] = d.Height.split("'"); // split the height in feet and inches (5'6);
    d.Height = +(((+feet * 30.48) + (+inches * 2.54)) / 100).toFixed(2); // height in m
    d.Weight = +(d.Weight.replace(/\D/g, '') / 2.205).toFixed(2); // convert lbs to kg

    return d;
  }),
  d3.json('https://raw.githubusercontent.com/icarodelay/projeto-datavis-fifa/main/custom.geo.json'),
  d3.json('https://raw.githubusercontent.com/icarodelay/projeto-datavis-fifa/main/club_transfers_data_over_74.json'),
  d3.csv('https://raw.githubusercontent.com/icarodelay/projeto-datavis-fifa/main/FIFA21_official_data.csv', function(d) {
    if (overallMap.get(d.Nationality) == d.Overall) {
      bestPlayerMap.set(d.Nationality, [d.Name, d.ID]);
    }
    if (rename.get(d.Nationality)) {
      bestPlayerMap.set(rename.get(d.Nationality), bestPlayerMap.get(d.Nationality));
    }
  })
];

Promise.all(promises).then(ready);

function ready([data, countries, graph]) {
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
  clubMap.set('Coritiba', 'https://www.fifaindex.com/static/FIFA21/images/crest/10/light/111044@3x.webp');
  clubMap.set('Juventus', 'https://www.fifaindex.com/static/FIFA19/images/crest/10/light/45@3x.webp');
  clubMap.set('CSA - AL', 'https://www.fifaindex.com/static/FIFA20/images/crest/10/light/113677@3x.webp');
  clubMap.set('Fatih Karagümrük S.K.', 'https://www.fifaindex.com/static/FIFA21/images/crest/10/light/111117@3x.webp');
  clubMap.set('Zenit St. Petersburg', 'https://www.fifaindex.com/static/FIFA18/images/crest/10/light/100769@3x.webp');
  clubMap.set('FC Krasnodar', 'https://www.fifaindex.com/static/FIFA18/images/crest/10/light/112218@3x.webp');

  // Dimensions
  seriesDim = facts.dimension(d => [d.Overall, d.ID, d.Name]);
  nationalityDim = facts.dimension(d => d.Nationality);
  heightWeightDim = facts.dimension(d => [d.Weight, d.Height, d.Overall]);
  ageDimension = facts.dimension(d => d.Age);

  // Color Scale
  // colorScale = d3.scaleSequential()
  //   .domain(d3.extent(Array.from(overallMap.values())))
  //   .interpolator(d3.interpolateYlGnBu)
  //   .unknown('#ccc');
  colorScale = d3.scaleQuantize()
    .domain(d3.extent(Array.from(overallMap.values())))
    .range(colorMap)
    .unknown('#ccc');

  loadField();
  loadMap(countries);
  loadTopFivePlayers();
  loadScatterPlot();
  loadBarChart();
  loadBilevelEdgeBundling(graph);
}
