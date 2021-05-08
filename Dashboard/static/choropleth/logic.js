// Creating map object
var basemapId = "map";
var basemapOptions = {
    center: [49.5035, 9.5407], // center of the EU by experts at the National Geographic Institute in Paris
    zoom: 4
}
var myMap = L.map(basemapId, basemapOptions);

// Adding tile layer
var tileLayerUrlTemplate = "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
var tileLayerOptions = {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
}
L.tileLayer(tileLayerUrlTemplate, tileLayerOptions).addTo(myMap);

// Load in GeoJSON data
var geojsonPath = "../static/choropleth/european-union-countries.geojson";

// var GeoJSON;
var choroplethOptions = {
    valueProperty: "pop_est", // data point colorized on map
    scale: ["#ffffb2", "#b10026"], // hex value color scale
    steps: 10, // number of color variants
    mode: "q", // quartile type choropleth map
    style: {
        color: "#fff",
        weight: 1,
        fillOpacity: 0.8
    },
    onEachFeature: (feature, layer) => {
        layer.bindPopup(`Country: ${feature.properties.name_sort}
                                            <br> Population: ${feature.properties.pop_est}`)
    }
}
var legendOptions = { position: "bottomright" }

// Grab data with d3
d3.json(geojsonPath).then(function(data) { // read the data from geojsonPath
    console.log(data);

    // Create a new choropleth layer
    var choropleth = L.choropleth(data, choroplethOptions) // create a L.choropleth() that takes in the data and the choroplethOptions as its arguments
        .addTo(myMap); // add the choropleth to myMap

    // Set up the legend
    var legend = L.control(legendOptions) // create a L.control() that takes the legendOptions as its argument

    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var limits = choropleth.options.limits;
        var colors = choropleth.options.colors;
        var labels = colors.map(color => `<li style="background-color: ${color}"></li>`);

        // Add min & max
        div.innerHTML = `<h1>Population</h1>
                      <div class="labels">
                        <div class="min">${limits[0]}</div>
                        <div class="max">${limits[limits.length - 1]}</div>
                      </div>
                      <ul>${labels.join("")}</ul>`;
        return div;
    };

    // Add legend to the map
    legend.addTo(myMap);
});