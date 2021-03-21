let dataset;
let flagMap;
let faceMap;
let overallMap;
let seriesDim;
let facts;
let playersraw;
let players;
let overallDimension;
let names;
let names_rank;
let bestPlayersName;
let barScale;
let barChartRank = new dc.RowChart('#bar-chart');
// const southWest = L.latLng(-90, -180);
// const northEast = L.latLng(90, 180);
// const bounds = L.latLngBounds(southWest, northEast);
// let mapInstance = L.map('mapid', { maxBounds: bounds }).setView([0, 0], 2);

// const countries = async () => await d3.json('https://raw.githubusercontent.com/icarodelay/projeto-datavis-fifa/main/custom.geo.json');

// L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {       
//     maxZoom: 12,
//     minZoom: 2,            
// }).addTo(mapInstance);

// let infoControl = L.control();

// infoControl.onAdd = () => {
//     this._div = L.DomUtil.create('div', 'info');
//     infoControl.update();
//     return this._div;
// }

// infoControl.update = feat => {
//     // console.log(feat && nationalityBestPlayer.get(feat.properties.name))
//     this._div.innerHTML = '<h5>Melhor Overall</h5>' +
//     (feat ?
//         '<b>' + feat.properties.name + '</b><br/>' +
//         '<img src="' + faceMap.get(nationalityBestPlayer.get(feat.properties.name)[1]) +
//         '" width="50px"/><b style="font-size: 20px">' + overallMap.get(feat.properties.name) +
//         '</b><br/><i>' + nationalityBestPlayer.get(feat.properties.name)[0] + '</i>'
//     : 'Passe o mouse sobre um país');
// }

// infoControl.addTo(mapInstance);

// async function getOverallMap() {
//     const dataset = await d3.csv('https://raw.githubusercontent.com/icarodelay/projeto-datavis-fifa/main/FIFA21_official_data.csv');
//     overallMap = new Map();
//     dataset.forEach(d => {
//         if (overallMap.get(d.Nationality) >= d.Overall) {
//             // do nothing
//         } else {
//             overallMap.set(d.Nationality, +d.Overall);
//         }
//         if (rename.get(d.Nationality)) {
//             overallMap.set(rename.get(d.Nationality), overallMap.get(d.Nationality));
//         }
//     });
//     overallMap.set("United States of America", overallMap.get("United States"));
//     overallMap.set("United Kingdom", Math.max(
//         overallMap.get("Wales"),
//         overallMap.get("England"),
//         overallMap.get("Scotland"),
//         overallMap.get("Northern Ireland")
//     ));
//     return overallMap;
// }

// let colorScale = async () => {
//     return d3.scaleSequential()
//         .domain(d3.extent(Array.from(await overallMap.values())))
//         .interpolator(d3.interpolateYlGnBu)
//         .unknown("#ccc");
// }

// const style = async feature => ({
//     weight: 1,
//     opacity: 1,
//     color: 'white',
//     dashArray: '3',
//     fillOpacity: 0.6,
//     fillColor: await colorScale(overallMap.get(feature.properties.name))
// });


// function highlightFeature(e) {
//     let layer = e.target;

//     layer.setStyle({
//         weight: 2,
//         color: '#AAA',
//         dashArray: '',
//         fillOpacity: 0.7
//     });

//     if (!L.Browser.ie && !L.Browser.opera) {
//         layer.bringToFront();
//     }

//     info.update(layer.feature);
// }

// let geoj;

// function resetHighlight(e) {
//     geoj.resetStyle(e.target);
//     info.update();
// }

// function zoomToFeature(e) {
//     map.fitBounds(e.target.getBounds());
//     updateFilters(e.target.feature);
// }

// function onEachFeature(feature, layer) {
//     layer.on({
//         mouseover: highlightFeature,
//         mouseout: resetHighlight,
//         click: zoomToFeature,
//     });
// }

// async function geoJson() {
//     L.geoJson(await countries(), {
//         style: style,
//         onEachFeature: onEachFeature
//     }).addTo(mapInstance);
// }

// geoJson();
