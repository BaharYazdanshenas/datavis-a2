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


window.onload = () => {

    d3.csv("cars.csv", d => ({
        Name: d["Name"],
        Type: d["Type"],
        AWD: +d["AWD"],
        RWD: +d["RWD"],
        RetailPrice: +d["Retail Price"],
        DealerCost: +d["Dealer Cost"],
        EngineSizeInL: +d["Engine Size (l)"],
        Cyl: +d["Cyl"],
        Horsepower: +d["Horsepower(HP)"],
        CityMilesPerGallon: +d["City Miles Per Gallon"],
        HighwayMilesPerGallon: +d["Highway Miles Per Gallon"],
        Weight: +d["Weight"],
        WheelBase: +d["Wheel Base"],
        Len: +d["Len"],
        Width: +d["Width"]
    })).then(data => {

        const width = 640;
        const height = 400;
        const marginTop = 20;
        const marginRight = 20;
        const marginBottom = 30;
        const marginLeft = 40;

        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.Horsepower)])
            .range([marginLeft, width - marginRight]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.RetailPrice)])
            .range([height - marginBottom, marginTop]);

        const color = d3.scaleOrdinal()
            .domain(["Sedan", "Minivan", "Wagon", "SUV", "Sports Car"])
            .range(["#1EC949", "#9E1EC9", "#C91E49", "#1E49C9", "#C99E1E"]);

        const svg = d3.create("svg")
            .attr("width", width)
            .attr("height", height);

        // Achsen
        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y));

        // Achsentitel
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height - 10)
            .text("Horsepower in ps");

        svg.append("text")
            .attr("x", -height / 2)
            .attr("y", 15)
            .attr("transform", "rotate(-90)")
            .text("Retail price");

        // Tooltip erzeugen
        const tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("padding", "6px")
            .style("background", "#eee")
            .style("border", "1px solid #aaa")
            .style("border-radius", "4px")
            .style("opacity", 0);

        // Punkte zeichnen
        svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")          // fehlend!
            .attr("class", "dot")
            .attr("cx", d => x(d.Horsepower))
            .attr("cy", d => y(d.RetailPrice))
            .attr("r", 5)
            .attr("fill", d => color(d.Type))   // color, nicht type!
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(100).style("opacity", 1);
                tooltip.html(`
                    <strong>${d.Name}</strong>
                    <br>Engine Size: ${d.EngineSizeInL}
                    <br>Dealer Cost: ${d.DealerCost}
                    <br>Cylinder: ${d.Cyl}
                    <br>City MPG: ${d.CityMilesPerGallon}
                    <br>Highway MPG: ${d.HighwayMilesPerGallon}
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 40) + "px");
            })
            .on("mouseout", () => tooltip.transition().duration(200).style("opacity", 0));

        document.body.appendChild(svg.node());
    });
};