let fadeIn = [

  {opacity: 0},
  {opacity: 1}

]

let fadeOut = [

  {opacity: 0},
  {opacity: 1}

]

let map = {
  currentCategory: "",
  locations: {},
  userCoord: [],
  currentMarkers: [],
  showMap() {
    this.map = L.map("map", {
      center: this.coordinates,
      zoom: 11,
    });
    // add openstreetmap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      minZoom: "15",
    }).addTo(this.map);
    // create and add geolocation marker
    const marker = L.marker(this.coordinates);
    marker
      .addTo(this.map)
      .bindPopup(`<p><b>current position</b><br>${this.coordinates}</p>`)
      .openPopup();
  },
  addMarkersAndCards() {
    this.currentMarkers = [];
    for (let i = 0; i < this.locations.length; i++) {
      this.markers = L.marker([
        this.locations[i].coord[0],
        this.locations[i].coord[1],
      ])
        .bindPopup(
          `<p><b>${this.locations[i].name}</b><br>${this.locations[i].coord}</b></p>`
        )
        .addTo(this.map);
      this.currentMarkers.push(this.markers);
      document.getElementById("locCardsContainer").innerHTML += `

      <div id="locCard${i}" class="locCard">
        <p id="cardLocationName${i} class="cardLocationName">
            ${this.locations[i].name}
        </p>
      </div>

      `;

      let link = document.createElement("a");
      link.textContent = "Google Maps...";
      link.style = "width: 100%"
      link.href = `https://www.google.com/maps/search/?api=1&query=${this.locations[i].name}`
      document
        .getElementById(`locCard${i}`)
        .insertAdjacentElement("beforeend", link);
    }
    //console.log(this.currentMarkers)
  },

  removeMarkers() {
    console.log("removeMarkers fired");
    console.log(this.currentMarkers);
    for (let i = 0; i < this.currentMarkers.length; i++) {
      console.log("a part");
      console.log(this.currentMarkers[i]);
      this.currentMarkers[i].remove();
    }
  },
};

async function getUserCoords() {
  const pos = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
  return [pos.coords.latitude, pos.coords.longitude];
}
async function foursquareByID(categoryID) {
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: "fsq3ATzZbmcGhdeFafr73wZcnJ+LlN6bK+4dh19a7ClS4u8=",
    },
  };
  let limit = document.getElementById("maxLoc").value;
  let lat = map.coordinates[0];
  let lon = map.coordinates[1];
  let response = await fetch(
    `https://api.foursquare.com/v3/places/search?&categories=${categoryID}&limit=${limit}&ll=${lat}%2C${lon}`,
    options
  );
  let data = await response.text();
  let parsedData = JSON.parse(data);
  let locations = parsedData.results;
  //console.log(locations)
  return locations;
}
// process foursquare array
function processBusinesses(data) {
  let businesses = data.map((element) => {
    let location = {
      name: element.name,
      coord: [element.geocodes.main.latitude, element.geocodes.main.longitude],
    };
    return location;
  });
  return businesses;
}
window.onload = async () => {
  const coords = await getUserCoords();
  map.coordinates = coords;
  map.showMap();
};

document
  .getElementById("selector")
  .addEventListener("change", async (event) => {
    let selectorCategoryID = document.getElementById("selector").value;
    console.log("selector onchange (change) event fired");
    console.log(this);
    console.log(event);
    map.currentCategory = selectorCategoryID;
    map.removeMarkers();
    document.getElementById("locCardsContainer").innerHTML = `loading...`;
    if (map.currentCategory != "") {
      let businessData = await foursquareByID(selectorCategoryID);
      console.log(businessData)
      map.locations = processBusinesses(businessData);
      
      document.getElementById("locCardsContainer").innerHTML = ``;

      map.addMarkersAndCards();
      document.getElementById("locCardsContainer").animate(fadeIn, 400)

      
    }
  });
