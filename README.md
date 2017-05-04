# Intro to D3

## Set up
1. Clone this repository
2. `cd` inside the repository
3. If on Mac/Linux, open up the terminal and run:
   * Using python 3: `python3 -m http.server <port>`
   * Using python 2+: `python -m SimpleHTTPServer <port>`
   * This allows d3 to load data, which is served by this simple python webserver hosting our directory. If we try to load data directly from our filesystem without a server, we'll get a cross origin request error -- d3 thinks it's loading data from a url different from our origin domain (the local filesystem).
4. If not on Mac/Linux, which come with a python installation, there are google-able alternatives. If you have node, you can run `npm install http-server -g` and launch `http-server`.
5. If setting up a server doesn't work, one alternative is to simply save the data as a javascript object and load that file as you would any other file. This is already done for you. The data is stored in a variable in `workshop/data.js`. Simply uncomment the line loading this file in `workshop/main.html` and you'll be able to access the data in an object named `data`. This isn't the recommended way of loading data but will work just fine for our purposes. 
6. Go to your localhost (ex: `0.0.0.0:8000`). You should see a directory listing. Open up `workshop/main.html`
   * If you're not using a localhost, directly open up `main.html` in your browser (ex: `file://user/Users/morgane/imdb-odsc/workshop/main.html`)
7. Open up the dev console (`option+command+i` or right click and "inspect element" then click on the console).
8. Type `d3`, and you should be able to view the d3 library and all its properties.

## Loading data
If you're storing the data in a js file (`data.js`), you should be able to access it in the `data` object. It is already loaded for you in `main.html`. 

If you're serving the data file (it's stored as a csv in `data/imdb.csv`), you should be able to do:

```javascript
d3.csv('data/imdb.csv', data => {
  console.log('imdb data:', data);
  // Do some stuff with it!
});
```


