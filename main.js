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
    const cyl   = +d["Cyl"];              // <-- add this

    // impossible values → drop row
    if (city <= 0 || city > 100) return false;
    if (hwy  <= 0 || hwy  > 100) return false;
    if (wb   <= 50 || wb   > 200) return false;
    if (width<= 50 || width> 100) return false;
    if (eng  <= 0  || eng  > 10)  return false;
    if (cyl  <= 0)               return false;   // <-- NEW: remove 0-cyl cars

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

// ---------- Main: load CSV, clean, draw ----------
d3.csv("cars.csv").then(function (data) {
  console.log("Cars data (raw):", data.length);

  window.carsRaw = data;
  runDiagnostics(data);           // converts numeric columns in-place

  const cleaned = cleanData(data);
  cleaned.columns = data.columns;

  window.carsCleaned = cleaned;
  console.log("Cleaned rows:", cleaned.length);

  // ----- draw the main scatter plot (Engine size vs Highway MPG) -----
  const scatter = drawMainScatter(cleaned);
  document.body.appendChild(scatter);

  // If you still want the scatterplot matrix as well, keep this line;
  // otherwise you can comment it out.
  // const matrix = scatterMatrix(cleaned);
  // document.body.appendChild(matrix);
});
function drawMainScatter(data) {

  // --- dimensions ---
  const width  = 900;
  const height = 600;
  const marginTop    = 40;
  const marginRight  = 220;  // room for legends
  const marginBottom = 55;
  const marginLeft   = 70;

  // --- ensure numeric fields ---
  data.forEach(d => {
    d.eng = +d["Engine Size (l)"];             // x
    d.hwy = +d["Highway Miles Per Gallon"];    // y
    d.cyl = +d["Cyl"];                         // size
  });

  // --- scales for x and y ---
  const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.eng)).nice()
      .range([marginLeft, width - marginRight]);

  const y = d3.scaleLinear()
      .domain(d3.extent(data, d => d.hwy)).nice()
      .range([height - marginBottom, marginTop]);

  // --- color by car Type ---
  const types = Array.from(new Set(data.map(d => d.Type)));
  const color = d3.scaleOrdinal()
      .domain(types)
      .range(d3.schemeCategory10.slice(0, types.length));

  // --- size by number of cylinders (discrete radii, sharper contrast) ---
const cylValues = Array.from(new Set(data.map(d => d.cyl)))
  .filter(c => c > 0)              // just in case, remove any remaining 0
  .sort(d3.ascending);

// choose radii so each step is clearly visible
const radii = [6, 10, 14, 18, 22, 26, 30].slice(0, cylValues.length);

const size = d3.scaleOrdinal()
  .domain(cylValues)
  .range(radii);

  
  // --- SVG container ---
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 12px sans-serif;");

  // --- axes ---
  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x))
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
          .attr("x", (marginLeft + (width - marginRight)) / 2)
          .attr("y", 40)
          .attr("fill", "currentColor")
          .attr("text-anchor", "middle")
          .attr("font-weight", "bold")
          .text("Engine size (liters)"));

  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
          .attr("x", -marginLeft + 10)
          .attr("y", marginTop - 20)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text("Highway fuel efficiency (miles per gallon)"));

  // --- background grid ---
  svg.append("g")
      .attr("stroke", "#ccc")
      .attr("stroke-opacity", 0.3)
    .call(g => g.append("g")
      .selectAll("line")
      .data(x.ticks())
      .join("line")
        .attr("x1", d => x(d) + 0.5)
        .attr("x2", d => x(d) + 0.5)
        .attr("y1", marginTop)
        .attr("y2", height - marginBottom))
    .call(g => g.append("g")
      .selectAll("line")
      .data(y.ticks())
      .join("line")
        .attr("y1", d => y(d) + 0.5)
        .attr("y2", d => y(d) + 0.5)
        .attr("x1", marginLeft)
        .attr("x2", width - marginRight));

  // --- HTML tooltip ---
  const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "white")
      .style("border", "1px solid #999")
      .style("padding", "6px 8px")
      .style("border-radius", "4px")
      .style("font", "12px sans-serif")
      .style("opacity", 0);

  // --- points: color + size (all circles) ---
  svg.append("g")
      .attr("stroke-width", 1)
      .attr("stroke", "#333")
    .selectAll("circle")
    .data(data)
    .join("circle")
      .attr("cx", d => x(d.eng))
      .attr("cy", d => y(d.hwy))
      .attr("r",  d => size(d.cyl))
      .attr("fill", d => color(d.Type))
      .attr("fill-opacity", 0.8)
      // D3 v5-style handlers: only `d`, use d3.event for mouse position
      .on("mouseover", function(d) {
        d3.select(this).attr("stroke-width", 2);

        const engText = (typeof d.eng === "number" && !Number.isNaN(d.eng))
          ? d.eng.toFixed(1)
          : d["Engine Size (l)"];

        const hwyText = (typeof d.hwy === "number" && !Number.isNaN(d.hwy))
          ? d.hwy.toFixed(0)
          : d["Highway Miles Per Gallon"];

        tooltip
          .style("opacity", 1)
          .html(`
            <strong>${d.Name}</strong><br/>
            Type: ${d.Type}<br/>
            AWD: ${d.AWD}<br/>
            Retail Price: ${d["Retail Price"]}<br/>
            Dealer Cost: ${d["Dealer Cost"]}<br/>
            Engine size: ${engText} L<br/>
            Cylinders: ${d.cyl}<br/>
            Highway MPG: ${hwyText}
          `);
      })
      .on("mousemove", function() {
        tooltip
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top",  (d3.event.pageY + 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("stroke-width", 1);
        tooltip.style("opacity", 0);
      });

  // ---------------- Legends ----------------
  const legend = svg.append("g")
      .attr("transform", `translate(${width - marginRight + 20},${marginTop})`)
      .attr("font-size", 11);

  // Title
  legend.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("font-weight", "bold")
      .text("Encoding");

  let offsetY = 20;

  // --- Color legend: Type ---
  legend.append("text")
      .attr("x", 0)
      .attr("y", offsetY)
      .attr("font-weight", "bold")
      .text("Color: Type");
  offsetY += 10;

  const colorLegend = legend.append("g")
      .attr("transform", `translate(0,${offsetY})`);

  colorLegend.selectAll("g")
      .data(types)
      .join("g")
        .attr("transform", (d, i) => `translate(0,${i * 16})`)
      .call(g => g.append("circle")
          .attr("r", 4)
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("fill", d => color(d)))
      .call(g => g.append("text")
          .attr("x", 10)
          .attr("y", 4)
          .text(d => d));

  offsetY += types.length * 16 + 20;

  // --- Size legend: Cylinders (all distinct values) ---
  legend.append("text")
      .attr("x", 0)
      .attr("y", offsetY)
      .attr("font-weight", "bold")
      .text("Size: Cylinders");
  offsetY += 8;

  const sizeLegend = legend.append("g")
      .attr("transform", `translate(0,${offsetY})`);

  const sizeItems = sizeLegend.selectAll("g")
      .data(cylValues)   // include every cylinder count present in the data
      .join("g")
        .attr("transform", (d, i) => `translate(0,${i * 22})`);

  sizeItems.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", d => size(d))
      .attr("fill", "#999")
      .attr("stroke", "#333");

  sizeItems.append("text")
      .attr("x", 24)
      .attr("y", 4)
      .text(d => `${d} cyl`);

  return svg.node();
}