function loadScatterPlot() {
  const overallAgeGroup = overallAgeDimension.group();
  const maxOverall = d3.max(overallAgeGroup.top(Infinity).map(d => d.key), d => d[0]);
  const maxAge = d3.max(overallAgeGroup.top(Infinity).map(d => d.key), d => d[1]);
  const xscatterScale = d3.scaleLinear().domain([0, maxAge]).range([0, scatterWidth]);
  const yscatterScale = d3.scaleLinear().domain([0, maxOverall]).range([scatterHeight, 0]);

  scatterPlotChart
    .width(scatterWidth)
    .height(scatterHeight)
    .dimension(overallAgeDimension)
    .group(overallAgeGroup)
    .x(xscatterScale)
    .y(yscatterScale)
    .brushOn(false)
    .symbolSize(8)
    .xAxisLabel('Age')
    .yAxisLabel('Overall')
    .colorAccessor(d => d.key[2])

  scatterPlotChart.render();
}
