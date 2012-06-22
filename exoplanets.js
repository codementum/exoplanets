// code adapted from http://mbostock.github.com/d3/ex/bubble.html
//
// xkcd color scale:
// blue: #156b87, lightbrown: #876315, brown: #543510, red: #872815
// max: 24.5, min: 0.003
// 0.0-4.0: blue; 4.0-8.0: lightbrown; 8.0-18.0: brown; 18.0-23.5: red

var r = 960,
    format = d3.format(".2f");

// http://en.wikipedia.org/wiki/Jupiter_mass
var earthToJupiter = 317.83;
var jupiterToEarth = 0.00315;

var bubbleSizeScale = 1.0;

var ourPlanets = [
{name:'mercury', eRadius:'0.3829'},
{name:'venus', eRadius:'0.9499'},
{name:'earth', eRadius:'1.0'},
{name:'mars', eRadius:'0.533'},
{name:'jupiter', eRadius:'11.209'},
{name:'saturn', eRadius:'9.4492'},
{name:'uranus', eRadius:'4.007'},
{name:'neptune', eRadius:'3.883'},
{name:'pluto', eRadius:'0.18'},
];


// can't figure out how to specify ranges in scales
  var dFill = d3.scale.linear()
        .domain([0.0004, 2500])
        .range([d3.hsl('#DCDCDC'), d3.hsl('#156b87')]);

// making a custom scale
function cFill(val){
  if(val >= 0.0 && val < 4.02)
    return d3.hsl('#156b87'); // 195 84 53
  if(val >= 4.02 && val < 11.210)
    return d3.hsl('#876315'); // 41 84 53
  if(val >= 11.210 && val < 16.0)
    return d3.hsl('#543510'); // 33 81 33 
  else
    return d3.hsl('#872815'); // 10 84 53
}

var bubble = d3.layout.pack()
    .sort(null)
    .size([r, r]);

var vis = d3.select("#chart").append("svg")
    .attr("width", r)
    .attr("height", r+100)
    .attr("class", "bubble");

//cb test
vis.append("text")
  .attr("id", "colorBlind")
  .attr("x", r/2)
  .attr("y", r/2 + 300)
  .attr("fill", "white")
  .style("font-size", "750px")
  .style("text-anchor", "middle")
  .text("42");


// planet title
vis.append("text")
  .attr("id", "planet")
  .attr("x", 15)
  .attr("y", 80)
  .style("font-size", "24px")
  .style("font-weight", "bold")
  .style("text-anchor", "left")
  .text("Planet Name");

// earth mass info
vis.append("text")
  .attr("id", "earths")
  .attr("x", 15)
  .attr("y", 110)
  .style("font-size", "18px")
  .style("font-weight", "bold")
  .style("text-anchor", "left")
  .text("(earth radius)");

// year info
vis.append("text")
  .attr("id", "year")
  .attr("x", 15)
  .attr("y", 170)
  .style("font-size", "18px")
  .style("font-weight", "bold")
  .style("text-anchor", "left")
  .text("year discovered");
  
// atmosphere info
vis.append("text")
  .attr("id", "atmosphere")
  .attr("x", 15)
  .attr("y", 140)
  .style("font-size", "18px")
  .style("font-weight", "bold")
  .style("text-anchor", "left")
  .text("atmosphere type");




var colorByDistance = false;
function toggleMetric(){ 
  if(!colorByDistance){
    colorByDistance = true;
    d3.select('#distanceButton').style('fill', cFill(0.5));
    d3.select('#massButton').style('fill', 'white');
    updateNodes();
  } else {
    colorByDistance = false;
    d3.select('#massButton').style('fill', cFill(0.5));
    d3.select('#distanceButton').style('fill', 'white');
    updateNodes();
  }
}

// earth mass info
vis.append("rect")
  .attr("id", "massButton")
  .attr("x", r/2 - 50)
  .attr("y", 10)
  .attr("width", 10)
  .attr("height", 10)
  .style("stroke", 'black')
  .style("fill", cFill(0.5))
  .on("click", toggleMetric);

vis.append("rect")
  .attr("id", "distanceButton")
  .attr("x", r/2 - 50)
  .attr("y", 30)
  .attr("width", 10)
  .attr("height", 10)
  .style("stroke", 'black')
  .style("fill", 'white')
  .on("click", toggleMetric);

vis.append("text")
  .attr("id", "distanceButtonText")
  .attr("x", r/2+15-50)
  .attr("y", 19)
  .text("color by radius");

vis.append("text")
  .attr("id", "distanceButtonText")
  .attr("x", r/2+15-50)
  .attr("y", 39)
  .text("color by distance to nearest star");



var updateNodes = function() {
  var circs = vis.selectAll("g.node").selectAll('circle');
  circs.transition()
    .duration(1000)
    .style("fill", function(d) { 
      if(!colorByDistance)
        return cFill(d.value); 
      else
        return dFill(d.distance);
    });

  circs
    .on("mouseover", function(d) {
      if(colorByDistance){
        d3.select("#planet").text(d.className);
        d3.select("#earths").text("("+format(d.distance)+" * earth-to-sun distance)");
        d3.select("#year").text("year discovered: "+d.year);
        d3.select("#atmosphere").text("atmosphere type: "+d.atmosphere);
        d3.select(this).style("fill", function(d) { return d3.hsl(dFill(d.distance)).darker(); });
    } else {
        d3.select("#planet").text(d.className);
        d3.select("#earths").text("("+format(d.value)+" *  earth-radius)");
        d3.select("#year").text("year discovered: "+d.year);
        d3.select("#atmosphere").text("atmosphere type: "+d.atmosphere);
        d3.select(this).style("fill", function(d) { return cFill(d.value).brighter(); });
    }
    })
    .on("mouseout", function(d) {
      if(colorByDistance){
        d3.select(this).style("fill", function(d) { return d3.hsl(dFill(d.distance)); });
      } else {
          d3.select(this).style("fill", function(d) { return cFill(d.value); });
      }
    });
}



// other planets
vis.selectAll('circle.ourPlanets')
  .data(ourPlanets)
  .enter().append('circle')
  .attr('class', 'ourPlanets')
  .attr('id', function(d) { return d.name; })
  .attr('cx', function(d, i) { return r - 70; })
  .attr('cy', function(d, i) { return 80 + 25*i; })
  .attr('r', function(d, i) { 
    return d.eRadius*bubbleSizeScale; 
  })
  .style('fill', function(d, i) { 
      return cFill(d.eRadius); 
  })
  .on("mouseover", function(d) {
    d3.select("#planet").text(d.name);
    d3.select("#earths").text("("+format(d.eRadius)+" * earth radius)");
    d3.select("#year").text("");
    d3.select("#atmosphere").text("");
    d3.select(this).style("fill", function(d) { return cFill(d.eRadius).brighter(); });
  })
  .on("mouseout", function(d) {
    d3.select(this).style("fill", function(d) { return cFill(d.eRadius); });
  });
  
vis.selectAll('text.ourPlanets')
  .data(ourPlanets)
  .enter().append('text')
  .attr('class', 'ourPlanets')
  .attr('x', function(d, i) { return r - 50; })
  .attr('y', function(d, i) { return 80 + 26*i; })
  .style("font-size", "12px")
  .text(function(d) { return d.name; })
  .on('mouseover', function(d, i){
    if(d.name === 'pluto'){
      d3.select(this).text("jk!");
      d3.selectAll('circle.ourPlanets').select(d.name).style('fill', 'white');
    }
  })
  .on('mouseout', function(d, i){
    if(d.name === 'pluto'){
      d3.select(this).text(d.name);
      d3.selectAll('circle.ourPlanets').select(d.name).style('fill', cFill(d.eRadius));
    }
  });


d3.json("exoplanets2.json", function(json) {
  var node = vis.selectAll("g.node")
      .data(bubble.nodes(classes(json))
      .filter(function(d) { return !d.children; }))
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + (80 + d.y) + ")"; });

  node.append("title")
      .text(function(d) { return d.className + "\n * Earth Radius: " + d.value + "\n AU (distance to star): " + d.distance; });

  node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) { return cFill(d.value); })
      .on("mouseover", function(d) {
        d3.select("#planet").text(d.className);
        d3.select("#earths").text("("+format(d.value)+" * earth radius)");
        d3.select("#year").text("year discovered: "+d.year);
        d3.select("#atmosphere").text("atmosphere type: "+d.atmosphere);
        d3.select(this).style("fill", function(d) { return cFill(d.value).brighter(); });
      })
      .on("mouseout", function(d) {
        d3.select(this).style("fill", function(d) { return cFill(d.value); });
      });

      // names on circles
//  node.append("text")
//      .attr("text-anchor", "middle")
//      .attr("dy", ".3em")
//      .text(function(d) { return d.className; });
//      .text(function(d) { return d.className.substring(0, d.r / 3); });
});

// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(root) {
  var classes = [];

  function recurse(name, node) {
    if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
    else classes.push({packageName: name, className: node.P_Name, value: node.P_Radius__EU, distance: node.P_Mean_Distance__AU, year: node.P_Disc_Year, atmosphere: node.P_Atmosphere_Class});
  }

  recurse(null, root);
  return {children: classes};
}

function colorBlind(){
  // switch to red
//  $('#distanceButton').click();

  var circs = vis.selectAll("g.node").selectAll('circle');
  circs.transition()
    .duration(1000)
    .style("fill-opacity", ".7");

  // cb text
  vis.transition()
    .duration(1000)
    .select("text#colorBlind")
    .attr("fill", "#a9a9a9")
    .style("fill-opacity", ".7");
}


(function (){

"use strict";

// test that it loads locally with ender.js and globally with vanilla konami.js
var konami = new Konami();

konami.code = function() {
  colorBlind();  
};

konami.iphone.code = function() {
  colorBlind();  
};

konami.load()
}());
