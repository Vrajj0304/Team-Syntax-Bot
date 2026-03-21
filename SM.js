// ================= DATASET =================
var dataset = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
    .filterDate('2021-05-01', '2021-06-01');

// ================= SCALE FACTORS =================
function applyScaleFactors(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
  
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true);
}

dataset = dataset.map(applyScaleFactors);

// ================= MAP CENTER =================
Map.setCenter(78.9629, 20.5937, 5);

// Median image
var image = dataset.median();

// ================= NDVI =================
var ndvi = image.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI');

Map.addLayer(ndvi, {
  min: -1,
  max: 1,
  palette: ['red', 'yellow', 'green']
}, 'NDVI');

// ================= LST =================
var lst = image.select('ST_B10');

Map.addLayer(lst, {
  min: 290,
  max: 320,
  palette: ['blue', 'yellow', 'red']
}, 'LST');

// ================= SOIL MOISTURE =================
// Using a proxy: High NDVI + Low LST = Wet; Low NDVI + High LST = Dry
var moisture = ndvi.subtract(lst.divide(300)).rename('Soil_Moisture_Proxy');

Map.addLayer(moisture, {
  min: -1,
  max: 1,
  palette: ['brown', 'yellow', 'green']
}, 'Soil Moisture Proxy');

// ================= VISUAL LAYERS =================
Map.addLayer(image, {bands: ['SR_B4', 'SR_B3', 'SR_B2'], min: 0, max: 0.3}, 'True Color (432)');
Map.addLayer(image, {bands: ['SR_B5', 'SR_B4', 'SR_B3'], min: 0, max: 0.3}, 'False Color');

// ================= LEGEND FUNCTION =================
function addLegend(title, palette, min, max, position) {
  var legend = ui.Panel({style: {position: position, padding: '8px'}});
  legend.add(ui.Label({value: title, style: {fontWeight: 'bold', fontSize: '14px'}}));
  var makeRow = function(color, name) {
    return ui.Panel({
      widgets: [
        ui.Label({style: {backgroundColor: color, padding: '8px', margin: '0 4px 4px 0'}}),
        ui.Label(name)
      ],
      layout: ui.Panel.Layout.Flow('horizontal')
    });
  };
  legend.add(makeRow(palette[0], min));
  legend.add(makeRow(palette[palette.length - 1], max));
  Map.add(legend);
}

addLegend('NDVI', ['red', 'yellow', 'green'], '-1', '1', 'bottom-left');
addLegend('Soil Moisture', ['brown', 'yellow', 'green'], 'Dry', 'Wet', 'bottom-right');

// ================= INDIAN CITIES =================
var cities = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([80.6480, 16.5062]), {name: 'Amaravati'}),
  ee.Feature(ee.Geometry.Point([93.6053, 27.0844]), {name: 'Itanagar'}),
  ee.Feature(ee.Geometry.Point([91.7362, 26.1445]), {name: 'Dispur'}),
  ee.Feature(ee.Geometry.Point([85.1376, 25.5941]), {name: 'Patna'}),
  ee.Feature(ee.Geometry.Point([81.6296, 21.2514]), {name: 'Raipur'}),
  ee.Feature(ee.Geometry.Point([73.8278, 15.4909]), {name: 'Panaji'}),
  ee.Feature(ee.Geometry.Point([72.5714, 23.0225]), {name: 'Gandhinagar'}),
  ee.Feature(ee.Geometry.Point([76.7794, 30.7333]), {name: 'Chandigarh'}),
  ee.Feature(ee.Geometry.Point([77.1734, 31.1048]), {name: 'Shimla'}),
  ee.Feature(ee.Geometry.Point([85.3096, 23.3441]), {name: 'Ranchi'}),
  ee.Feature(ee.Geometry.Point([77.5946, 12.9716]), {name: 'Bengaluru'}),
  ee.Feature(ee.Geometry.Point([76.9366, 8.5241]), {name: 'Thiruvananthapuram'}),
  ee.Feature(ee.Geometry.Point([77.4126, 23.2599]), {name: 'Bhopal'}),
  ee.Feature(ee.Geometry.Point([72.8777, 19.0760]), {name: 'Mumbai'}),
  ee.Feature(ee.Geometry.Point([93.9368, 24.8170]), {name: 'Imphal'}),
  ee.Feature(ee.Geometry.Point([91.8933, 25.5788]), {name: 'Shillong'}),
  ee.Feature(ee.Geometry.Point([92.7176, 23.7271]), {name: 'Aizawl'}),
  ee.Feature(ee.Geometry.Point([94.1086, 25.6701]), {name: 'Kohima'}),
  ee.Feature(ee.Geometry.Point([85.8245, 20.2961]), {name: 'Bhubaneswar'}),
  ee.Feature(ee.Geometry.Point([75.7873, 26.9124]), {name: 'Jaipur'}),
  ee.Feature(ee.Geometry.Point([88.5122, 27.3389]), {name: 'Gangtok'}),
  ee.Feature(ee.Geometry.Point([80.2707, 13.0827]), {name: 'Chennai'}),
  ee.Feature(ee.Geometry.Point([78.4867, 17.3850]), {name: 'Hyderabad'}),
  ee.Feature(ee.Geometry.Point([91.2868, 23.8315]), {name: 'Agartala'}),
  ee.Feature(ee.Geometry.Point([80.9462, 26.8467]), {name: 'Lucknow'}),
  ee.Feature(ee.Geometry.Point([78.0322, 30.3165]), {name: 'Dehradun'}),
  ee.Feature(ee.Geometry.Point([88.3639, 22.5726]), {name: 'Kolkata'})
]);

Map.addLayer(cities, {color: 'blue'}, 'Indian Cities');

// ================= VALUE EXTRACTION & CLASSIFICATION =================
var combined = image.addBands(ndvi).addBands(lst).addBands(moisture);

// Sample the values at city points
var cityValues = combined.sampleRegions({
  collection: cities,
  properties: ['name'], // Keep the city name
  scale: 30,
  geometries: false
});

// Create formatted output with "Wet" or "Dry" labels
var formatted = cityValues.map(function(feature) {
  var moistureVal = ee.Number(feature.get('Soil_Moisture_Proxy'));
  
  // Logical check: If moisture proxy > -0.7 (adjust this threshold as needed), it's 'Wet'
  // Note: Since LST is divided by 300, results are typically around -0.8 to -0.4
  var status = ee.Algorithms.If(moistureVal.gt(-0.75), 'Wet', 'Dry');
  
  return ee.Feature(null, {
    'City': feature.get('name'),
    'Soil_Status': status,
    'Moisture_Score': moistureVal,
    'NDVI': feature.get('NDVI'),
    'LST_Kelvin': feature.get('ST_B10')
  });
});

// ================= OUTPUTS =================
print('City Data with Soil Condition:', formatted);

// Sort by Moisture Score (High to Low)
print('Sorted Cities (Wettest to Driest):', formatted.sort('Moisture_Score', false));