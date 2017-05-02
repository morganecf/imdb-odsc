function scatterplot(data) {
  // X-value accessor
  const xval = d => parseFloat(d.score);
  // Y-value accessor
  const yval = d => parseFloat(d.num_users_voted);

  // Create the svg container
  const svg = createSvgContainer('#scatterplot');

  // Get the range of the score data, which we'll plot on the x-axis
  const xrange = d3.extent(data, xval);

  // Get the range of the number of users who voted on a particular
  // movie, which we'll plot on the y-axis
  const yrange = d3.extent(data, yval);

  // Graph the axes
  const {xscale, yscale} = createAxes(svg, xrange, yrange, axisPrecision = 1e3);

  // Add the circles
  const point = svg.selectAll('.point')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'point')
    .attr('cx', d => padding + xscale(xval(d)))
    .attr('cy', d => yscale(yval(d)))
    .attr('r', 5)
    .attr('opacity', 0.8);

  function tipContent(d) {
    const score = d.score;
    const votes = d.num_users_voted;
    const movie = d.title;
    const content = {movie, score, votes};
    return contentToHtmlFormatter(content);
  }

  // Add a tooltip
  addToolTip(svg, point, tipContent);
}
