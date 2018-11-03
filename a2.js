/*
 * Alec Bonnell
 * CIS 468 Assignment 2
 * 10/13/18
 */

function getTotals(data) {
	// get age ranges from first item (same for each item in the array)
	ranges = Object.keys(data[0]).filter(d => d != "day");
	return data.map(function(d) { 
	return {"day": d.day,
		"total": ranges.reduce(function(t, s) { return t + d[s]; }, 0)};
	});
}


function makeBar(data) {
	totals = getTotals(data);
	//console.log("Totals:", totals);
	
	//Set margins and SVG size
	var axesMargin = {x: 20, y:20}; //Margins for axes titles
	var margin = {top: 20, right: 20, bottom: (20 + axesMargin.x), left: (40 + axesMargin.y)}; //Create the margins
	var width = 800; //Create the svg width
	var height = 400; //Create the svg height
	
	//x-axis scale: days
	var dayScale = d3.scaleBand() //Create the x-axis as a scaleBand
		.range([0, width - margin.left - margin.right]) //Set the range to the length of the bar chart
		.domain(totals.map(d => d.day)) //Set the domain as the days of the data
		.paddingInner(0.1); //Add a distance between the bars
	
	//y-axis scale: totals
	var totalScale = d3.scaleLinear() //Create the y-axis as a scaleLinear
		.range([height - margin.top - margin.bottom, 0]) //Set the range to the height of the bar chart
		.domain([0, d3.max(totals.map(d => d.total))]); //Set the domain as the day of the data
	
	//svg element
	var svg = d3.select("#bar").append("svg") //Create svg element
		.attr("width", width) //Set svg width
		.attr("height", height) //Set svg height
		.append("g") //Create a group for the bar chart
			.attr("transform", "translate("+margin.left+", "+margin.top+")"); //Translate the amount of the margins
	
	//bar creation
	svg.selectAll(".b") //Select all "b" classes
		.data(totals) //Bind the data to the d3 elements
		.enter().append("rect") //Create rectangle elements for the bars
			.attr("class", "b") //Give all the bars the class "b"
			.attr("x", d => dayScale(d.day)) //Set the x-value
			.attr("width", dayScale.bandwidth()) //Set the width of the bar from the calculated value
			.attr("y", d => totalScale(d.total)) //Set the y-value
			.attr("height", d => height - margin.top - margin.bottom - totalScale(d.total)); //Set the height of the bar
	
	//x-axis creation
	svg.append("g") //Add x-axis to group
		.attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")") //Translate the axis to the bottom of the chart
		.call(d3.axisBottom(dayScale)); //Set the values of the axis
	svg.append("text") //Add a text element for the axis label
		.attr("class", "axis") //Set the class to "axis" for styling
		.attr("transform", "translate(" + ((width-margin.left - margin.right)/2) + ", " + (height - axesMargin.x - 10) + ")") //Translate to the bottom middle of the axis
		.text("Day"); //Set the text
	
	//y-axis creation
	svg.append("g") //Add y-axis to group
		.call(d3.axisLeft(totalScale)); //Set the values of the axis
	svg.append("text") //Add a text element for the axis label
		.attr("class", "axis") //Set the class to "axis" for styling
		.attr("transform", "rotate(-90)") //Rotate the text to align it with the axis
		.attr("y", 0 - axesMargin.y - 25) //Set the text to the correct y-location
		.attr("x", 0 - ((height - margin.top - margin.bottom)/2)) //Set the text to the correct x-location
		.text("Number of Bike Trips"); //Set the text
}

function makeStacked(data) {
	console.log("Data:", data);
	
	var svgWidth = 800; //The width of the svg element
	var svgHeight = 400; //The height of the svg element
	var margin = {top: 20, bottom: 40, left: 60, right: 60}; //The margins around the bar chart
	var d3Width = svgWidth - margin.left - margin.right; //The width of the bar chart
	var d3Height = svgHeight - margin.top - margin.bottom; //The height of the bar chart
	
	//Function to create a 70+ key
	function editData(data){
		var newData = data.forEach(function(d,i) {
			var total = d["70"] + d["80"] + d["90"] + d["100"] + d["110"] + d["120"] + d["130"];
			data[i] = {"10":d["10"], "20":d["20"], "30":d["30"], "40":d["40"], "50":d["50"], "60":d["60"], "70+":total, "day":d["day"]};
		});
		return data;
	}
	
	data = editData(data); //Edit the data to have the 70+ set
	
	//x-axis scale: days
	var dayScale = d3.scaleBand() //Create the x-axis as a scaleBand
		.range([0, d3Width]) //Set the range to the length of the bar chart
		.domain(data.map(d => d.day)) //Set the domain as the days of the data
		.paddingInner(0.1); //Add a distance between the bars
	
	//y-axis scale: totals
	var totalScale = d3.scaleLinear() //Create the y-axis as a scaleLinear
		.range([d3Height, 0]) //Set the range to the height of the bar chart
		.domain([0, d3.max(getTotals(data).map(d => d.total))]); //Set the domain as the day of the data
	
	//Color scale
	var colorScale = d3.scaleOrdinal() //Create the color scale as a scaleOrdinal
		.range(["#80080","#b300b3","#e600e6","#ff33ff","#ff66ff","#ff99ff", "#ffccff"]); //Set the colors
	
	//svg element
	var svg = d3.select("#stacked").append("svg") //Create svg element
		.attr("width", svgWidth) //Set svg width
		.attr("height", svgHeight) //Set svg height
		.append("g") //Create a group for the bar chart
			.attr("transform", "translate("+margin.left+", "+margin.top+")"); //Translate the amount of the margins
	
	var stack = d3.stack() //Create the stack
		.keys(["10","20","30","40","50","60","70+"]); //Set the keys for the stack
	
	//Stacked bar chart
	svg.append("g").selectAll("g") //Make a new group in the svg for the bar layers
		.data(stack(data)) //Set the data to the stack
		.enter().append("g") //Add another group for coloring
			.style("fill", d => colorScale(d.key)) //Set the color
			.attr("data-legend", d => d.key)
			.selectAll("rect") //Get all rectangle elements
			.data(d => d) //Set the data for each rectangle
			.enter().append("rect") //Make new rectangle with the data
				.attr("x", (d, i) => dayScale(i+1)) //Set the x-value
				.attr("y", d => totalScale(d[1])) //Set the y-value
				.attr("height", d => (totalScale(d[0]) - totalScale(d[1]))) //Set the height of the bar
				.attr("width", dayScale.bandwidth()); //Set the width of the bar
	
	//x-axis creation
	svg.append("g") //Add x-axis to group
		.attr("transform", "translate(0," + (svgHeight - margin.top - margin.bottom) + ")") //Translate the axis to the bottom of the chart
		.call(d3.axisBottom(dayScale)); //Set the values of the axis
	svg.append("text") //Add a text element for the axis label
		.attr("class", "axis") //Set the class to "axis" for styling
		.attr("transform", "translate(" + ((svgWidth-margin.left - margin.right)/2) + ", " + (svgHeight - margin.bottom + 10) + ")") //Translate to the bottom middle of the axis
		.text("Day"); //Set the text
	
	//y-axis creation
	svg.append("g") //Add y-axis to group
		.call(d3.axisLeft(totalScale)); //Set the values of the axis
	svg.append("text") //Add a text element for the axis label
		.attr("class", "axis") //Set the class to "axis" for styling
		.attr("transform", "rotate(-90)") //Rotate the text to align it with the axis
		.attr("y", 0 - 45) //Set the text to the correct y-location
		.attr("x", 0 - ((svgHeight - margin.top - margin.bottom)/2)) //Set the text to the correct x-location
		.text("Number of Bike Trips"); //Set the text

	//Could not create the legend :(
	
}

function makeCharts(data) {
	makeBar(data);
	makeStacked(data);
}

d3.json("https://cdn.rawgit.com/dakoop/722724236876db13af3c7f3f11e7eee4/raw/3ee1a9c3085d8e2318e4a7374b6b97231cd69b6c/bikeData.json").then(makeCharts);