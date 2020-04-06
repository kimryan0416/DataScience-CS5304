# CS 5304 - Final Project Readme

Submitted by: Kieran Taylor, Masud Ahmed, Ryan Kim

Provided with this submission are the following files:
* `README.md` (this file)
* `index.html` - the web file that you must open
* `data/` - the input data for this assignment. This includes geojson data for both the USA and NYC and crime data
* `scripts/` - the JavaScript files that are used to run the interactive visualization on the browser.
* `screenshots/` - a collection of screenshots used for milestone reports
* `previousProject/` - the previous project that we're basing our code base off of

__IMPORTANT__: All data files EXCEPT complaint data has been uploaded to the repo... it's TOO BIG (legit, it's 2 gigs)

---

## Instructions On How To Run Code:

### Running the code
To run the visualization, Python 3.x is required on your device. Follow the instructions below:

1. Firstly, ensure that you have Python version 3.0 or higher.
2. Open up your bash terminal and change your working directory to the same directory as this file's folder.
3. Enter the following command into the Bash terminal: ``python3 -m http.server``.
4. Open your browser and enter the following url: ``localhost:8000``. If this does not work refer back to the bash terminal for which port the localhost has opened under.
	* In other words, in your Bash terminal, you should see something akin to ``port 8000`` outputted. That is your port, and you can enter the port in the browser by navigating to ``localhost:(PORT#)``
5. Have fun.

### To run the previous code base we're working off of

Similar in concept to the steps above, but your current working directory must be more specifically "previousProject/" 