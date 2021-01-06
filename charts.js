function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list od sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });
    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample); 
  });
}
// Initalize the dashboard
init();

function optionChanged(newSample) {
  //Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);

}

// Demographics Panel
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    //Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];

    // Use d3 to seelct the sample with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("")to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each ket and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new 
    // tags for each key-valye in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// Create the buildChart function
function buildCharts(sample) {
  // Use d3.json to load the samples.json file
  d3.json("samples.json").then((data) => {
    console.log(data);
    // Create a variable that hold the samples array
    var samplesArray  = data.samples;
    var metadata = data.metadata;
    // Create a variable that filters the sample for the object with the desired sample number
    var filtered = samplesArray.filter(obj => obj.id == sample);
    
    // 1. Create a variable that filters the metadata array for the object with the desired sample number
    
    var filteredMeta = metadata.filter(sampleObj => sampleObj.id == sample);

    // Create a variable that holds the first sample in the array
    var first = filtered[0];

    // 2. Create a variable that holds the first sample in the metadata array.
    var metaResults = filteredMeta[0];

    // Create variables that hold the otu_ids, otu_labels, and sample values.
    var otuId = first.otu_ids;
    var otuLabels = first.otu_labels;
    var sampleVal = first.sample_values;

    // 3. Create a variable that hols the washing frequency
    var washings = parseFloat(metaResults.wfreq);

    // Create the yticks for the bar chart 
    var yticks = otuId.slice(0, 10).map(top10 => `OTU ${top10}`).reverse();

    // Create the trace for the bar chart
    var barData = [{
      x: sampleVal.slice(0, 10).reverse(),
      y: yticks,
      text: otuLabels.slice(0, 10).reverse(),
      type: "bar", 
      orientation: "h",
    }];

    // Create the layout for the bar chart
    var barLayout = {
      title: "Top 10 Bacteria Species",
      yaxis: {title: "ID NO."},
      xaxis: {title: "Number of Species Found"},
      margin: {t: 35, l:160}
    };

    // Use Plotly to plot the data with the layout
    Plotly.newPlot("bar", barData, barLayout);

    // Create the trace for the bubble chart
    var bubbleData = [
      {
        x: otuId,
        y: sampleVal,
        text: otuLabels,
        mode: "markers", 
        marker: {
          size: sampleVal,
          color: otuId,
          colorscale: "virdis"
        }
      }
    ];
    var bubbleLayout = {
      title: "Bacteria Cultures Per Sample",
      yaxis: {rangemode: "tozero"},
      xaxis: {title: "OTU ID"},
      margin: { t: 50},
      hovermode: "closest"
    };

    // Use Plotly to plot the bubble chart with layout
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);

    console.log(washings);
    // 4. Create the trace for the gauge chart.

    var gaugeData = [
      {
        domain: {x: [0,1], y:[0,1] },
        value: washings, 
        title: {text: "Belly Button Washing Frequency <br> Scrubs per Week"},
        type: "indicator", 
        mode: "gauge+number",
        gauge: {
          bar: {color: "black"},
          axis: { range: [null, 10] },
          steps: [
            { range: [0, 2], color: "purple"},
            { range: [2, 4], color: "blue"},
            { range: [4, 6], color: "green"},
            { range: [6, 8], color: "yellow"},
            { range: [8, 10], color: "orange"}
          ],
        }
      }
    ];

    // 5. Create the layout for the gauge chart
    var gaugeLayout = {
      width: 500,
      height: 500,
      margin: {t:0, b:0},
      font: { color: "red", family: "Arial" }
    };

    // 6. Use Plotly to plot the gauge data and layout
    Plotly.newPlot("gauge", gaugeData, gaugeLayout);
    });
};