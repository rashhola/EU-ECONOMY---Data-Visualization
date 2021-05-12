$(document).ready(function() {

    var margin = {
            top: 20,
            right: 20,
            bottom: 60,
            left: 40
        },
        width = 725 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    var currentX = "Unemployment";
    var currentY = "Inflation";

    var svg = d3.select("#chart")
        .append("svg")
        .attr("class", "chart")
        .attr("viewBox", "0 0 725 600")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // set up the tooltip
    var toolTip = d3.tip() // create a d3.tip
        .attr('class', "tooltip") // set the class to 'd3-tip'
        .offset([40, -60]) // set the offset to [40, -60]
        .html(function(d) {
            // Grab the country name.
            var theCountry = `<div>${d.country_name}</div>`;
            // Display what we capture.
            return theCountry;
        });

    // Call the toolTip function.
    svg.call(toolTip);

    // Legend
    const legwidth = 150;

    let legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", "translate(" + (width - legwidth) + ",0)");
    legend.append("text")
        .attr("class", "axistitle")
        .attr("x", legwidth / 2)
        .attr("y", 33)
        .attr("text-anchor", "middle")
        .text("Population (M)")
    legend.selectAll(".ind")
        .data([3, 6, 10])
        .join("circle")
        .attr("class", "ind")
        .attr("r", d => d * 5)
        .attr("cx", legwidth / 2)
        .attr("cy", d => legwidth - d * 5);
    legend.selectAll("#legend text.leglabel")
        .data([1, 5, 10])
        .join("text")
        .attr("class", "leglabel")
        .attr("x", legwidth / 2)
        .attr("y", d => legwidth - d * 5)
        .attr("dy", -13)
        .text(d => d3.format(",")(d * 10));

    d3.csv("static/phillips_curve/clean_CPI_unemp.csv").then(function(data) {   
        console.log(data)})

    d3.json("appPhillips").then(function(data) {
        
        console.log(data)

        // set the initial year for the data set to begin
        current_year = data.filter(d => d.Year == '2005')

        var x = d3.scaleLinear()
            // add the + sign to convert strings to integers
            // the 'extent' function gives min and max of array
            .domain(d3.extent(data.map(d => +d.Unemployment))).nice()
            .range([0, width]);

        var y = d3.scaleLinear()
            .domain(d3.extent(data.map(d => +d.Inflation))).nice()
            .range([height, 0]);

        // var color = data.map(function(d) {
        //     return { color: d.Color };
        // });

        var xAxis = d3.axisBottom(x);
        var yAxis = d3.axisLeft(y);

        //x axis
        svg.append("g")
            .attr("class", "x axis1")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("fill", "black")
            .attr("x", 450)
            .attr("y", 52)
            .style("text-anchor", "end")
            .text("Unemployment (%)");

        //y axis
        svg.append("g")
            .attr("class", "y axis1")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("fill", "black")
            .attr("transform", "rotate(-90)")
            .attr("y", -40)
            .attr('x', -200)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Inflation (%)")



        //circles
        circleRadius = 15
        var r = d3.scaleSqrt()
            .domain(d3.extent(data.map(d => +d.Population))).nice()
            .range([0, 50]);

        var circlesGroup = svg.selectAll("g circlesGroup")
            .data(current_year)
            .enter()

        circlesGroup.append("circle")
            .attr("cx", d => x(+d.Unemployment))
            .attr("cy", d => y(+d.Inflation))
            .attr("r", d => r(+d.Population))
            .attr("fill", d => d.Color)
            .attr('class', d => `${d.country_code} countryCircle`)


        circlesGroup.append("text")
            .text(d => d.country_code)
            .attr("dx", d => x(d[currentX])) // set the 'dx' attr() to map from d => xScale() applied to d[currentX]
            // When the size of the text is the radius, adding a third of the radius to the height pushes it into the middle of the circle.
            .attr("dy", d => y(d[currentY]) + circleRadius / 2.5) // set the 'dy' attr() to map from d => yScale() applied to d[currentY]) + circleRadius / 2.5
            .attr("font-size", circleRadius - 3) // set the 'font-size' .attr() to circleRadius
            .attr("class", d => `${d.country_code} countryText`) // set the 'class' attr() to be from d => d.country_code
            .on("mouseover", function(d) { // .on 'mouseover' event, fire off a function that takes argument d
                // Show the tooltip
                toolTip.show(d, this); // use toolTip.show() with d and this as the arguments
            })
            .on("mouseout", function(d) { // on 'mouseout' fire off a function that takes argument d
                // Remove the tooltip
                toolTip.hide(d, this); // use toolTip.hide() with d and this as the arguments
            });





        var running = false;
        var timer;

        $("#play").on("click", function() {

            var duration = 500;
            var maxstep = 2019;
            var minstep = 2005;

            if (running == true) {

                $("#play").html("Play");
                running = false;
                clearInterval(timer);

            } else if (running == false) {

                $("#play").html("Pause");

                sliderValue = $("#slider").val();

                timer = setInterval(function() {
                    if (sliderValue < maxstep) {
                        sliderValue++;
                        $("#slider").val(sliderValue);
                        $('#range').html(sliderValue);
                        update();
                    } else {
                        $("#slider").val(sliderValue);
                    }
                }, duration);
                running = true;
            }

        });
        // runs the slider
        $("#slider").on("change", function() {
            update();
            $("#range").html($("#slider").val());
            clearInterval(timer);
            $("#play").html("Play");
        });

        update = function() {

            var year = $("#slider").val()
                // filters the data for the year shown by the slider
            current_year = data.filter(d => d.Year == year)

            d3.selectAll(".countryCircle")
                .transition()
                .duration(1000)
                // sets the circles equal to the index of unemployment (x) and inflation (y) 
                .attr("cy", (d, i) => y(current_year[i].Inflation))
                .attr("cx", (d, i) => x(current_year[i].Unemployment))
                .attr("r", (d, i) => r(current_year[i].Population))

            d3.selectAll(".countryText")
                .transition()
                .duration(1000)
                .attr("dy", (d, i) => y(current_year[i].Inflation))
                .attr("dx", (d, i) => x(current_year[i].Unemployment))

        };

    });

});