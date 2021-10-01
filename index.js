const width = 1200;
const height = 800;

const svg = d3
  .select("div")
  .append("svg")
  .attr("height", height)
  .attr("width", width);

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

const tooltip = d3.select("div").append("div").attr("id", "tooltip");
const url =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";

fetch(url)
  .then((response) => response.json())
  .then((json) => drawDiagram(json));

function drawDiagram(data) {
  //Constructs a <root node>(needed to compute a hierarchical layout) from the specified hierarchical data. The specified data must be an object representing the root node
  const hierarchy = d3.hierarchy(data);

  //Used to evaluate the specified value function for a particular node. The node.value property of this function contains the value returned by the specified function

  hierarchy.sum((d) => d.value);

  //A Treemap displays hierarchical data as a set of nested rectangles. Each group is represented by a rectangle, which area is proportional to its value. Creates a new treemap layout with default settings

  const treemap = d3.treemap();

  const treemapLayout = treemap(hierarchy);

  const games = [];

  for (let i = 0; i < treemapLayout.children.length; i++) {
    for (let j = 0; j < treemapLayout.children[i].children.length; j++) {
      games.push(treemapLayout.children[i].children[j]);
    }
  }

  svg
    .selectAll("rect")
    .data(games)
    .enter()
    .append("rect")
    .attr("class", "tile")
    .attr("data-name", (d) => d.data.name)
    .attr("data-category", (d) => d.data.category)
    .attr("data-value", (d) => d.data.value)
    /*
           y0
        ---------
    x0  |       | x1
        |       |
        ---------
           y1
    */
    .attr("x", (d) => d.x0 * width)
    .attr("y", (d) => d.y0 * (height - 100))
    .attr("width", (d) => (d.x1 - d.x0) * width - 0.5)
    .attr("height", (d) => (d.y1 - d.y0) * (height - 100 - 0.5))
    .attr("fill", (d) => colorScale(d.data.category))
    .on("mouseover", function (evt, d) {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(
        "Name: " +
          d.data.name +
          "<br>" +
          "Category: " +
          d.data.category +
          "<br>" +
          "Value: " +
          d.data.value
      );
      tooltip.attr("data-value", d.value);

      tooltip.style("position", "absolute");
      tooltip.style("left", evt.pageX + 20 + "px");
      tooltip.style("top", evt.pageY + "px");
    })
    .on("mouseout", function () {
      tooltip.transition().duration(400).style("opacity", 0);
    });

  svg
    .selectAll("text")
    .data(games)
    .enter()
    .append("text")
    .selectAll("tspan")
    .data((d) => {
      let splitWords = d.data.name.split(/(?=[A-Z][^A-Z])/g); // split the name of game
      let res = [];
      let lines = 0;
      let rectWidth = (d.x1 - d.x0) * width;
      let rectHeight = (d.y1 - d.y0) * (height - 100);
      for (let i = 0; i < splitWords.length; i++) {
        lines++;
        if ((lines + 1) * 10 >= rectHeight) {
          let newText = splitWords.slice(i).join("");
          res.push({
            text: newText,
            x0: d.x0,
            y0: d.y0,
          });
          break;
        } else if (
          i !== splitWords.length - 1 &&
          (splitWords[i].length + splitWords[i + 1].length) * 10 < rectWidth
        ) {
          res.push({
            text: splitWords[i] + splitWords[i + 1],
            x0: d.x0, // keep x0 reference
            y0: d.y0, // keep y0 reference
          });
          i++;
        } else {
          res.push({
            text: splitWords[i],
            x0: d.x0,
            y0: d.y0,
          });
        }
      }
      return res;
      /*return d.data.name
        .split(/(?=[A-Z][^A-Z])/g) 
        .map((v) => {
          return {
            text: v,
            x0: d.x0, 
            y0: d.y0, 
          };
        });*/
    })
    .enter()
    .append("tspan")
    .attr("x", (d) => d.x0 * width + 5)
    .attr("y", (d, i) => d.y0 * (height - 100) + 10 + i * 9) // offset by index
    .text((d) => {
      return d.text;
    })
    .attr("font-size", "10px")
    .attr("font-weight", "bold");
  /*svg
    .selectAll("text")
    .data(games)
    .enter()
    .append("text")
    .attr("x", (d) => d.x0 * width + 5)
    .attr("y", (d) => d.y0 * height + 13)
    .text((d) => d.data.name)
    .attr("font-size", "12px");*/

  let platformsArr = games.map((game) => game.data.category);
  let platforms = [];
  platformsArr.map((platform) => {
    if (!platforms.includes(platform)) {
      platforms.push(platform);
    }
  });

  const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr("transform", "translate(0, " + (height - 80) + ")");

  legend
    .selectAll("rect")
    .data(platforms)
    .enter()
    .append("rect")
    .attr("class", "legend-item")
    .attr("width", 35)
    .attr("height", 25)
    .attr("x", (d, i) => i * 35)
    .attr("y", 0)
    .attr("fill", (d, i) => colorScale(d))
    .attr("opacity", 0.7);

  legend
    .selectAll("text")
    .data(platforms)
    .enter()
    .append("text")
    .attr("x", (d, i) => i * 35.5)
    .attr("font-size", "10px")
    .attr("font-weight", "bold")
    .attr("y", 35)
    .text((d, i) => d);
}
