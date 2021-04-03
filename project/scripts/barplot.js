function loadBarChart() {
  // const ageGroup = ageDimension.group().reduceSum(d => d.Wage);
  const ageGroup = ageDimension.group().reduce(reduceAdd, reduceRemove, reduceInitial);
  const ages = ageDimension.top(Infinity).map(d => d.Age);
  const barScale = d3.scaleLinear().domain(d3.extent(ages));

  barChart
    .width(barWidth)
    .height(barHeight)
    .dimension(ageDimension)
    .group(ageGroup)
    .x(barScale)
    .elasticY(true)
    .xAxisLabel('Idade')
    .ordinalColors(['#f3721e'])
    .valueAccessor(d => d.value.average)
    .brushOn(false);

  barChart.xAxisPadding(100)
  barChart.yAxis().tickFormat(d3.format('.2s'));
  barChart.render();
}

function reduceAdd(p, v) {
  ++p.count;
  p.total += +v.Wage;
  if (p.count === 0) {
    p.average = 0;
  } else {
    p.average = p.total / p.count;
  }
  return p;
}

function reduceRemove(p, v) {
  --p.count;
  p.total -= +v.Wage;
  if (p.count === 0) {
    p.average = 0;
  } else {
    p.average = p.total / p.count;
  }
  return p;
}

function reduceInitial() {
  return {
    count: 0,
    total: 0,
    average: 0
  };
}
