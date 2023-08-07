let myMap = L.map("map", {
  center: [40.7826, -73.9656],
  zoom: 14,
});

// Add the tile layer to the map (using OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(myMap);

const polygonApiUrl = "https://data.cityofnewyork.us/resource/qad5-y26n.json?$query=SELECT%20%60the_geom%60%2C%20%60id%60%2C%20%60xmin%60%2C%20%60xmax%60%2C%20%60ymin%60%2C%20%60ymax%60";

const apiUrl = "https://data.cityofnewyork.us/resource/vfnx-vebw.json?$query=SELECT%0A%20%20%60x%60%2C%0A%20%20%60y%60%2C%0A%20%20%60unique_squirrel_id%60%2C%0A%20%20%60hectare%60%2C%0A%20%20%60shift%60%2C%0A%20%20%60date%60%2C%0A%20%20%60hectare_squirrel_number%60%2C%0A%20%20%60age%60%2C%0A%20%20%60primary_fur_color%60%2C%0A%20%20%60highlight_fur_color%60%2C%0A%20%20%60combination_of_primary_and%60%2C%0A%20%20%60color_notes%60%2C%0A%20%20%60location%60%2C%0A%20%20%60above_ground_sighter%60%2C%0A%20%20%60specific_location%60%2C%0A%20%20%60running%60%2C%0A%20%20%60chasing%60%2C%0A%20%20%60climbing%60%2C%0A%20%20%60eating%60%2C%0A%20%20%60foraging%60%2C%0A%20%20%60other_activities%60%2C%0A%20%20%60kuks%60%2C%0A%20%20%60quaas%60%2C%0A%20%20%60moans%60%2C%0A%20%20%60tail_flags%60%2C%0A%20%20%60tail_twitches%60%2C%0A%20%20%60approaches%60%2C%0A%20%20%60indifferent%60%2C%0A%20%20%60runs_from%60%2C%0A%20%20%60other_interactions%60%2C%0A%20%20%60geocoded_column%60%2C%0A%20%20%60%3A%40computed_region_efsh_h5xi%60%2C%0A%20%20%60%3A%40computed_region_f5dn_yrer%60%2C%0A%20%20%60%3A%40computed_region_yeji_bk3q%60%2C%0A%20%20%60%3A%40computed_region_92fq_4b7q%60%2C%0A%20%20%60%3A%40computed_region_sbqj_enih%60";

const markerLayerGroup = L.layerGroup().addTo(myMap);
const gridLayerGroup = L.layerGroup().addTo(myMap);

function formatDate(dateString) {
  const day = dateString.substring(2, 4);
  const month = dateString.substring(0, 2);
  const year = dateString.substring(4, 8);
  return `${month}/${day}/${year}`;
}

fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(myMap);

    data.forEach(item => {
      const marker = L.marker([item.y, item.x]).addTo(myMap);
      const formattedDate = formatDate(item.date);

      let popupContent = `Unique ID: ${item.unique_squirrel_id} <br>
        Date: ${formattedDate} <br>
        Observation period: ${item.shift} <br>
        Fur Colors: ${item.combination_of_primary_and} <br>
        Location: ${item.location} <br>
        Age: ${item.age} <br>
        `
        
      if (item.specific_location) popupContent += `Specific location: ${item.specific_location} <br>`;
      if (item.chasing) popupContent += `Chasing Another Squirrel <br>`;
      if (item.running) popupContent += `Squirrel is running<br>`;
      if (item.climbing) popupContent += `Squirrel is climbing<br>`;
      if (item.eating) popupContent += `Squirrel is eating <br>`;
      if (item.foraging) popupContent += `Squirrel is foraging <br>`;
      if (item.kuks) popupContent += `Squirrel made a Kuks sound <br>`;
      if (item.quaas) popupContent += `Squirrel made a Quaas sound (ground predator nearby)<br>`;
      if (item.moans) popupContent += `Squirrel made a Moans sound (aerial predator nearby)<br>`;
      if (item.tail_flags) popupContent += `Tail Flagging <br>`;
      if (item.tail_twitches) popupContent += `Tail Twitching in curiosity <br>`;
      if (item.approaches) popupContent += `Approaching humans for food`;
      if (item.indifferent) popupContent += `Indifferent to humans<br>`;
      if (item.runs_from) popupContent += `Running from humans <br>`;
      if (item.other_activities || item.other_interactions) {
        popupContent += `Other Activity: ${item.other_activities || 'None'}, 
        ${item.other_interactions || 'None'} <br>`;
        
      }

      marker.bindPopup(popupContent);
      markerLayerGroup.addLayer(marker);
    });
  });


function generateGridNames() {
const gridNames = [];
const letters = "ABCDEFGHI";
const maxNumber = 42;

for (let i = maxNumber; i >= 1; i--) {
  for (let j = 0; j < letters.length; j++) {
    const gridName = letters[j] + i;
    gridNames.push(gridName);
  }
}


  return gridNames;
}

// Call the function to generate grid names from A1 to I100
const gridNames = generateGridNames();
console.log(gridNames);


  d3.json(polygonApiUrl).then((data) => {
    // Loop through each feature (in this case, a neighborhood)
    const labels = [];
    data.forEach((item, index) => {
      const coordinates = item.the_geom.coordinates[0][0];
      // Convert coordinates to LatLng format
      const latLngCoordinates = coordinates.map(coord => [coord[1], coord[0]]);
      // Create the Leaflet MultiPolygon layer
      const multiPolygonLayer = L.polygon(latLngCoordinates).addTo(myMap);
      
      const label = gridNames[index];
      multiPolygonLayer.bindPopup(`Hectare ID: ${label}`);


      multiPolygonLayer.on("mouseover", function (event) {
        const layer = event.target;
        // Update the style of the layer when mouseover event occurs
        layer.setStyle({
          fillOpacity: 0.9,
          // You can also add other styling changes here for mouseover
        });
        // const label = gridNames[index];
        // layer.bindPopup(`Hectare ID: ${label}`).openPopup();
        layer.openPopup();

      });


      multiPolygonLayer.on("mouseout", function (event) {
        const layer = event.target;
        // Reset the style of the layer when mouseout event occurs
        layer.setStyle({
          fillOpacity: 0.5,
          // You can reset other styling changes here for mouseout
        });
        layer.closePopup();

      });

      multiPolygonLayer.on("click", function (event) {
        const layer = event.target;
        // Zoom to the bounds of the clicked layer when click event occurs
        myMap.fitBounds(layer.getBounds());
        
      });
      gridLayerGroup.addLayer(multiPolygonLayer);

      // // Add a popup with information that's relevant to each feature
    });
    
  });
  const overlays = {
    "Markers": markerLayerGroup,
    "Grids": gridLayerGroup,
  };
  L.control.layers(null, overlays).addTo(myMap);
