const forceWidth = 1250;
const forceHeight = 450;
const center = {x: forceWidth / 2, y: forceHeight / 2};

function network(data) {
  // Sets the node id accessor so that the force simulation
  // knows that a node is uniquely identified by its name
  const forceLink = d3.forceLink().id(d => d.name);

  // Force function that acts upon multiple bodies. A positive
  // strength causes nodes to attract each other -- this will
  // cause nodes to collapse into each other. A negative strength
  // causes nodes to repel each other.
  const forceCharge = d3.forceManyBody().strength(-3);

  // Creates a centering force, i.e., centers the simulation at
  // the given x and y coordinates.
  const forceCenter = d3.forceCenter(center.x, center.y);

  // Create a new simulation with the above forces
  const simulation = d3.forceSimulation()
    .force('link', forceLink)
    .force('charge', forceCharge)
    .force('center', forceCenter);

  // Create the svg element
  const svg = createSvgContainer('#network', forceWidth, forceHeight, 0, 0);

  // Create a color scale for the movie ratings. The higher
  // the rating, the redder the movie node.
  const rating = d3.scaleLinear()
    .domain([3, 9])
    .range([red, blue]);

  // Add links or edges as path elements. Group all of these
  // paths in a g element. Link width (thickness) represents
  // the edge weights. The higher the weight, i.e., the # of
  // keywords a pair of movies has in common, the bigger the
  // width. Each edge or link represents a weighted connection
  // between two movies, based on how many keywords they have
  // in common.
  const link = svg.append('g')
    .attr('class', 'links')
    .selectAll('.link')
    .data(data.links)
    .enter()
    .append('line')
    .attr('class', 'link')
    .attr('stroke-width', d => d.overlap.length);

  // Add node elements, grouped together. Each node represents
  // a movie and is color-scaled based on its IMDB rating.
  const node = svg.append('g')
    .attr('class', 'nodes')
    .selectAll('.node')
    .data(data.nodes)
    .enter()
    .append('circle')
    .attr('class', 'node')
    .attr('r', 5)
    .attr('fill', d => rating(d.score));

  // Start the simulation
  simulation.nodes(data.nodes).on('tick', tick);
  simulation.force('link').links(data.links);

  // This function is called on every "tick", or unit of time,
  // of the simulation. In each tick, D3 generates new node
  // positions based on the starting positions and the forces
  // chosen above. These are stored as x and y attributes of each
  // node data object. We reposition the svg links and nodes with
  // these values. You can use this function to customize the
  // positions of the nodes and links. For example, if you wanted
  // to ensure some kind of hierarchical tree structure, you could
  // give each node a level and then make sure nodes of a certain
  // level stayed above larger levels and below smaller levels.
  function tick() {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
  }

  // Formats HTML for the node tooltips: show the movie
  // name and its IMDB rating.
  function nodeTooltipContent(d) {
    const movie = d.name;
    const rating = d.score;
    return contentToHtmlFormatter({movie, rating});
  }

  // Formats HTML for the link tooltips: show the two
  // movie names and the key words they have in common.
  function linkTooltipContent(d) {
    const link = d.source.name + ', ' + d.target.name;
    const keywords = d.overlap.join(', ');
    return contentToHtmlFormatter({link, keywords});
  }

  // Initialize the tooltips
  addToolTip(svg, node, nodeTooltipContent);
  addToolTip(svg, link, linkTooltipContent);
}

d3.json('../data/networks/network_2000_2.json', data => {
  network(data);
});