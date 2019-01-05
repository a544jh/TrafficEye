let sites = [
    { lat: 53.903192, lon: -1.629799, id: 1 },
    { lat: 53.799186, lon: -1.534937, id: 4 },
    { lat: 53.796259, lon: -1.547696, id: 5 },
    { lat: 53.782096, lon: -1.559061, id: 7 },
]

let site_data = {};

let currentSite = 7;
let currentField = 'Co2'

function loadData(siteId) {
    function load() {
        initChart(site_data[siteId], currentField);
    }
    if (site_data[siteId]) {
        load();
        return;
    }
    fetch(`site_${siteId}.json`).then(res => res.json().then(data => {
        site_data[siteId] = data;
        load();
    }))
}


var mymap = L.map('map').setView([53.782096, -1.559061], 13);
loadData(currentSite);

addMarkers(sites);


var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

OpenStreetMap_Mapnik.addTo(mymap);

function addMarkers(site) {
    site.forEach(site => {
        let marker = L.marker([site.lat, site.lon]);
        marker.on('click', () => {
            currentSite = site.id;
            loadData(currentSite);
            mymap.panTo([site.lat, site.lon]);
        })
        marker.addTo(mymap);
    })

    // mymap.panTo([points[0][0], points[0][1]]);
}

let chart = null;

function initChart(data, field) {
    let points = data.map(p => p[field])
    let counts = Object.entries(_.countBy(points))
    if (field !== 'Co2') {
        counts = counts.sort(([ka, va], [kb, vb]) => {
            return ka.localeCompare(kb);
        })
    }
    let labels = counts.map(([k, v], i) => {
        return k;
    });
    let values = counts.map(([k, v], i) => {
        return v;
    });

    let min = Math.min(...values);
    let max = Math.max(...values);
    let colorScale = chroma.scale(['green', 'red']).mode('lrgb');
    let colors = values.map((v, i) => {
        let color = (field == 'Co2' ? colorScale(i / values.length) : colorScale((v - min) / (max - min)));
        return color.hex();
    });

    let ctx = document.getElementById("myChart");
    if (chart != null) {
        chart.destroy();
    }
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors
            }]
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            scaleShowValues: true,
            scales: {
                xAxes: [{
                    ticks: {
                        fontColor: 'black',
                        fontSize: 16,
                        autoSkip: (field == 'Co2')
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Count',
                        fontColor: 'black',
                        fontSize: 16
                    },
                    ticks: {
                        fontColor: 'black',
                        fontSize: 16
                    }
                }]
            }
        }
    })
}

let buttons = document.getElementById('buttons');
buttons.addEventListener('click', (e) => {
    
    let oldElem = buttons.querySelector(`[value="${currentField}"]`);
    oldElem.classList.remove('active')

    currentField = e.target.value;
    e.target.classList.add('active');
    initChart(site_data[currentSite], currentField);
})