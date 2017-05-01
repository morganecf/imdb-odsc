const width = 800;
const height = 350;
const padding = 50;

function createSvgContainer(selector) {
  return d3.select(selector)
    .append('svg')
    .attr('width', width + (padding * 2))
    .attr('height', height + (padding * 2))
    .attr('transform', 'translate(150, 50)');
}

function createAxes(svg, xrange, yrange, axisPrecision = 1e1, xScale = d3.scaleLinear, yScale = d3.scaleLinear) {
  // Create scales: map an input domain to an output range
  const xscale = xScale().domain(xrange).range([0, width]);
  const yscale = yScale().domain(yrange).range([height, 0]);

  // This formats the numbers on the axes in prefix notation. For
  // example, 1,600 becomes 1.6K
  const formatter = d3.formatPrefix(",.0", axisPrecision);

  // Create d3 axis generators
  const xaxis = d3.axisBottom(xscale);
  const yaxis = d3.axisLeft(yscale).tickFormat(formatter);

  // Add x-axis
  svg.append('g')
    .attr('transform', 'translate(' + padding + ', ' + height + ')')
    .call(xaxis);

  // Add y-axis
  svg.append('g')
    .attr('transform', 'translate(' + padding + ',0)')
    .call(yaxis);

  return {xscale, yscale};
}

function addToolTip(svg, element, htmlFormatter) {
  const tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(htmlFormatter);

  svg.call(tip);

  element.on('mouseover', tip.show);
  element.on('mouseout', tip.hide);

  return tip;
}

function contentToHtmlFormatter(content) {
  const divs = _.keys(content).map((k, i) => {
    const title = _.capitalize(k) + ': ';
    const value = content[k];
    const titleClass = 'title-' + (i + 1);
    return `<div><span class="tip-title ${titleClass}">${title}</span><span class="tip-value">${value}</span></div>`;
  });
  return divs.join('');
}

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

d3.csv('imdb.csv', data => {
  // Histogram of IMDB scores
  histogram(data);

  // Scatterplot of IMDB score x number of users who submitted score
  scatterplot(data);

  // Line plot of budget/gross over time
  timeSeries(data);
});
