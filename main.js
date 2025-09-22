
// **********************************************************************************
// ************************ BEGINNING OF THE COUNTY LEVEL ***************************
// **********************************************************************************

// set padding/margin for the svg
var margin = {top: 25, right: 50, bottom: 25, left: 50}

// set arbritary values to determine if this website is going mobile or not
var mobiledefaultwidth = 780,
	mobiledefaultheight = 480;
	
// colors for the chart and map
var c = ["#98abc5", "#8a89a6", "#a05d56", "#ff8c00"]
	
// set the color scale
var color = d3.scaleOrdinal()
    .range(c);

// open d3.js bracket
// bind the data file, assign raw_data as the data array, and run the two draw functions
d3.csv("data/ccps_data.csv").then(function(csv_file){

	csv_file.forEach(function(d) {
		d.white = +d.white
		d.black = +d.black
		d.other = +d.other
		d.hispanic = +d.hispanic
		d.total = (+d.white) + (+d.black) + (+d.other) + (+d.hispanic)
	});
	raw_data = csv_file;
	
	drawSummaryChart();
	drawDetailMap();

}).catch(function(error) {
	console.error("Error loading data:", error);
});

function drawSummaryChart() {

	//var browserwidth = d3.select("#g-stacked-bar-chart").node().clientWidth,
	var	browserwidth = parseInt(d3.select('#g-stacked-bar-chart').style('width'), 10),
		height = 400 - margin.top - margin.bottom;

	if ($(window).width() < mobiledefaultwidth) {
		var width = browserwidth;
	}
	else {
		var width = browserwidth - margin.left - margin.right;
	}

	// set the ranges
	var x = d3.scaleBand()
	    .rangeRound([0, (width - (margin.right))])
	    .padding(0.2);
						
	var y = d3.scaleLinear()
		.rangeRound([height, 0]);
		
	// define the axes	
	var xAxis = d3.axisBottom()
		.scale(x);
		//.tickFormat(d3.timeFormat("%H"));

	var yAxis = d3.axisLeft()
		.scale(y);
	
	// remove old svg if any -- otherwise resizing adds a second one
 	d3.select('svg').remove();
	
	// adds the svg canvas to the g-stacked-bar-chart div
	var svg = d3.select("#g-stacked-bar-chart")
		.append("svg")
			//.attr("width", width + margin.left + margin.right)
			.attr("width", "100%")
			.attr("height", height + (margin.top * 3))
		.append("g")
			.attr("transform", 
				"translate(" + margin.left + "," + margin.top + ")");

	// roll the raw data up by year and return the summarized value by race as its own object property
	var grouped = d3.group(raw_data, function(d) {return d.short_year;});
	var data = Array.from(grouped.entries())
		.sort(function(a, b) {return d3.ascending(a[0], b[0]);})
		.map(function(d) {
			var yearData = d[1];
			return {
				year: d[0],
				white: d3.sum(yearData, function(g) {return g.white;}),
				black: d3.sum(yearData, function(g) {return g.black;}),
				other: d3.sum(yearData, function(g) {return g.other;}),
				hispanic: d3.sum(yearData, function(g) {return g.hispanic;})
			};
		});

	// assign color to each of the race by grabbing the first object in the data set
	color.domain(Object.keys(data[0]).filter(function(key) { return key !== "year"; }));

	// by year, get the sum and map each race to a block of color
	data.forEach(function(d) {
		var y0 = 0;
		var summarymax = d.white + d.black + d.other + d.hispanic
		d.group = color.domain().map(function(name) { return {year: d.year, name: name, summarymax: summarymax, y0: y0, y1: y0 += +d[name]}; });
		d.total = d.group[d.group.length - 1].y1;
	});

	// set the x and y domain based on the year and total, respectively
	x.domain(data.map(function(d) { return d.year; }));
	y.domain([0, d3.max(data, function(d) { return d.total; })]);
	

	var group = svg.selectAll(".group")
		.data(data)
	.enter().append("g")
		.attr("class", "g")
		.attr("transform", function(d) { return "translate(" + x(d.year) + ",0)"; });

	// draw the chart on the svg using the d.group data set
	group.selectAll("rect")
		.data(function(d) { return d.group; })
	.enter().append("rect")
		.attr("width", x.bandwidth())
		.attr("y", function(d) { return y(d.y1); })
		.attr("height", function(d) { return y(d.y0) - y(d.y1); })
		.attr("class", "background")
		.style("fill", function(d) { return color(d.name); })
		.attr("title", function (d) {
			var c = color(d.name);
			// added a span class to fix the width of the tooltip and made it an inline-block (css)
			var tip = '<span class="summary-tooltip">' 
				+ '<p class="tip3"> School Year: ' + d.year + '</p>'
				+ '<p class="tip3"> Student Body #: ' + d.summarymax + '</p>'
				+ '<p class="tip3"> -------------------------- </p>'
				+ '<p class="tip3"> Race/Ethnicity: <span style="color:' + c + '"> ' + d.name + '</p>' 
				+ '<p class="tip1"> # of Students: <span style="color:' + c + '"> ' + d3.format(",")(d.value ? d.value: d.y1 - d.y0) + '</p>'
				+ '<p class="tip1"> % of Students: <span style="color:' + c + '"> ' + d3.format(".2%")(d.value ? d.value: (d.y1 - d.y0)/d.summarymax) + '</p>'
				+ '</span>'
				return tip;
			});
						

	if ($(document).width() < mobiledefaultwidth) {
		// draw the legend
    	// small screen, move the legend to the bottom and set it at start of x-axis
    	var svgwidth = $('#g-stacked-bar-chart').width();

		var legend = svg.selectAll(".legend")
			.data(color.domain().slice())
		.enter().append("g")
			.attr("class", "legend")
			.attr("transform", function(d, i) {return "translate(" + (svgwidth - 230) + "," + (height + (margin.bottom * 1.5)) + ")";});
			//.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
    	
    	legend.append("rect")
			.attr("x", function(d, i) {return i * 37 + 25;})
			.attr("width", 8)
			.attr("height", 8)
			.style("fill", color);

		legend.append("text")
			.attr("x", function(d, i) {return i * 37 + 34;})
			.attr("y", 4)
			.attr("dy", ".35em")
			.style("text-anchor", "start")
			.text(function(d) { return d; });

		// draw the x-axis on the svg, rotate text to 45 degrees on mobile
		svg.append("g")
			.attr("class", "x axis")
			.attr("id", "xaxis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)        
			.selectAll("text")
				.style("text-anchor", "start")
				.attr("dx", ".8em")
				.attr("dy", ".15em")
				.attr("transform", function(d) {
					return "rotate(45)" 
					});

		// draw the y-axis on the svg, text on the outside on y-axis at middle
		svg.append("g")
			.attr("class", "y axis")
			.attr("id", "yaxis")
			.call(yAxis)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", -50)
			.attr("dx","-19em")
			.attr("dy", ".71em")
			.style("text-anchor", "middle")
			.text("Student Population (#)");

		// define tooltips to work with the stacked bar chart (above)	
		tippy('svg rect', {
			content(reference) {
				return reference.getAttribute('title');
			},
			allowHTML: true,
			placement: 'auto', 
			theme: 'light-border',
			arrow: true,
			maxWidth: 250, // Your old autoBoundsCustom width
			hideOnClick: false,
			trigger: 'mouseenter focus'
		});
	}
	else {
		// draw the legend
		// regular screen, move the legend to the upper right of svg
		var legend = svg.selectAll(".legend")
			.data(color.domain().slice().reverse())
		.enter().append("g")
			.attr("class", "legend")
			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
    	
    	legend.append("rect")
			.attr("x", width - 12)
			.attr("width", 18)
			.attr("height", 18)
			.style("fill", color);

		legend.append("text")
			.attr("x", width - 15)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text(function(d) { return d; });

		// draw the x-axis on the svg, text is horizontal on regular screen
		svg.append("g")
			.attr("class", "x axis")
			.attr("id", "xaxis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)        
			.selectAll("text");

		// draw the y-axis on the svg, text on the inside of y-axis at top
		svg.append("g")
			.attr("class", "y axis")
			.attr("id", "yaxis")
			.call(yAxis)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 3)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Student Population (#)");


		// define tooltips to work with the stacked bar chart (above)	
		tippy('svg rect', {
			content(reference) {
				return reference.getAttribute('title');
			},
			allowHTML: true,
			placement: 'auto',
			theme: 'light-border',
			arrow: true,
			maxWidth: 250, // Your old autoBoundsCustom width
			hideOnClick: false,
			trigger: 'mouseenter focus'
		});
	}

	// redraw the svg if user resizes the browser window
	d3.select(window).on('resize', drawSummaryChart); 

} // close the drawSummaryChart function	

// **********************************************************************************
// *************************** END OF THE COUNTY LEVEL ******************************
// **********************************************************************************





// **********************************************************************************
// ************************ BEGINNING OF THE SCHOOL LEVEL ***************************
// **********************************************************************************

function drawDetailMap() {

	// sub function to get unique list of school and the first record for each school (before array)
	function reformat (array) {

		var lookup = {};
		var schools = [];

		for (var item, i = 0; item = array[i++];) {
			var id = item.school_id;

			if (!(id in lookup)) {
			lookup[id] = 1;
			schools.push({
				school_id: item.school_id,
				info: {
					name: item.school,
					address: item.address,
					city: item.city,
					state: item.state,
					zip: item.zip,
					level: item.level,
					lat: +item.latitude,
					lon: +item.longitude
				},
				before: [{
					short_year: item.short_year,
					white: item.white,
					black: item.black,
					other: item.other,
					hispanic: item.hispanic,
					total: item.total
				}]
				});
			}
		}
		// Debug: Check your data structure
		console.log("Array length:", array.length);
		console.log("First few items:", array.slice(0, 3));
		console.log("Items with undefined short_year:", array.filter(function(d) { return !d.short_year; }));

		// Check what short_year values exist in your data
		var availableYears = _.chain(array)
		.map('short_year')
		.uniq()
		.sort()
		.value();
		console.log("Available years:", availableYears);
		
		// Safe version that handles undefined/null values
		var after = _.chain(array)
			.filter(function(d) { 
				return d && d.short_year && d.short_year === "14-15"; 
			})
			.map(function(d) {
				return {
					school_id: d.school_id,
					short_year: d.short_year,
					white: d.white,
					black: d.black,
					other: d.other,
					hispanic: d.hispanic,
					total: d.total
				};
			})
			.value();

			// Join operation (same as before)
			var BeforeAfterDataSet = _.map(schools, function(school) {
				var matchingAfter = _.find(after, { school_id: school.school_id });
				return _.assign({}, school, {
					after: matchingAfter ? [matchingAfter] : [] // Always return an array, empty if no match
				});
			});

		return BeforeAfterDataSet;
 	} 

 	// run the reformat function on the raw data to transform data for the leaflet part
 	var school_data = reformat(raw_data);


	// Set the map's boundaries  
	// SW 37.2304,-80.429 (Blacksburg) ; NE 40.217,-74.774 (Trenton) ; C 38.527515, -76.971666 (La Plata)

	var southWest = new L.LatLng(37.2304, -80.429),
		northEast = new L.LatLng(40.217, -74.774),
		bounds = new L.LatLngBounds(southWest, northEast);

	var minZ = 9,
		maxZ = 17;

	// build the map in the map-container div
	var $map = new L.Map('map', {
		center: new L.LatLng(38.527515, -76.971666),
		zoom: 10,
		minZoom: minZ,
		maxZoom: maxZ,
		maxBounds: bounds,
		touchZoom: false,
		doubleClickZoom: false,
		tapTolerance: 30
	});

	var url = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var attrib ='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
	var layer = new L.TileLayer(url, {minZoom: minZ, maxZoom: maxZ, attribution: attrib});		

	// add the OSM layer on top of the Leaflet Map
	$map.addLayer(layer);

	// function for background color on the dots in the map, based on the school level
	function getSchoolLevel(array) {
		if (array.info.level == 'E') {
			// brown
			school_colors = '#A34E24'
		}
		else if (array.info.level == 'M') {
			// orange
			school_colors = '#EA7D24'
		}
		else if (array.info.level == 'H') {
			// green
			school_colors = '#796E24'
		}
		else {
			// purple
			school_colors = '#9B539C'
		}
		return school_colors;
	}

	// function to set position of hover box on map points
	function getPosition(event) {
		posX = event.clientX;
		posY = event.clientY;
		$('#map-hover-box').css({
			'left': posX - ($('#map-hover-box').outerWidth(true) / 2),
			'top': posY + 15
		});
	}

	// function to show hover box on hover of map points
	function initHover() {
		$('#map-hover-box').show();
		$(document).bind('mousemove', getPosition);
	}

	// function to hide hover box on hover of map points
	function endHover() {
		$('#map-hover-box').hide();
		$(document).unbind('mousemove', getPosition);
	}

	// dummy dot to just create the variable
	dot = L.CircleMarker.extend([0, 0], {
		options: {
			id: ''
		}		
	});

	//dummy zoom dot to just create the variable
	zoomDot = new L.CircleMarker([0, 0], {
		stroke: true,
		color: '#000',
		weight: 4,
		opacity: 1,
		fillOpacity: '0',
		SVG: true,
		VML: true,
		radius: 10,
	}).addTo($map);

	// place a dot on the map and add an item in the list for each school in the school_data var, include tooltip and jQuery triggers
	$.each(school_data, function(i) {
		if (school_data[i].info) {
			$school = new dot([school_data[i].info.lat, school_data[i].info.lon], {
				stroke: true,
				color: '#222',
				weight: 1,
				opacity: 1,
				//fillColor: '#777',
				fillColor: getSchoolLevel(school_data[i]),
				fillOpacity: '0.9',
				SVG: true,
				VML: true,
				radius: 5,
				id: i
			}).on('click', function() {
				$('#' + i).trigger('click');
			}).on('tap', function() {
				$('#' + i).trigger('click');
			}).on('mouseover', function(e) {
				initHover();
				layer = e.target;
				layer.setStyle({
					weight: 3,
					color: '#000'
				});
				layer.bringToFront();
				$('#map-hover-box').html("<b>" + school_data[i].info.name + "</b><br>"
						 + school_data[i].info.address + "<br>" 
						 + school_data[i].info.city + ", " + school_data[i].info.state + "&nbsp" + school_data[i].info.zip + "<br>");
			}).on('mouseout', function(e) {
				var layer = e.target;
				layer.setStyle({
					weight: 1,
					color: '#222'
				});
				layer.bringToBack();
				endHover();
			}).addTo($map);

			$('#school-list > ul').append('<li class = "school-listing" id="' + i + '"><h5 class = "upper ral heavier black">' + school_data[i].info.name + '</h5></li>')
		}
	});

	// display before/after data on the school when a dot is clicked or the school on the list is clicked
	$('.school-listing').click(function() {
		if ( $(this).hasClass('selected-school') ) {
			return false
		}
		$('.school-listing .inner').remove()
		$('.school-listing').removeClass('selected-school');
		$(this).addClass('selected-school');
	
		i = $(this).attr('id')
		zoomCoordinates = [school_data[i].info.lat, school_data[i].info.lon]
		zoomDot.setLatLng(zoomCoordinates);
		$map.setView(zoomCoordinates, 12)
	
		// Check if we have complete data for this school
		var hasBefore = school_data[i].before && school_data[i].before[0];
		var hasAfter = school_data[i].after && school_data[i].after[0];
	
		var tableContent = '';
		
		if (hasBefore && hasAfter) {
			// Complete data - show full comparison
			tableContent = 
				'<table>'
					+ '<tr class = "heavier">'
						+ '<td> Year </td> <td> White </td> <td> Black </td> <td> Other </td> <td> Hispanic </td> <td> Total </td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td>' + school_data[i].before[0].short_year + ' (#) </td>' 				
						+ '<td class = "white"> ' + school_data[i].before[0].white + '</td>' 
						+ '<td class = "black"> ' + school_data[i].before[0].black + '</td>' 
						+ '<td class = "other"> ' + school_data[i].before[0].other + '</td>'
						+ '<td class = "hispanic"> ' + school_data[i].before[0].hispanic + '</td>' 
						+ '<td> ' + school_data[i].before[0].total + '</td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td>' + school_data[i].before[0].short_year + ' (%) </td>' 				
						+ '<td class = "white"> ' + ((school_data[i].before[0].white / school_data[i].before[0].total) * 100).toFixed(2) + '% </td>' 
						+ '<td class = "black"> ' + ((school_data[i].before[0].black / school_data[i].before[0].total) * 100).toFixed(2) + '% </td>' 
						+ '<td class = "other"> ' + ((school_data[i].before[0].other / school_data[i].before[0].total) * 100).toFixed(2) + '% </td>'
						+ '<td class = "hispanic"> ' + ((school_data[i].before[0].hispanic / school_data[i].before[0].total) * 100).toFixed(2) + '% </td>' 
						+ '<td> &nbsp; </td>'
					+ '</tr>'
					+ '<tr><td colspan=6>&nbsp;</td></tr>'
					+ '<tr>'
						+ '<td>' + school_data[i].after[0].short_year + ' (#) </td>' 				
						+ '<td class = "white"> ' + school_data[i].after[0].white + '</td>' 
						+ '<td class = "black"> ' + school_data[i].after[0].black + '</td>' 
						+ '<td class = "other"> ' + school_data[i].after[0].other + '</td>'
						+ '<td class = "hispanic"> ' + school_data[i].after[0].hispanic + '</td>' 
						+ '<td> ' + school_data[i].after[0].total + '</td>'
					+ '</tr>' 
					+ '<tr>'
						+ '<td>' + school_data[i].after[0].short_year + ' (%) </td>' 				
						+ '<td class = "white"> ' + ((school_data[i].after[0].white / school_data[i].after[0].total) * 100).toFixed(2) + '% </td>' 
						+ '<td class = "black"> ' + ((school_data[i].after[0].black / school_data[i].after[0].total) * 100).toFixed(2) + '% </td>' 
						+ '<td class = "other"> ' + ((school_data[i].after[0].other / school_data[i].after[0].total) * 100).toFixed(2) + '% </td>'
						+ '<td class = "hispanic"> ' + ((school_data[i].after[0].hispanic / school_data[i].after[0].total) * 100).toFixed(2) + '% </td>' 
						+ '<td> &nbsp; </td>'
					+ '</tr>'					
				+ '</table>';
		} else if (hasBefore && !hasAfter) {
			// Only "before" data available
			tableContent = 
				'<table>'
					+ '<tr class = "heavier">'
						+ '<td> Year </td> <td> White </td> <td> Black </td> <td> Other </td> <td> Hispanic </td> <td> Total </td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td>' + school_data[i].before[0].short_year + ' (#) </td>' 				
						+ '<td class = "white"> ' + school_data[i].before[0].white + '</td>' 
						+ '<td class = "black"> ' + school_data[i].before[0].black + '</td>' 
						+ '<td class = "other"> ' + school_data[i].before[0].other + '</td>'
						+ '<td class = "hispanic"> ' + school_data[i].before[0].hispanic + '</td>' 
						+ '<td> ' + school_data[i].before[0].total + '</td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td>' + school_data[i].before[0].short_year + ' (%) </td>' 				
						+ '<td class = "white"> ' + ((school_data[i].before[0].white / school_data[i].before[0].total) * 100).toFixed(2) + '% </td>' 
						+ '<td class = "black"> ' + ((school_data[i].before[0].black / school_data[i].before[0].total) * 100).toFixed(2) + '% </td>' 
						+ '<td class = "other"> ' + ((school_data[i].before[0].other / school_data[i].before[0].total) * 100).toFixed(2) + '% </td>'
						+ '<td class = "hispanic"> ' + ((school_data[i].before[0].hispanic / school_data[i].before[0].total) * 100).toFixed(2) + '% </td>' 
						+ '<td> &nbsp; </td>'
					+ '</tr>'
					+ '<tr><td colspan=6><em>No comparison data available for 14-15</em></td></tr>'
				+ '</table>';
		} else {
			// No data available
			tableContent = '<p><em>No demographic data available for this school.</em></p>';
		}
	
		$(this).append (
			'<div class = "inner upper ral normal black">' 
				+ school_data[i].info.address + ', ' + school_data[i].info.city + ', ' + school_data[i].info.state + '&nbsp;' + school_data[i].info.zip + '<br/>'
				+ '<br/>'
				+ tableContent		
			+ '</div>'
		)
	
		$('.selected-school')[0].scrollIntoView()
		$('#school-list').scrollTop($('#school-list').scrollTop() - 33)
		$(document).scrollTop($(document).scrollTop() - 120)
	})
} // closes the draw function

