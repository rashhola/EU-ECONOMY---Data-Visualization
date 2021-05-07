
// User-controled variables.
let USER_YEAR = 2019,
	PAUSED = false;
d3.select("#curryear").text(USER_YEAR);

	
// Node spacing.
const padding = 2; // Space between nodes
      
	 
// Dimensions of chart.
let margin = { top: 20, right: 10, bottom: 40, left: 56 },
      width = parseInt(d3.select('#chart').style('width'), 10) - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom; 

let svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

var yaxisGroup = svg.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let simulation;


// Scales: Radius and y
// Luxemburg's max value (116,164), set domain to 120,000
let r = d3.scaleSqrt()
	.domain([0, 12000])
	.range([0, 20]);

// y: Greece is max (17.31),set y-axis max to 20
let y = d3.scaleLinear()
	.domain([0, 20])
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

// let legend = svg.append("g")
// 	.attr("id", "legend")
// 	.attr("transform", "translate("+(width-legwidth)+",0)");
// legend.append("text")
// 	.attr("class", "axistitle")
// 	.attr("x", legwidth/2)
// 	.attr("y", 7)
// 	.attr("text-anchor", "middle")
// 	.text("GDP Per Capita")
// legend.selectAll(".ind")
// 	.data([100, 600, 1200])
//   .join("circle")
// 	.attr("class", "ind")
// 	.attr("r", d => r(d))
// 	.attr("cx", legwidth/2)
// 	.attr("cy", d => legwidth-r(d));
// legend.selectAll("#legend text.leglabel")
// 	.data([100, 600, 1200])
//     .join("text")
// 	.attr("class", "leglabel")
// 	.attr("x", legwidth/2)
// 	.attr("y", d => legwidth-2*r(d))
// 	.attr("dy", -4)
// 	.text(d => d3.format(",")(d) + "k");


// Load data.
const stages = d3.csv("data/unemp_EU2.csv", d3.autoType);

// Once data is loaded...
stages.then(function(data) {
	
	
    // Create node data.
    let nodes = data.map(function(d,i) {		
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
    	.data(nodes)
    	.join("circle")
			.attr("id", d => "circle"+d.id)
			.attr("cx", d => d.x)
      		.attr("cy", d => d.y)
			.attr("r", d => d.r)
      		.attr("fill", d => d.color);
	
	
    // Ease in the circles.
    circle.transition()
    	.delay((d,i) => i * 5)
    	.duration(800)
    	.attrTween("r", d => {
      	    const i = d3.interpolate(0, d.r);
      	    return t => d.r = i(t);
    	});
	
	
	// Country labels.
	const label = svg.append("g")
		.selectAll("text")
		.data(nodes)
		.join("text")
		.attr("id", d => "label"+d.id)
		.attr("class", "countrylabel")
		.attr("x", d => d.x)
		.attr("y", d => d.y)
		.text(d => d.data.CountryCode);
	
	
	// Forces
	simulation = d3.forceSimulation(nodes)
    	//.force("cluster", forceCluster())
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
		//else if (USER_YEAR == 2019) {USER_YEAR = 2018;}
		else {USER_YEAR = 2019;}
		
		// change year in subitle.
		d3.select("#curryear")
			.text(USER_YEAR)
			.style("background", "#e0e0e0")
			.transition().duration(2000)
			.style("background", "#fff");
		
		// update current status of nodes.
		nodes.forEach(function(o,i) {
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
	
	
	// Controls
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
	legend.attr("transform", "translate("+(width-legwidth)+",0)");
}


