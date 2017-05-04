# Intro to D3

## Set up
1. Clone this repository
2. `cd` inside the repository
3. If on Mac/Linux, open up the terminal and run:
   * Using python 3: `python3 -m http.server <port>`
   * Using python 2+: `python -m SimpleHTTPServer <port>`
   * This allows d3 to load data, which is served by this simple python webserver hosting our directory. If we try to load data directly from our filesystem without a server, we'll get a cross origin request error -- d3 thinks it's loading data from a url different from our origin domain (the local filesystem).
4. If not on Mac/Linux, which come with a python installation, there are google-able alternatives. If you have node, you can run `npm install http-server -g` and launch `http-server`.
5. If setting up a server doesn't work, one alternative is to simply save the data as a javascript object and load that file as you would any other file. This is already done for you, in `workshop/data.js`. Simply uncomment the line loading this file in `workshop/main.html` and you'll be able to access the data in an object named `data`. This isn't the recommended way of loading data but will work just fine for our purposes. 
6. Go to your localhost (ex: 0.0.0.0:8000). You should see a directory listing. Open up workshop/main.html
   * If you're not using a localhost, directly open up `main.html` in your browser (ex: `file://user/Users/morgane/imdb-odsc/workshop/main.html`)



