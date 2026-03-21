// ==============================
// 🇮🇳 ALL STATE CAPITALS SETUP
// ==============================
var cities = {
  "Amaravati": ee.Geometry.Point([80.5167, 16.5069]),
  "Itanagar": ee.Geometry.Point([93.6053, 27.0844]),
  "Dispur": ee.Geometry.Point([91.7898, 26.1433]),
  "Patna": ee.Geometry.Point([85.1376, 25.5941]),
  "Raipur": ee.Geometry.Point([81.6296, 21.2514]),
  "Panaji": ee.Geometry.Point([73.8278, 15.4909]),
  "Gandhinagar": ee.Geometry.Point([72.6369, 23.2156]),
  "Chandigarh": ee.Geometry.Point([76.7794, 30.7333]),
  "Shimla": ee.Geometry.Point([77.1734, 31.1048]),
  "Ranchi": ee.Geometry.Point([85.3090, 23.3441]),
  "Bengaluru": ee.Geometry.Point([77.5946, 12.9716]),
  "Thiruvananthapuram": ee.Geometry.Point([76.9366, 8.5241]),
  "Bhopal": ee.Geometry.Point([77.4126, 23.2599]),
  "Mumbai": ee.Geometry.Point([72.8777, 19.0760]),
  "Imphal": ee.Geometry.Point([93.9368, 24.8170]),
  "Shillong": ee.Geometry.Point([91.8833, 25.5788]),
  "Aizawl": ee.Geometry.Point([92.7176, 23.7271]),
  "Kohima": ee.Geometry.Point([94.1086, 25.6751]),
  "Bhubaneswar": ee.Geometry.Point([85.8245, 20.2961]),
  "Jaipur": ee.Geometry.Point([75.7873, 26.9124]),
  "Gangtok": ee.Geometry.Point([88.6138, 27.3314]),
  "Chennai": ee.Geometry.Point([80.2707, 13.0827]),
  "Hyderabad": ee.Geometry.Point([78.4867, 17.3850]),
  "Agartala": ee.Geometry.Point([91.2868, 23.8315]),
  "Lucknow": ee.Geometry.Point([80.9462, 26.8467]),
  "Dehradun": ee.Geometry.Point([78.0322, 30.3165]),
  "Kolkata": ee.Geometry.Point([88.3639, 22.5726])
};

Map.setCenter(78.9629, 22.5937, 5);

// ==============================
// 🌫️ DATASET 1: NO2 (Sentinel-5P)
// ==============================
var now = ee.Date(new Date());
var startDate = now.advance(-7, 'day');

var no2 = ee.ImageCollection('COPERNICUS/S5P/NRTI/L3_NO2')
  .filterDate(startDate, now)
  .select('tropospheric_NO2_column_number_density')
  .mean();

// ==============================
// 💨 DATASET 2: PM 2.5 (CAMS NRT)
// ==============================
var pm25 = ee.ImageCollection("ECMWF/CAMS/NRT")
  .filterDate(startDate, now)
  .select('particulate_matter_d_less_than_25_um_surface')
  .mean()
  .multiply(1e9)
  .rename('PM25');

// ==============================
// 🎨 VISUALIZATION & LAYERS
// ==============================
var no2Vis = {min: 0, max: 0.0002, palette: ['green', 'yellow', 'orange', 'red', 'purple']};
var pm25Vis = {min: 0, max: 150, palette: ['#00E400', '#FFFF00', '#FF7E00', '#FF0000', '#8F3F97']};

Map.addLayer(no2, no2Vis, 'Real-time NO2');
Map.addLayer(pm25, pm25Vis, 'Real-time PM 2.5');

// ==============================
// 📊 ANALYSIS PER CITY
// ==============================
print("--- 🇮🇳 State Capitals Air Quality Report ---");

// Combine bands for faster processing
var combined = pm25.addBands(no2);

Object.keys(cities).forEach(function(name) {
  var point = cities[name];
  
  // Add city marker to map
  Map.addLayer(point, {color: 'black'}, name);

  // Extract values
  var stats = combined.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: point,
    scale: 1000,
    bestEffort: true
  });

  print(ee.String("City: ").cat(name), stats);
});

// ==============================
// 📜 LEGEND
// ==============================
var legend = ui.Panel({style: {position: 'bottom-left', padding: '8px 15px'}});
legend.add(ui.Label('AQI Scale (PM 2.5 µg/m³)', {fontWeight: 'bold'}));
var entry = function(color, text) {
  return ui.Panel([ui.Label('', {backgroundColor: color, padding: '8px', margin: '0'}), 
                   ui.Label(text, {margin: '0 0 0 6px'})], ui.Panel.Layout.Flow('horizontal'));
};
legend.add(entry('#00E400', 'Good (0-30)'));
legend.add(entry('#FFFF00', 'Moderate (31-60)'));
legend.add(entry('#FF7E00', 'Poor (61-90)'));
legend.add(entry('#FF0000', 'Very Poor (91-120)'));
legend.add(entry('#8F3F97', 'Severe (121+)'));
Map.add(legend);