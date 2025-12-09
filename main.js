// // Waiting until document has loaded
// window.onload = () => {

//   // YOUR CODE GOES HERE
//   console.log("YOUR CODE GOES HERE");
// };


// d3.csv("cars.csv").then(function(data) {
//     console.log("Cars data:", data);
//     window.carsData = data;

//     const svgNode = chart(data);      // <- get what chart() returns
//     document.body.appendChild(svgNode); // <- attach it to the page
// });

// function chart(data) {

//   // Specify the chart’s dimensions.
//   const width = 928;
//   const height = 600;
//   const marginTop = 25;
//   const marginRight = 20;
//   const marginBottom = 35;
//   const marginLeft = 40;

//   // Create the positional scales.
//   const x = d3.scaleLinear()
//     .domain(d3.extent(data, d => d.Len)).nice()
//     .range([marginLeft, width - marginRight]);
//   const y = d3.scaleLinear()
//     .domain(d3.extent(data, d => d.Width)).nice()
//     .range([height - marginBottom, marginTop]);

//     // Create the categorical scales.
//   const color = d3.scaleOrdinal(data.map(d => d.AWD), d3.schemeCategory10);
//   const shape = d3.scaleOrdinal(data.map(d => d.AWD), d3.symbols.map(s => d3.symbol().type(s)()));

//   // Create the SVG container.
//   const svg = d3.create("svg")
//       .attr("viewBox", [0, 0, width, height])
//       .attr("width", width)
//       .attr("height", height)
//       .attr("style", "max-width: 100%; height: auto;");

//       // Append the axes.
//   svg.append("g")
//       .attr("transform", `translate(0,${height - marginBottom})`)
//       .call(d3.axisBottom(x).ticks(width / 80))
//       .call(g => g.select(".domain").remove())
//       .call(g => g.append("text")
//           .attr("x", width)
//           .attr("y", marginBottom - 4)
//           .attr("fill", "currentColor")
//           .attr("text-anchor", "end")
//           .text("Car length (cm) →"));

//   svg.append("g")
//       .attr("transform", `translate(${marginLeft},0)`)
//       .call(d3.axisLeft(y))
//       .call(g => g.select(".domain").remove())
//       .call(g => g.append("text")
//           .attr("x", -marginLeft)
//           .attr("y", 10)
//           .attr("fill", "currentColor")
//           .attr("text-anchor", "start")
//           .text("↑ Car width (cm)"));

// // Add a grid.
//   svg.append("g")
//       .attr("stroke", "currentColor")
//       .attr("stroke-opacity", 0.1)
//       .call(g => g.append("g")
//         .selectAll("line")
//         .data(x.ticks())
//         .join("line")
//           .attr("x1", d => 0.5 + x(d))
//           .attr("x2", d => 0.5 + x(d))
//           .attr("y1", marginTop)
//           .attr("y2", height - marginBottom))
//       .call(g => g.append("g")
//         .selectAll("line")
//         .data(y.ticks())
//         .join("line")
//           .attr("y1", d => 0.5 + y(d))
//           .attr("y2", d => 0.5 + y(d))
//           .attr("x1", marginLeft)
//           .attr("x2", width - marginRight));
// // Add the scatterplot symbols.
//   svg.append("g")
//       .attr("stroke-width", 1.5)
//       .attr("font-family", "sans-serif")
//       .attr("font-size", 10)
//     .selectAll("path")
//     .data(data)
//     .join("path")
//       .attr("transform", d => `translate(${x(d.Len)},${y(d.Width)})`)
//       .attr("fill", d => color(d.AWD))
//       .attr("d", d => shape(d.AWD));
//   return svg.node();
// }


// 1. Columns that should be numeric
const numericCols = [
  "AWD", "RWD",
  "Retail Price", "Dealer Cost",
  "Engine Size (l)", "Cyl",
  "Horsepower(HP)",
  "City Miles Per Gallon", "Highway Miles Per Gallon",
  "Weight", "Wheel Base", "Len", "Width"
];

// ---------- Diagnostics ----------
function runDiagnostics(data) {

  // convert relevant columns to numbers
  data.forEach(d => {
    numericCols.forEach(col => {
      if (d[col] !== undefined) d[col] = +d[col];
    });
  });

  function flag(i, reason, col, value, row) {
    console.log(
      `Row ${i} – ${reason} in "${col}" = ${value} (Name: ${row.Name})`,
      row
    );
  }

  const rules = {
    "Engine Size (l)": { min: 0.5, max: 10, forbidZero: true },
    "Cyl": { allowed: [3, 4, 5, 6, 8, 10, 12] },
    "Horsepower(HP)": { min: 40, max: 1000, forbidZero: true },
    "City Miles Per Gallon": { min: 5, max: 80 },
    "Highway Miles Per Gallon": { min: 5, max: 80 },
    "Weight": { min: 500, max: 10000, forbidZero: true },
    "Wheel Base": { min: 80, max: 200, forbidZero: true },
    "Len": { min: 120, max: 260, forbidZero: true },
    "Width": { min: 55, max: 90, forbidZero: true }
  };

  data.forEach((row, i) => {
    for (const [col, r] of Object.entries(rules)) {
      const v = row[col];
      if (v == null || Number.isNaN(v)) continue;

      if (r.forbidZero && v === 0)       flag(i, "zero where zero is impossible", col, v, row);
      if (r.min != null && v < r.min)    flag(i, "below logical minimum",        col, v, row);
      if (r.max != null && v > r.max)    flag(i, "above logical maximum",        col, v, row);
      if (r.allowed && !r.allowed.includes(v))
                                        flag(i, "value not in allowed set",     col, v, row);
      if (v < 0)                         flag(i, "negative value",               col, v, row);
    }
  });

  console.log("Diagnostics finished.");
}

// ---------- Cleaning ----------
function cleanData(data) {
  return data.filter(d => {
    const city  = +d["City Miles Per Gallon"];
    const hwy   = +d["Highway Miles Per Gallon"];
    const wb    = +d["Wheel Base"];
    const width = +d["Width"];
    const eng   = +d["Engine Size (l)"];

    // impossible values → drop row
    if (city <= 0 || city > 100) return false;
    if (hwy  <= 0 || hwy  > 100) return false;
    if (wb   <= 50 || wb   > 200) return false;
    if (width<= 50 || width> 100) return false;
    if (eng  <= 0  || eng  > 10)  return false;

    return true;
  });
}

// ---------- Main: load CSV, clean, draw ----------
d3.csv("cars.csv").then(function (data) {
  console.log("Cars data (raw):", data.length);

  window.carsRaw = data;
  runDiagnostics(data);

  const cleaned = cleanData(data);
  cleaned.columns = data.columns;        

  window.carsCleaned = cleaned;
  console.log("Cleaned rows:", cleaned.length);

  const svgNode = scatterMatrix(cleaned);
  document.body.appendChild(svgNode);
});

// ---------- Scatterplot matrix ----------
function scatterMatrix(data) {
  const width = 900;
  const padding = 30;

  // keep only numeric columns
  const columns = data.columns.filter(col => !isNaN(+data[0][col]));
  const n = columns.length;
  const size = (width - (n + 1) * padding) / n + padding;
  const height = size * n;

  const x = columns.map(c =>
    d3.scaleLinear()
      .domain(d3.extent(data, d => +d[c])).nice()
      .range([padding / 2, size - padding / 2])
  );

  const y = x.map(s =>
    s.copy().range([size - padding / 2, padding / 2])
  );

  const axisx = d3.axisBottom().ticks(4).tickSize(size * n);
  const axisy = d3.axisLeft().ticks(4).tickSize(-size * n);

  const xAxis = g => g.selectAll("g")
    .data(x)
    .join("g")
      .attr("transform", (d, i) => `translate(${i * size},0)`)
      .each(function (d) { d3.select(this).call(axisx.scale(d)); })
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").attr("stroke", "#ddd"));

  const yAxis = g => g.selectAll("g")
    .data(y)
    .join("g")
      .attr("transform", (d, i) => `translate(0,${i * size})`)
      .each(function (d) { d3.select(this).call(axisy.scale(d)); })
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").attr("stroke", "#ddd"));

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-padding, 0, width, height]);

  svg.append("g").call(xAxis);
  svg.append("g").call(yAxis);

  const cell = svg.append("g")
    .selectAll("g")
    .data(d3.cross(d3.range(n), d3.range(n)))
    .join("g")
      .attr("transform", ([i, j]) => `translate(${i * size},${j * size})`);

  cell.append("rect")
      .attr("fill", "none")
      .attr("stroke", "#aaa")
      .attr("x", padding / 2 + 0.5)
      .attr("y", padding / 2 + 0.5)
      .attr("width", size - padding)
      .attr("height", size - padding);

  cell.each(function ([i, j]) {
    d3.select(this).selectAll("circle")
      .data(
        data.filter(d =>
          !isNaN(+d[columns[i]]) && !isNaN(+d[columns[j]])
        )
      )
      .join("circle")
        .attr("cx", d => x[i](+d[columns[i]]))
        .attr("cy", d => y[j](+d[columns[j]]))
        .attr("r", 2)
        .attr("fill", "steelblue")
        .attr("fill-opacity", 0.6);
  });

  svg.append("g")
    .style("font", "bold 10px sans-serif")
    .style("pointer-events", "none")
    .selectAll("text")
    .data(columns)
    .join("text")
      .attr("transform", (d, i) => `translate(${i * size},${i * size})`)
      .attr("x", padding)
      .attr("y", padding)
      .text(d => d);

  return svg.node();
}