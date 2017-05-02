// Load CSV data
d3.csv('imdb.csv', data => {
  // Histogram of IMDB scores
  histogram(data);

  // Scatterplot of IMDB score x number of users who submitted score
  scatterplot(data);

  // Line plot of budget/gross over time
  timeSeries(data);
});
