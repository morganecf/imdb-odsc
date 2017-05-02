function createSvgContainer(selector, svgWidth = width, svgHeight = height, marginLeft = 150, marginTop = 50) {
  return d3.select(selector)
    .append('svg')
    .attr('width', svgWidth + (padding * 2))
    .attr('height', svgHeight + (padding * 2))
    .attr('transform', 'translate(' + marginLeft + ', ' + marginTop + ')');
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