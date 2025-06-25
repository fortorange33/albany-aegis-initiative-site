// Add initial data load and rendering on DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
  showSpinner();
  try {
    const resp = await fetch('/public/data/crime.json');
    const data = await resp.json();
    await renderChoropleth(data.geoData, data.crimeTotals);
    await renderHeatmap(data.timeSeries);
    await renderTop10(data.byType);
    await renderDayOfWeek(data.byDay);
    hideSpinner();
  } catch (e) {
    hideSpinner();
    showError('Failed to load crime data');
    console.error(e);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("darkToggle");
  const body = document.body;

  // Apply saved preference on load
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
  }

  // Toggle dark mode on button click
  toggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");

    // Store user preference
    const newTheme = body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
  });
});

export async function renderChoropleth(geoData, crimeTotals) {
  const container = document.getElementById('choroplethContainer');
  container.innerHTML = '';
  container.classList.add('w-full', 'h-96');

  // Initialize map centered on Albany, NY
  const map = L.map('choroplethContainer').setView([42.6526, -73.7562], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Prepare color scale
  const values = Object.values(crimeTotals);
  const max = Math.max(...values);
  const grades = [0, max * 0.2, max * 0.4, max * 0.6, max * 0.8, max];
  function getColor(d) {
    return d > grades[4] ? '#800026' :
           d > grades[3] ? '#BD0026' :
           d > grades[2] ? '#E31A1C' :
           d > grades[1] ? '#FC4E2A' :
           d > grades[0] ? '#FD8D3C' :
                           '#FFEDA0';
  }

  // Style and interaction
  function style(feature) {
    const count = crimeTotals[feature.properties.NAME] || 0;
    return {
      fillColor: getColor(count), weight: 1, opacity: 1,
      color: 'white', dashArray: '3', fillOpacity: 0.7
    };
  }
  let geojson = L.geoJson(geoData, {
    style,
    onEachFeature: (feature, layer) => {
      const name = feature.properties.NAME;
      const count = crimeTotals[name] || 0;
      layer.bindPopup(`<strong>${name}</strong><br/>Crimes: ${count}`);
      layer.on({
        mouseover: e => {
          e.target.setStyle({ weight: 2, color: '#666', fillOpacity: 0.9 });
          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) e.target.bringToFront();
        },
        mouseout: e => geojson.resetStyle(e.target),
        click: e => e.target.openPopup()
      });
    }
  }).addTo(map);

  // Legend control
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = () => {
    const div = L.DomUtil.create('div', 'bg-white p-2 rounded shadow-lg text-xs');
    for (let i = 0; i < grades.length - 1; i++) {
      const from = Math.round(grades[i]), to = Math.round(grades[i + 1]);
      div.innerHTML +=
        `<i style="background:${getColor(grades[i] + 1)}; width:18px; height:18px; float:left; margin-right:8px; opacity:0.7;"></i> ${from}&ndash;${to}<br>`;
    }
    return div;
  };
  legend.addTo(map);
}

// Render temporal heatmap using Chart.js matrix chart
export async function renderHeatmap(timeSeries) {
  const container = document.getElementById('temporalHeatmapContainer');
  container.innerHTML = '<canvas id="temporalHeatmapCanvas" class="w-full h-full"></canvas>';
  const ctx = document.getElementById('temporalHeatmapCanvas').getContext('2d');

  // Map days to indices
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const data = timeSeries.map(d => ({ x: d.hour, y: days.indexOf(d.day), v: d.count }));
  const maxCount = Math.max(...timeSeries.map(d => d.count), 1);
  function getColor(v) {
    const c = Math.floor(255 * (1 - v / maxCount));
    return `rgb(255,${c},${c})`;
  }

  new Chart(ctx, {
    type: 'matrix',
    data: {
      datasets: [{
        label: 'Crime Density',
        data,
        backgroundColor: ctx => getColor(ctx.raw.v),
        width: ({chart}) => (chart.chartArea.right - chart.chartArea.left) / 24 - 1,
        height: ({chart}) => (chart.chartArea.bottom - chart.chartArea.top) / 7 - 1
      }]
    },
    options: {
      scales: {
        x: {
          type: 'linear', position: 'bottom', min: 0, max: 23,
          ticks: { stepSize: 1 }, title: { display: true, text: 'Hour of Day' }
        },
        y: {
          type: 'linear', position: 'left', min: 0, max: days.length - 1,
          ticks: { stepSize: 1, callback: val => days[val] },
          title: { display: true, text: 'Day of Week' }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: items => {
              const {x, y} = items[0].raw;
              return `${days[y]}, ${x}:00`;
            },
            label: item => `Count: ${item.raw.v}`
          }
        },
        legend: { display: false }
      }
    }
  });
}

// Render Top 10 Crime Types bar chart
export async function renderTop10(byType) {
  const container = document.getElementById('top10ChartContainer');
  container.innerHTML = '<canvas id="top10ChartCanvas" class="w-full h-full"></canvas>';
  const ctx = document.getElementById('top10ChartCanvas').getContext('2d');

  // Get top 10 entries
  const entries = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const labels = entries.map(e => e[0]);
  const data = entries.map(e => e[1]);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Count',
        data,
        backgroundColor: '#2563eb'
      }]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: { beginAtZero: true, title: { display: true, text: 'Count' } },
        y: { title: { display: true, text: 'Crime Type' } }
      },
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Top 10 Crime Types' }
      }
    }
  });
}

// Render crimes by day of week bar chart
export async function renderDayOfWeek(byDay) {
  const container = document.getElementById('dayOfWeekChartContainer');
  container.innerHTML = '<canvas id="dayOfWeekChartCanvas" class="w-full h-full"></canvas>';
  const ctx = document.getElementById('dayOfWeekChartCanvas').getContext('2d');

  const daysFull = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const data = daysFull.map(day => byDay[day] || 0);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: daysFull,
      datasets: [{
        label: 'Count',
        data,
        backgroundColor: '#2563eb'
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Count' } },
        x: { title: { display: true, text: 'Day of Week' } }
      },
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Crimes by Day of Week' }
      }
    }
  });
}