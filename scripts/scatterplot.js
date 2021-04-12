function loadScatterPlot() {
  let heightWeightGroup = heightWeightDim.group();
  let weights = d3.extent(heightWeightDim.top(Infinity).map(d => d.Weight));
  let heights = d3.extent(heightWeightDim.top(Infinity).map(d => d.Height));
  // let overalls = d3.extent(heightWeightDim.top(Infinity).map(d => d.Overall));
  let xscatterScale = d3.scaleLinear().domain(weights);
  let yscatterScale = d3.scaleLinear().domain(heights);
  // let colorScale = d3.scaleQuantize().domain(overalls).range(d3.schemeYlOrRd[5]);

  scatterPlotChart
    .width(scatterWidth)
    .height(scatterHeight)
    .dimension(heightWeightDim)
    .group(heightWeightGroup)
    .x(xscatterScale)
    .y(yscatterScale)
    .elasticY(true)
    .elasticX(true)
    .brushOn(false)
    .symbolSize(5)
    .renderLabel(false)
    .xAxisLabel('Peso (kg)')
    .yAxisLabel('Altura (m)')
    .colors(colorScale)
    .colorAccessor(d => d.key[2]);

  // scatterPlotChart.legendables = () => {
  //   let byColor = {};
  //   scatterPlotChart.group().all().forEach(d => {
  //     let color = scatterPlotChart.colors()(scatterPlotChart.colorAccessor()(d));
  //     byColor[color] = {
  //       chart: scatterPlotChart,
  //       name: 'color ' + scatterPlotChart.colorAccessor()(d),
  //       color: color
  //     }
  //   });
  //   return Object.values(byColor);
  // }
  // scatterPlotChart.legend(dc.legend().x(200).y(10).itemHeight(13).gap(5).legendWidth(90).itemWidth(70));
  scatterPlotChart.render();
}
