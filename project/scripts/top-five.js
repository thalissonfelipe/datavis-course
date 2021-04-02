function loadTopFivePlayers() {
  const overallGroup = seriesDim.group().reduceSum(d => d.Overall);
  const names = overallGroup.top(5).map(d => d.key).map(player => player[2]);
  const rowScale = d3.scaleOrdinal().domain(names).range(names);

  rowChart
    .width(rowWidth)
    .height(rowHeight)
    .dimension(seriesDim)
    .group(overallGroup)
    .x(rowScale)
    .elasticX(true)
    .labelOffsetX(10)
    .margins({ top: 2, right: 40, bottom: 25, left: 2 })
    .cap(5)
    .keyAccessor(d => d.key[2])
    .valueAccessor(d => d.value)
    .colorAccessor(d => d.key[0])
    .othersGrouper(false);

  rowChart.filter = function() {};
  rowChart.render();
}
