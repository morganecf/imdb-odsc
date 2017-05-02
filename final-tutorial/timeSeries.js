function timeSeries(data) {
  // Remove any datapoints not containing date, budget, gross,
  // and ignore the 80s.
  data = data.filter(d => {
    return d.date &&
      new Date(d.date) >= new Date('1990') &&
      _.isNumber(parseFloat(d.budget)) &&
      _.isNumber(parseFloat(d.gross))
  });

  // X-value accessor
  const xval = d => new Date(d.date);

  // Y-value accessors
  const budget = d => parseFloat(d.budget);
  const gross = d => parseFloat(d.gross);

  // Currency formatter: 3904390.3043 --> $3,904,390
  const currencyFormat = d3.format('($,.0f');

  // The time range
  const xrange = d3.extent(data, xval);
  const yrange = [0, 100000000];

  // Create the svg container
  const svg = createSvgContainer('#time-series');

  // Graph the axes
  const {xscale, yscale} = createAxes(svg, xrange, yrange, axisPrecision = 1e6, xScale = d3.scaleTime);

  // Bin the data
  const hist = d3.histogram()
    .value(xval)
    .thresholds(40)   // approximate number of bins
    (data);

  // The size in pixels of each bin
  const step = width / hist.length;

  // Draw very light bars so that we can easily mouseover
  // and get information in tooltips.
  const tipBar = svg.selectAll('.tip-bar')
    .data(hist)
    .enter()
    .append('rect')
    .attr('class', 'tip-bar')
    .attr('x', d => padding + xscale(d.x0))
    .attr('y', d => 0)
    .attr('width', step)
    .attr('height', height)
    .attr('fill-opacity', 0)
    .attr('stroke', '#333')
    .attr('stroke-opacity', 0.05);

  // This returns the average budget/gross in each bin
  const avgBudget = bin => d3.mean(bin, budget);
  const avgGross = bin => d3.mean(bin, gross);

  // Line generators. We evenly space the x-values such that
  // x is in the middle of each bin. The y-values of the line
  // correspond to the mean budget or mean gross values.
  const budgetLine = d3.line()
    .x((d, i) => padding + step / 2 + step * i)
    .y(d => yscale(avgBudget(d)));
  const grossLine = d3.line()
    .x((d, i) => padding + step / 2 + step * i)
    .y(d => yscale(avgGross(d)));

  // Generate the path svg for the lines
  svg.append('path')
    .attr('class', 'budget-line')
    .datum(hist)
    .attr('d', budgetLine);
  svg.append('path')
    .attr('class', 'gross-line')
    .datum(hist)
    .attr('d', grossLine);

  // Tooltip information
  function tipContent(d) {
    const year = new Date(d.x0).getFullYear() + ' - ' + new Date(d.x1).getFullYear();
    const budget = currencyFormat(avgBudget(d));
    const gross = currencyFormat(avgGross(d));
    const movies = d.slice(0, 3).map(m => m.title).join(', ');
    const content = {gross, budget, year, movies};
    return contentToHtmlFormatter(content);
  }

  // Add tooltip
  addToolTip(svg, tipBar, tipContent);
}