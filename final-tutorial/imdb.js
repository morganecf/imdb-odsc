// Load CSV data
d3.csv('../data/imdb.csv', data => {
  // Histogram of IMDB ratings
  histogram(data);

  // Scatterplot of IMDB rating x number of users who submitted score
  scatterplot(data);

  // Line plot of budget/gross over time
  timeSeries(data);
});
