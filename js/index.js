

const SPREADSHEET_ID = '10OXHlQ6MX8v3XZo31SYS1swNMb1kNCvPLuY9ZzNNBuQ'
const SPREADSHEET_KEY = 'AIzaSyCl1KgoO1DBJj_En9Gs0z4XIc91uGChwS8'

const DATA = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchGet?dateTimeRenderOption=FORMATTED_STRING&majorDimension=ROWS&ranges=A1%3AZ1000&valueRenderOption=FORMATTED_VALUE&key=${SPREADSHEET_KEY}`

let a = $.ajax({
    type: "GET",
    url: DATA,
    dataType: "json",
    success: function (csvData) {
        console.log('ok')
    }
}).done(json => {

    let res = json.valueRanges[0].values

    let data = []

    for (let i = 1; i < res.length; i++) {
        let object = {}
        for (let j = 0; j < res[i].length; j++) {
            let a = res[0][j]
            object[a] = res[i][j]

        }
        data.push(object)
    }

    let mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
    let mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    let grayscale = L.tileLayer(mbUrl, { id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr })

    let map = L.map('map', {
        center: [39.73, -104.99],
        zoom: 10,
        layers: [grayscale]
    });

    let jsonFeatures = [];

    data.forEach(function (point) {
        let lat = parseFloat(point.latitude);
        let lon = parseFloat(point.longitude);

        let feature = {
            type: 'Feature',
            properties: point,
            geometry: {
                type: 'Point',
                coordinates: [lon, lat]
            }
        };

        jsonFeatures.push(feature);
    });

    function PoIstile(feature, latlng) {
        let fontanaIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style='background-color:#c30b82;' class='marker-pin'></div><img src="${feature.properties.image_path}" alt="photo" style="width:50px">`,
            iconSize: [30, 42],
            iconAnchor: [25, 30]
        });

        return L.marker(latlng, {
            icon: fontanaIcon
        });
    };

    let geoFile = {
        type: 'FeatureCollection',
        features: jsonFeatures
    };

    let markers = L.markerClusterGroup({
        spiderfyOnMaxZoom: false,
        removeOutsideVisibleBounds: false,
        disableClusteringAtZoom: 8,
        showCoverageOnHover: false,
        maxClusterRadius: 50,
        animateAddingMarkers: true,
        iconCreateFunction: cluster => {
            let markers = cluster.getAllChildMarkers();
            let first = markers[0].feature.properties.image_path
            let html = `<img class="first-icon-cluster" src="${first}"></img><div class="circle">${markers.length}</div>`;
            return L.divIcon({
                html: html,
                className: 'mycluster',
                iconSize: L.point(32, 32)
            });
        },
    });

    let popupShow = (feature, layer) => {
        layer.bindPopup(`<img class="img-popup" src="${feature.properties.image_path}"></img><h3>${feature.properties.name}</h3><p>${feature.properties.description}</p>`);
    }

    let geojson = L.geoJson(geoFile, {
        pointToLayer: PoIstile,
        onEachFeature: popupShow
    })

    markers.addLayer(geojson);

    map.addLayer(markers);
    map.fitBounds(markers.getBounds());
    markers.on('click', a => {
        let prop = a.layer.feature.properties
        console.log(prop)
    });
})