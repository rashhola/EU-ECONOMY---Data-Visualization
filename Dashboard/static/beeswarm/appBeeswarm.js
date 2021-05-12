
// User-controled variables.
let USER_YEAR = 2019,
	PAUSED = false;
d3.select("#curryear").text(USER_YEAR);

	
// Node spacing.
const padding = 3; // Space between nodes
      
	 
// Dimensions of chart.
let margin = { top: 20, right: 8, bottom: 50, left: 55 },
      width = parseInt(d3.select('#chart').style('width'), 10) - margin.left - margin.right,
      height = 900 - margin.top - margin.bottom; 

// Creates & appends svg object "chart" & "y-axis" with above dimensions
let svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

var yaxisGroup = svg.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let simulation;


// Scales: Radius and y
let r = d3.scaleSqrt()
	.domain([0, 12000])
	.range([0, 20]);

// y: Greece is max (23.54 in 2016),set y-axis max to 25
let y = d3.scaleLinear()
	.domain([0, 25])
	.range([height, 0]);
	
	
// y-axis
let yAxis = d3.axisLeft(y)
	.tickFormat(d => d + "%")
	.tickSize(8)
	.tickPadding(5);
var yAxisEl = yaxisGroup.append("g")
	.attr("class", "y axis left")
yAxisEl.append("text")
	.attr("class", "axistitle")
	.attr("x", -y(16)).attr("y", -36)
    .attr("dx", "4px")
    .attr("dy", "-1em")
    .style("text-anchor", "end")
    .attr("transform", "rotate(-90)")
	.text("Unemployment Rate");
yAxisEl.call(yAxis);


// Legend
const legwidth = 150;

let legend = svg.append("g")
	.attr("id", "legend")
	.attr("transform", "translate("+(width-legwidth)+",0)");
legend.append("text")
	.attr("class", "axistitle")
	.attr("x", legwidth/2)
	.attr("y", 7)
	.attr("text-anchor", "middle")
	.text("GDP Per Capita")
legend.selectAll(".ind")
	.data([10, 60, 120])
  .join("circle")
	.attr("class", "ind")
	.attr("r", d => r(d*1000))
	.attr("cx", legwidth/2)
	.attr("cy", d => legwidth-r(d*1000));
legend.selectAll("#legend text.leglabel")
	.data([10, 60, 120])
    .join("text")
	.attr("class", "leglabel")
	.attr("x", legwidth/2)
	.attr("y", d => legwidth-2*r(d*1000))
	.attr("dy", -4)
	.text(d => d3.format(",")(d*1000));


// Load data.
// const insertData = d3.json("/appbeeswarm", d3.autoType); using json
// const insertData = d3.csv("../static/beeswarm/unemp_EU4.csv", d3.autoType);

const insertData = d3.json("/appbeeswarm", d3.autoType);

// when data is loaded, create node to be used in the force simulation
// each country gets a node
insertData.then(function(data) {
	
	
    // Create node data.
    let countryNodes = data.map(function(d,i) {		
        return {
            id: "node"+i,
            x: width/2 + Math.random(),
            y: y(d.unemp_2019 + Math.random()),
			r: r(d.gdp_2019),
			rate: d.unemp_2019,
			cnt: d.gdp_2019,
            color: d.color,
            group: d.CountryCode,
			data: d
        }
    });
	
	// Circle for each node.
	const circle = svg.append("g")
 		.selectAll("circle")
    	.data(countryNodes)
    	.join("circle")
			.attr("id", d => "circle"+d.id)
			.attr("cx", d => d.x)
      		.attr("cy", d => d.y)
			.attr("r", d => d.r)
      		.attr("fill", d => d.color);
	
	
    // Ease in the circles
	// .attrTween is a transition that moves an element with a function
    circle.transition()
    	.delay((d,i) => i * 5)
    	.duration(800)
    	.attrTween("r", d => {
      	    const i = d3.interpolate(0, d.r);
      	    return t => d.r = i(t);
    	});
	
	
	// use country code as labels.
	const label = svg.append("g")
		.selectAll("text")
		.data(countryNodes)
		.join("text")
		.attr("id", d => "label"+d.id)
		.attr("class", "countrylabel")
		.attr("x", d => d.x)
		.attr("y", d => d.y)
		.text(d => d.data.CountryCode);
	
	
	// Prevents the bubbles to overlap each other - main difference between 
	// a beeswarm chart and bubble chart (circles overalp each other)
	// use collision detection - d3.forceSimulation()
	simulation = d3.forceSimulation(countryNodes)
		.force("x", d3.forceX(width/2))
		.force("y", d3.forceY(d => y(d.rate)))
		.force("collision", d3.forceCollide().radius(d => d.r + padding))
    	.alpha(.15)
    	.alphaDecay(0);
	
	// Adjust position of circles.
	simulation.on("tick", () => {    
	    circle
	    	.attr("cx", d => d.x)
	        .attr("cy", d => d.y)
	        .attr("fill", d => d.color);
		d3.selectAll(".countrylabel")
			.attr("x", d => d.x)
			.attr("y", d => d.y)
	});


	var t;
	function timer() {
		
		// flip between years.
		if (USER_YEAR == 2019) { USER_YEAR = 2018; }
		else if (USER_YEAR == 2018) {USER_YEAR = 2017;}
		else if (USER_YEAR == 2017) {USER_YEAR = 2016;}
		else {USER_YEAR = 2019;}
		
		// change year in subtitle.
		d3.select("#curryear")
			.text(USER_YEAR)
			.style("background", "#e0e0e0")
			.transition().duration(2000)
			.style("background", "#fff");
		
		// update current status of nodes.
		countryNodes.forEach(function(o,i) {
			o.rate = o.data['unemp_'+USER_YEAR];
			o.cnt = o.data['gdp_'+USER_YEAR];
			o.r = r(o.cnt);
		});
		
		simulation
			.force("y", d3.forceY(d => y(d.rate)))
			.force("collision", d3.forceCollide().radius(d => d.r + padding));
		
		// update radius of circles for current counts.
    	circle.transition()
    		.duration(300)
			.attr("r", d => r(d.cnt));
		
		// keep flipping unless paused.
		if (!PAUSED) {
			t = d3.timeout(timer, 4000);
		}
	}

	t = d3.timeout(timer, 2000);
	
	
	// when clicked on "pause", previous timer() stops running
	// not paused, timer() gets called again
	d3.select("#pauseplay").on("click", function() {
		
		PAUSED = !PAUSED;
		
		let duration = 200;
		if (!PAUSED) {
			timer();
			d3.select(this).text("(Pause)");
		} else {
			duration = 1000;
			d3.select(this).text("(Play)");
			t.stop();
		}
		
		d3.select(this)
			.style("background", "#e0e0e0")
			.transition().duration(duration)
			.style("background", "#fff");
	});
	
	
	// Adjust to current window size.
	resize();
	
});


d3.select(window).on('resize', resize);

function resize() {
	
	// update width
    width = parseInt(d3.select('#chart').style('width'), 10);
    width = width - margin.left - margin.right;
	
	// change width of SVG	
	d3.select(svg.node().parentNode)
    	.style('width', (width + margin.left + margin.right) + 'px');
	
// adjust forces
	simulation
		.force("x", d3.forceX(width/2));
	
	// move legend
	legend.attr("transform", "translate("+(width-legwidth)+",10)");
}


