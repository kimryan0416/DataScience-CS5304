//Width and height of map
var width = 1200;
var height = 800;

// D3 Projection
var svg;
//d3.geoAlbersUsa()
var projection = d3.geoMercator()
	.translate([width/2, height/2])
	//.center([0, 0])
	.scale([60000]);
// MAY BE LEGACY - DON'T DELETE)
var months = {
	"jan":31,
	"feb":28,
	"mar":31,
	"apr":30,
	"may":31,
	"june":30,
	"july":31,
	"aug":31,
	"sep":30,
	"oct":31,
	"nov":30,
	"dec":31
}
var monthsDays = [31,28,31,30,31,30,31,31,30,31,30,31]
var availableStates = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"]

// DEFINITELY USING
var maxTempRange, maxTempColor, minTempRange, minTempColor, avgTempRange, avgTempColor;
var monthMap = {
	"01":"January",
	"02":"February",
	"03":"March",
	"04":"April",
	"05":"May",
	"06":"June",
	"07":"July",
	"08":"August",
	"09":"September",
	"10":"October",
	"11":"November",
	"12":"December"
}
var tempRanges = ["TMIN","TAVG","TMAX"], currentTempRange = 1;
//var monthCats = ["01","02","03","04","05","06","07","08","09"], currentMonthCat = 0;
var temperatureSelect, monthSlider, monthLabel;



var boroughs;
var crimeSources = ["data/NYPD_Shooting_Incident_Data__Historic_.csv"];
var yearSelect = document.getElementById("tempTypeSelect");

function isArray(a) {	return Object.prototype.toString.call(a) === "[object Array]";	}
function make(desc) {
	// Probably a good idea to check if 'desc' is an array, but this can be done later;
	if ( !isArray(desc) ) return false;
	var tag = desc[0], attributes = desc[1];
	var el = document.createElement(tag);
	var start = 1;
	if ( (attributes!=null) && (typeof attributes === 'object') && !isArray(attributes) ) {
		for (var attr in attributes) {
			switch(attr) {
				case 'class':
					el.className = attributes[attr];
					break;
				case 'checked':
					el.checked = attributes[attr];
					break;
				case 'html':
					el.innerHTML = attributes[attr];
					break;
				default:
					el.setAttribute(attr, attributes[attr]);
			}
		}
		start = 2;
	}
	for (var i = start; i < desc.length; i++) {
		if (isArray(desc[i])) el.appendChild(make(desc[i]));
		else el.appendChild(document.createTextNode(desc[i]));
	}
	return el;
}

// MAIN FUNCTION
function main() {

	// LEGACY FUNCTIONS - mostly legacy code, kept for posterity's sake
	function getDay(date) {
		d = date.substring(4)
		m = parseInt(d.substring(0,2))-1
		day = (m == 0) ? parseInt(d.substring(2)) : monthsDays.slice(0,m).reduce((accumulation, curVal)=> accumulation + curVal) + parseInt(d.substring(2))
		return day
	}
	function getMonth(date) {
		return date.substring(4,6);
	}

	// Gets the color range from a min and max color range
	function GetColorRange(r) {
		min = parseFloat(r[0]);
		max = parseFloat(r[1]);
		var color = d3.scaleLinear()
			.domain([min, (min+max)/2, max])
			.range(["blue", "yellow", "red"]);
		return color;
	}

	//Create SVG element and append map to the SVG
	svg = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height)
		.style("position","absolute")
		.style("left","50%")
		.style("top","50%")
		.style("transform","translate(-50%,-50%)");

	// Extract geojson data for map rendering
	d3.json("data/new-york-city-boroughs.geojson").then(function(geojson) {

		var center = d3.geoCentroid(geojson);
		projection.center(center);
		var path = d3.geoPath().projection(projection);

		// Print out the states onto the screen. Don't care about the colors at the moment, placeholder is white
		boroughs = svg.selectAll("path")
			.data(geojson.features)
			.enter()
			.append("path")
			.attr("d", path)
			.style("stroke", "#000")
			.style("stroke-width", "1")
			.style("fill", "#fff");

		// Extract each datafile for each month separately for memory's sake
		var promises = [];
		crimeSources.forEach((url)=>{
			//var link = "data/data_"+url+".json";
			promises.push(d3.csv(url))
		})

		// Call all promises
		Promise.all(promises).then(function(crimeData) {

			//console.log(crimeData);

			// Split data by year
			var yearlyData = crimeData[0].reduce((accumulation,c)=>{
				//console.log(crimeTypeData.length)
				//crimeTypeData.forEach(c => {
					var year = c["OCCUR_DATE"].split("/")[2];
					if (accumulation[year] == null) accumulation[year] = [];
					accumulation[year].push(c);
				//});
				return accumulation;
			},{});

			console.log(yearlyData);

			Object.keys(yearlyData).forEach( yr => {
				var newOption = make(["option",{"value":yr},yr]);
				yearSelect.appendChild(newOption);
			});


			function update(year) {

				if (Object.keys(yearlyData).indexOf(year) == -1) return;

				var thisYearData = yearlyData[year];

				circles = svg.selectAll("circle");
				var join = circles.data(thisYearData)
				var enter = join.enter()
				var exit = join.exit()

				enter.append("circle")
					//.attr("class", config.div_id+"_location_markers")
					//.attr("cx", function(d) { return projection([d[lon], d[lat]])[0]; })
					//.attr("cy", function(d) { return projection([d[lon], d[lat]])[1]; })
					.attr("transform", function(d) {return "translate(" + projection([d.Longitude,d.Latitude]) + ")";})
					.attr("r", 1);
					//.style("fill", function(d){ return location_color(d)});

				exit.remove();		
			}

			yearSelect.onchange = function() {
				update(this.value);
			}

			update(yearSelect.value);

			/*
			// Determine the color range for our map
			weatherColors = weatherData.reduce((accumulation,m)=>{
				maxTempRange = d3.extent(Object.values(m), d => d.TMAX);
				minTempRange = d3.extent(Object.values(m), d => d.TMIN);
				avgTempRange = d3.extent(Object.values(m), d => d.TAVG);
				accumulation = accumulation.concat(maxTempRange, minTempRange, avgTempRange);
				return accumulation
			},[]);
			weatherColorRange = GetColorRange(d3.extent(weatherColors));
			// Print our color range as a legend
			var colorLegend = d3.legendColor()
				.labelFormat(d3.format(".2f"))
				.scale(weatherColorRange)
				.shapePadding(10)
				.shapeWidth(30)
				.shapeHeight(30)
				.labelOffset(10);
			svg.append("g")
				.attr("transform","translate(50,50)")
				.call(colorLegend);

			// Update function - gets called whenever we want to update the map (aka whenever the user inputs the slider or dropdown)
			function update(monthIndex, tempIndex) {

				// Extract month and current temperature type from parameters
				var curMonth = monthCats[parseInt(monthIndex)];
				var curTempType = tempRanges[parseInt(tempIndex)]

				// Change the text on the screen below the slider to match the current month 
				monthLabel.innerText = monthMap[curMonth];

				// Fill the colors into each state based on the parameters
				states.style("fill", function(d) {
					if (!weatherData[monthIndex][d.properties.postal]) return "#000";
					return weatherColorRange(weatherData[monthIndex][d.properties.postal][curTempType]);
				});

			}

			// Linking variables to references of existing HTML elements + adding properties such as onchange or oninput functions to allow interactivity
			temperatureSelect = document.getElementById("tempTypeSelect");
			temperatureSelect.value = currentTempRange;
			temperatureSelect.onchange = function() {
				update(monthSlider.value, this.value)
			}
			monthLabel = document.getElementById("monthLabel");
			monthSlider = document.getElementById("chosenMonth");
			monthSlider.min = 0;
			monthSlider.max = weatherData.length-1;
			monthSlider.value = currentMonthCat;
			monthSlider.oninput = function() {
				update(this.value, temperatureSelect.value);
			}

			// Last thing: update the visualization given the current inputs' values (a sort of initial calling that populates the visualization upon loading)
			update(monthSlider.value, temperatureSelect.value);
			*/

		});

	});


	// BELOW IS LEGACY CODE - USED TO EXTRACT INFO FROM EACH MONTH AND STORE INTO NEW JSON FILES
	// KEPT FOR POSTERITY'S SAKE


	/*

	// load the weather data
	d3.csv("data/weather.csv", function(error_weather, data) {
		//color.domain([0,1,2,3]); // setting the range of the input data


		if (error_weather) {
			console.error(error_weather)
			return;
		}

		// Get temparature ranges for each temp category
		maxTempRange = d3.extent(data.filter(k=>k.TMAX!=null&&k.TMAX!=""), d => d.TMAX);
		minTempRange = d3.extent(data.filter(k=>k.TMIN!=null&&k.TMIN!=""), d => d.TMIN);
		avgTempRange = d3.extent(data.filter(k=>k.TAVG!=null&&k.TAVG!=""), d => d.TAVG);

		// Get color ranges for each temp category based on temp ranges
		maxTempColor = GetColorRange(maxTempRange);
		minTempColor = GetColorRange(minTempRange);
		avgTempColor = GetColorRange(avgTempRange);

		//var stateData = {}

		monthData = data.reduce(function(accumulator, current_row) {
			//m_raw = getMonth(current_row.date);
			//m = m_raw[0]
			m = getMonth(current_row.date);
			s = current_row.state;
			station = current_row.station;
			lat = current_row.latitude;
			lon = current_row.longitude;
			tmax = current_row["TMAX"]
			tmin = current_row["TMIN"]
			tavg = current_row["TAVG"]
			accumulator[m] = (accumulator[m] != null) ? accumulator[m] : {}
			accumulator[m][s] = (accumulator[m][s] != null) ? accumulator[m][s] : {"TAVG":-1,"TMAX":-1,"TMIN":-1,"STATIONS":{}}
			accumulator[m][s]["STATIONS"][station] = (accumulator[m][s]["STATIONS"][station] != null) ? accumulator[m][s]["STATIONS"][station] : {"latitude":lat,"longitude":lon,"tmax":0,"tmax_count":0,"tmin":0,"tmin_count":0,"tavg":0,"tavg_count":0}
			if (tmax != null && tmax != "") {
				accumulator[m][s]["STATIONS"][station]["tmax"] = (accumulator[m][s]["STATIONS"][station]["tmax"]*accumulator[m][s]["STATIONS"][station]["tmax_count"] + parseFloat(tmax)) / (accumulator[m][s]["STATIONS"][station]["tmax_count"]+1)
				accumulator[m][s]["STATIONS"][station]["tmax_count"] += 1
			}
			if (tmin != null && tmin != "") {
				accumulator[m][s]["STATIONS"][station]["tmin"] = (accumulator[m][s]["STATIONS"][station]["tmin"]*accumulator[m][s]["STATIONS"][station]["tmin_count"] + parseFloat(tmin)) / (accumulator[m][s]["STATIONS"][station]["tmin_count"]+1)
				accumulator[m][s]["STATIONS"][station]["tmin_count"] += 1
				//accumulator[m][s]["STATIONS"][station]["tmin"].push(tmin);
			}
			if (tavg != null && tavg != "") {
				accumulator[m][s]["STATIONS"][station]["tavg"] = (accumulator[m][s]["STATIONS"][station]["tavg"]*accumulator[m][s]["STATIONS"][station]["tavg_count"] + parseFloat(tavg)) / (accumulator[m][s]["STATIONS"][station]["tavg_count"]+1)
				accumulator[m][s]["STATIONS"][station]["tavg_count"] += 1
				//accumulator[m][s]["STATIONS"][station]["tavg"].push(tavg);
			}

			stateData[s] = (stateData[s] != null) ? stateData[s] : {"TAVG":-1,"TMAX":-1,"TMIN":-1,"STATIONS":{}}
			stateData[s]["STATIONS"][station] = (stateData[s]["STATIONS"][station] != null) ? stateData[s]["STATIONS"][station] : {"latitude":lat,"longitude":lon,"tmax":0,"tmax_count":0,"tmin":0,"tmin_count":0,"tavg":0,"tavg_count":0}
			if (tmax != null && tmax != "") {
				stateData[s]["STATIONS"][station]["tmax"] = (stateData[s]["STATIONS"][station]["tmax"]*stateData[s]["STATIONS"][station]["tmax_count"] + parseFloat(tmax)) / (stateData[s]["STATIONS"][station]["tmax_count"]+1)
				stateData[s]["STATIONS"][station]["tmax_count"] += 1
			}
			if (tmin != null && tmin != "") {
				stateData[s]["STATIONS"][station]["tmin"] = (stateData[s]["STATIONS"][station]["tmin"]*stateData[s]["STATIONS"][station]["tmin_count"] + parseFloat(tmin)) / (stateData[s]["STATIONS"][station]["tmin_count"]+1)
				stateData[s]["STATIONS"][station]["tmin_count"] += 1
			}
			if (tavg != null && tavg != "") {
				stateData[s]["STATIONS"][station]["tavg"] = (stateData[s]["STATIONS"][station]["tavg"]*stateData[s]["STATIONS"][station]["tavg_count"] + parseFloat(tavg)) / (stateData[s]["STATIONS"][station]["tavg_count"]+1)
				stateData[s]["STATIONS"][station]["tavg_count"] += 1
			}

			return accumulator;
		},{});

		Object.keys(monthData).forEach(m_key=>{
			Object.values(monthData[m_key]).forEach(s=>{
				stations = Object.values(s["STATIONS"]);
				s["TAVG"] = d3.mean(stations, st=>st["tavg"])
				s["TMIN"] = d3.mean(stations, st=>st["tmin"])
				s["TMAX"] = d3.mean(stations, st=>st["tmax"])
			});
			//var blob = new Blob([JSON.stringify(monthData[m_key])], {type: "text/plain;charset=utf-8"});  
			//saveAs(blob, "data/"+m_key+".json");
		});
	
		//console.log(maxTempRange, minTempRange, avgTempRange, monthData);
	

		// Load GeoJSON data, render the map
		/*
		d3.json("data/us-states.geojson", function(error_geo, json) {

			//console.log(json)
			if (error_geo) {
				console.error(error_geo);
				return;
			}

			svg.selectAll("path")
				.data(json.features)
				.enter()
				.append("path")
				.attr("d", path)
				.style("stroke", "#000")
				.style("stroke-width", "1")
				.style("fill", "#fff")

			function update(m,t) {
				var curMonth = monthCats[parseInt(m)];
				var curTempType = tempRanges[parseInt(t)]

				var paths = svg.selectAll("path")
				var join = paths.data(json.features)
				var enter = join.enter()
				var exit = join.exit()

				enter.append("path")
					.attr("d", path)
					.style("stroke", "#000")
					.style("stroke-width", "1")
					.style("fill", (d)=>{
						postal = d.properties.postal;
						if (postal) {
							if (monthData[curMonth][postal] != null) {
								if (curTempType == "tmin") {
									//console.log(minTempColor(monthData[curMonth][postal]["TMIN"]));
									return minTempColor(monthData[curMonth][postal]["TMIN"]);
								} else if (curTempType == "tmax") {
									//console.log(maxTempColor(monthData[curMonth][postal]["TMAX"]));
									return maxTempColor(monthData[curMonth][postal]["TMAX"])
								} else if (curTempType == "tavg") {
									//console.log(avgTempColor(monthData[curMonth][postal]["TAVG"]));
									return avgTempColor(monthData[curMonth][postal]["TAVG"])
								} else {
									return "#80080";
								}
							} else {
								return "#d3d3d3";
							}
						} else {
							return "#000";
						}
					});
					//.style("fill", "#fff")
				exit.remove();
				//.data(json.features)
				//.enter()
				//.append("path")
				//.attr("d", path)
				//.style("stroke", "#000")
				//.style("stroke-width", "1")
				//.style("fill", "#fff")

				console.log("recolor at:" + curMonth + " with temp range at :" + curTempType)


			}

			slider = document.getElementById("chosenMonth");
			slider.min = 0;
			slider.max = Object.keys(monthData).length;
			slider.value = currentMonthCat;
			slider.onchange = function() {
				update(this.value, currentTempRange);
			}

			update(currentMonthCat, currentTempRange);

		

			/*
			// Loop through each state data value in the .csv file
			for (var i = 0; i < data.length; i++) {

				// Grab State Name
				var dataState = data[i].state;

				// Grab data value 
				var dataValue = data[i].visited;

				// Find the corresponding state inside the GeoJSON
				for (var j = 0; j < json.features.length; j++)  {
					var jsonState = json.features[j].properties.name;

					if (dataState == jsonState) {

					// Copy the data value into the JSON
					json.features[j].properties.visited = dataValue; 

					// Stop looking through the JSON
					break;
					}
				}
			}
			*/
				
			/*
			// Bind the data to the SVG and create one path per GeoJSON feature
			svg.selectAll("path")
				.data(json.features)
				.enter()
				.append("path")
				.attr("d", path)
				.style("stroke", "#000")
				.style("stroke-width", "1")
				.style("fill", "#fff")
				//.style("fill", function(d) {
					// Get data value
				//	var value = d.properties.visited;

					//if (value) {
						//If value exists…
					//	return color(value);
					//} else {
						//If value is undefined…
					//	return "rgb(213,222,217)";
					//}
				//});
				
			/*
			function update() {

				var currentMonth = document.getElementById("chosenDay").value;
				month_data = data.filter(function filterByDay(d){ return d.dmo == currentMonth && availableStates.includes(d.state) })
				circles = svg.selectAll("circle")
				var join = circles.data(month_data)
				var enter = join.enter()
				var exit = join.exit()

				enter.append("circle")
					//.attr("class", config.div_id+"_location_markers")
					//.attr("cx", function(d) { return projection([d[lon], d[lat]])[0]; })
					//.attr("cy", function(d) { return projection([d[lon], d[lat]])[1]; })
					.attr("transform", function(d) {return "translate(" + projection([d.longitude,d.latitude]) + ")";})
					.attr("r", 2);
					//.style("fill", function(d){ return location_color(d)});

				exit.remove();		
					//.select("circle")
					//.attr("transform", function(d) {return "translate(" + projection([d.longitude,d.latitude]) + ")";});
			}

			/*
			svg.selectAll("circle")
				.data(data.filter(function (d) { 
					//return d.state == "NY"
					return d.dday == currentDay && availableStates.includes(d.state)
				}))
				.enter()
				.append("circle")
				.attr("r",3)
				.attr("transform", function(d) {return "translate(" + projection([d.longitude,d.latitude]) + ")";});
			*/

			/*
			d3.select("#chosenDay").on("change", function(d) {
				update(this.value)
			})

			update()
			*/

			/*
			svg.append("input")
				.attr("type", "range")
				.attr("min", 1)
				.attr("max", 365)
				.attr("step", "1")
				.attr("id", "chosenDay")
				.on("input", function input() {
					update()
				});
			//document.getElementById("chosenDay").value = currentDay;
			*/



			/*
			var slider = d3
				.sliderBottom()
				.min(0)
				.max(365)
				.step(1)
				.width(300)
				.ticks(0)
				.displayValue(false)
				.on('onchange', num => {

					//rgb[i] = num;
					//blob.style.fill = `#${num2hex(rgb)}`;
				});
			*/
		/*
		});
		*/
	//});
}

// Function call :)
main();