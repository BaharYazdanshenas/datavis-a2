// Waiting until document has loaded
window.onload = () => {

  // YOUR CODE GOES HERE
  console.log("YOUR CODE GOES HERE");
};


d3.csv("cars.csv").then(function(data) {
    console.log("Cars data:", data);
    window.carsData = data;  // <- add this line just for exploration
});
