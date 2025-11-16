// Waiting until document has loaded
window.onload = () => {

  // YOUR CODE GOES HERE
  console.log("YOUR CODE GOES HERE");

  // Load the data set from the assets folder:
  console.log("D3 assignment test");

const svg = d3.select("body")
  .append("svg")
  .attr("width", 400)
  .attr("height", 300);

svg.append("circle")
  .attr("cx", 100)
  .attr("cy", 150)
  .attr("r", 30)
  .attr("fill", "steelblue");
};
