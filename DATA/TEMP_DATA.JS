// ==============================
// 🇮🇳 ALL MAJOR CITIES + CAPITALS
// ==============================
var cities = {

  "Amaravati": ee.Geometry.Point([80.5185, 16.5062]),
  "Itanagar": ee.Geometry.Point([93.6053, 27.0844]),
  "Dispur": ee.Geometry.Point([91.7898, 26.1433]),
  "Patna": ee.Geometry.Point([85.1376, 25.5941]),
  "Raipur": ee.Geometry.Point([81.6296, 21.2514]),
  "Panaji": ee.Geometry.Point([73.8278, 15.4909]),
  "Gandhinagar": ee.Geometry.Point([72.6369, 23.2156]),
  "Chandigarh": ee.Geometry.Point([76.7794, 30.7333]),
  "Shimla": ee.Geometry.Point([77.1734, 31.1048]),
  "Ranchi": ee.Geometry.Point([85.3096, 23.3441]),
  "Bengaluru": ee.Geometry.Point([77.5946, 12.9716]),
  "Thiruvananthapuram": ee.Geometry.Point([76.9366, 8.5241]),
  "Bhopal": ee.Geometry.Point([77.4126, 23.2599]),
  "Mumbai": ee.Geometry.Point([72.8777, 19.0760]),
  "Imphal": ee.Geometry.Point([93.9368, 24.8170]),
  "Shillong": ee.Geometry.Point([91.8933, 25.5788]),
  "Aizawl": ee.Geometry.Point([92.9376, 23.7271]),
  "Kohima": ee.Geometry.Point([94.1086, 25.6751]),
  "Bhubaneswar": ee.Geometry.Point([85.8245, 20.2961]),
  "Jaipur": ee.Geometry.Point([75.7873, 26.9124]),
  "Gangtok": ee.Geometry.Point([88.6065, 27.3314]),
  "Chennai": ee.Geometry.Point([80.2707, 13.0827]),
  "Hyderabad": ee.Geometry.Point([78.4867, 17.3850]),
  "Agartala": ee.Geometry.Point([91.2868, 23.8315]),
  "Lucknow": ee.Geometry.Point([80.9462, 26.8467]),
  "Dehradun": ee.Geometry.Point([78.0322, 30.3165]),
  "Kolkata": ee.Geometry.Point([88.3639, 22.5726])

};

// Center map on India
Map.setCenter(78.9629, 22.5937, 5);

// ==============================
// 🌡️ TEMPERATURE VISUALIZATION
// ==============================
var tempVis = {
  min: 20, 
  max: 45, 
  palette: ['blue', 'green', 'yellow', 'orange', 'red']
};

// ==============================
// 🌡️ LOAD TEMPERATURE DATA
// ==============================
var tempCollection = ee.ImageCollection('MODIS/061/MOD11A2')
  .filterDate('2024-01-01', '2026-12-31')
  .sort('system:time_start', false);

var tempImage = ee.Image(tempCollection.first());

var tempLayer = tempImage
  .select('LST_Day_1km')
  .multiply(0.02)
  .subtract(273.15)
  .rename('Temp_Celsius');

// Add to map
Map.addLayer(tempLayer, tempVis, 'Land Surface Temp (°C)');
print("Latest Temp Image Date:", tempImage.date().format('YYYY-MM-dd'));

// ==============================
// 🎨 LEGEND
// ==============================
var legend = ui.Panel({
  style: { position: 'bottom-right', padding: '8px 15px' }
});

legend.add(ui.Label({
  value: 'LST Temp (°C)',
  style: {fontWeight: 'bold', fontSize: '14px'}
}));

function makeRow(color, name) {
  return ui.Panel({
    widgets: [
      ui.Label({style: {backgroundColor: color, padding: '8px'}}),
      ui.Label({value: name})
    ],
    layout: ui.Panel.Layout.Flow('horizontal')
  });
}

legend.add(makeRow('red', '45°C (Extreme)'));
legend.add(makeRow('orange', '38°C (Hot)'));
legend.add(makeRow('yellow', '32°C (Warm)'));
legend.add(makeRow('green', '26°C (Mild)'));
legend.add(makeRow('blue', '20°C (Cool)'));

Map.add(legend);

// ==============================
// 📊 CITY-WISE TEMPERATURE
// ==============================
Object.keys(cities).forEach(function(cityName) {

  var cityPoint = cities[cityName];

  Map.addLayer(cityPoint, {color: 'black'}, cityName);

  var stats = tempLayer.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: cityPoint,
    scale: 1000,
    bestEffort: true   // ✅ important fix
  });

  print("City: " + cityName, stats);
});