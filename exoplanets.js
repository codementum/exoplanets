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

var plutoMass = 0.00218 * jupiterToEarth;

var bubbleSizeScale = 7.647341837;

var ourPlanets = [
{name:'mercury', mJup:'0.000174'},
{name:'venus', mJup:'0.00256'},
{name:'earth', mJup:'0.00315'},
{name:'mars', mJup:'0.000338'},
{name:'jupiter', mJup:'1.0'},
{name:'saturn', mJup:'0.299'},
{name:'uranus', mJup:'0.0457'},
{name:'neptune', mJup:'0.054'},
{name:'pluto', mJup:'0.000006867'},
];


// can't figure out how to specify ranges in scales
  var dFill = d3.scale.linear()
        .domain([0.0004, 2500])
        .range([d3.hsl('#DCDCDC'), d3.hsl('#156b87')]);

// making a custom scale
function cFill(val){
  if(val >= 0.0 && val < 1.0)
    return d3.hsl('#156b87'); // 195 84 53
  if(val >= 1.0 && val < 8.0)
    return d3.hsl('#876315'); // 41 84 53
  if(val >= 8.0 && val < 16.0)
    return d3.hsl('#543510'); // 33 81 33 
  else
    return d3.hsl('#872815'); // 10 84 53
}

var bubble = d3.layout.pack()
    .sort(null)
    .size([r, r]);

var vis = d3.select("#chart").append("svg")
    .attr("width", r)
    .attr("height", r)
    .attr("class", "bubble");

// planet title
vis.append("text")
  .attr("id", "planet")
  .attr("x", 150)
  .attr("y", 80)
  .style("font-size", "24px")
  .style("font-weight", "bold")
  .style("text-anchor", "middle")
  .text("Planet Name");

// earth mass info
vis.append("text")
  .attr("id", "earths")
  .attr("x", 150)
  .attr("y", 110)
  .style("font-size", "18px")
  .style("font-weight", "bold")
  .style("text-anchor", "middle")
  .text("(earth mass)");

// earth mass info
var colorByDistance = false;
vis.append("rect")
  .attr("id", "colorButton")
  .attr("x", r/2)
  .attr("y", 20)
  .attr("width", 10)
  .attr("height", 10)
  .style("stroke", 'black')
  .style("fill", 'white')
  .on("click", function(){
    console.log('click');
    d3.select(this)
      .transition()
      .duration(500)
      .style("fill", function() {
        if(!colorByDistance){
          colorByDistance = true;
          d3.select('#colorButtonText').text('color by size');
          updateNodes();
          return cFill(0.5);
        } else {
          colorByDistance = false;
          d3.select('#colorButtonText').text('color by distance');
          updateNodes();
          return 'white';
        }
      })
  });

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
        d3.select(this).style("fill", function(d) { return d3.hsl(dFill(d.distance)).darker(); });
    } else {
        d3.select("#planet").text(d.className);
        d3.select("#earths").text("("+format(d.value*earthToJupiter)+" earth mass)");
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

// earth mass info
vis.append("text")
  .attr("id", "colorButtonText")
  .attr("x", r/2+15)
  .attr("y", 29)
  .text("color by distance");

// other planets
vis.selectAll('circle.ourPlanets')
  .data(ourPlanets)
  .enter().append('circle')
  .attr('class', 'ourPlanets')
  .attr('id', function(d) { return d.name; })
  .attr('cx', function(d, i) { return r - 70; })
  .attr('cy', function(d, i) { return 80 + 20*i; })
  .attr('r', function(d, i) { 
    return (1 + d.mJup*bubbleSizeScale); 
  })
  .style('fill', function(d, i) { 
      return cFill(d.mJup); 
  })
  .on("mouseover", function(d) {
    d3.select("#planet").text(d.name);
    d3.select("#earths").text("("+format(d.mJup*earthToJupiter)+" earth mass)");
    d3.select(this).style("fill", function(d) { return cFill(d.mJup).brighter(); });
  })
  .on("mouseout", function(d) {
    d3.select(this).style("fill", function(d) { return cFill(d.mJup); });
  });
  
vis.selectAll('text.ourPlanets')
  .data(ourPlanets)
  .enter().append('text')
  .attr('class', 'ourPlanets')
  .attr('x', function(d, i) { return r - 50; })
  .attr('y', function(d, i) { return 80 + 20*i; })
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
      d3.selectAll('circle.ourPlanets').select(d.name).style('fill', cFill(d.mJup));
    }
  });


d3.json("exoplanets.json", function(json) {
  var node = vis.selectAll("g.node")
      .data(bubble.nodes(classes(json))
      .filter(function(d) { return !d.children; }))
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  node.append("title")
      .text(function(d) { return d.className + "\n Jupiter Mass: " + d.value + "\n AU (distance): " + d.distance; });

  node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) { return cFill(d.value); })
      .on("mouseover", function(d) {
        d3.select("#planet").text(d.className);
        d3.select("#earths").text("("+format(d.value*earthToJupiter)+" earth mass)");
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
    else classes.push({packageName: name, className: node.Planet_Name, value: node.Pl_Mass, distance: node.Pl_semiaxis});
  }

  recurse(null, root);
  return {children: classes};
}

