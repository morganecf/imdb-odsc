// Optionally: d3.csv('route', data => {});

const xval = d => parseFloat(d.score);
const yval = d => parseFloat(d.num_users_voted);

const svg = d3.select('section')
  .append('svg')
  .attr('width', 800)
  .attr('height', 400);

const xextent = d3.extent(data, xval);
const yextent = d3.extent(data, yval);

const xscale = d3.scaleLinear().domain(xextent).range([0, 750]);
const yscale = d3.scaleLinear().domain(yextent).range([350, 0]);

const xaxis = d3.axisBottom().scale(xscale);
const yaxis = d3.axisLeft().scale(yscale);

svg.append('g')
  .attr('transform', 'translate(50, 350)')
  .call(xaxis);
svg.append('g')
  .attr('transform', 'translate(50, 0)')
  .call(yaxis);

const point = svg.selectAll('.point')
  .data(data)
  .enter()
  .append('circle')
  .attr('class', 'point')
  .attr('r', 5)
  .attr('cx', d => 50 + xscale(xval(d)))
  .attr('cy', d => yscale(yval(d)))
  .attr('opacity', 0.7);

const tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(d => '<div class="tip-value">' + d.score + ', ' + d.num_users_voted + ', ' + d.title + '</div>');

svg.call(tip);

point.on('mouseover', tip.show);
point.on('mouseout', tip.hide);
