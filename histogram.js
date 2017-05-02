function histogram(data) {
  // Format the histogram data using 30 bins
  const numBins = 20;
  const histGenerator = d3.histogram()
    .value(d => parseFloat(d.score))
    .thresholds(numBins);
  const hist = histGenerator(data);

  const binSize = width / hist.length;

  // Format data for axis scales
  const xrange = d3.extent(data, d => parseFloat(d.score));
  const yrange = d3.extent(hist, d => d.length);

  // Create svg container
  const svg = createSvgContainer('#histogram');

  // Draw axes
  const {xscale, yscale} = createAxes(svg, xrange, yrange);

  // Bind data to rectangles to create the histogram
  // Rect (x, y) is located at the top left corner
  const histogram = svg.selectAll('.hist-bar')
    .data(hist)
    .enter()
    .append('rect')
    .attr('class', 'hist-bar')
    .attr('x', d => padding + xscale(d.x0))
    .attr('y', height)   // Start the bar off at the bottom for transition
    .attr('width', binSize - 1)
    .attr('height', 0)   // Start the bar off with height of 0 for transition
    .attr('opacity', 0);

  // Transition the bar lengths
  histogram.transition()
    .duration(250)
    .delay((d, i) => i * (250 / hist.length))
    .attr('y', d => yscale(d.length))
    .attr('height', d => height - yscale(d.length))
    .attr('opacity', 1);

  // Define function to format tooltip. We want to display the
  // range of the scores in the given bin, the number of datapoints
  // in this range (frequency), and a sample of the movies in this
  // bin. We take the first three movies in this bin and show their
  // titles.
  function tipContent(d) {
    const score = d.x0 + ' - ' + d.x1;
    const frequency = d.length;
    const movies = d.slice(0, 3).map(m => m.title).join(', ');
    const content = {score, frequency, movies};
    return contentToHtmlFormatter(content);
  }

  // Add tooltip
  addToolTip(svg, histogram, tipContent);
}
