document.addEventListener("DOMContentLoaded", () => {
    const container = document.createElement("div");
    container.id = "incident-panel";
    container.style = `
      position: absolute;
      bottom: 1rem;
      left: 1rem;
      width: 300px;
      max-height: 40%;
      overflow-y: auto;
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.15);
      font-family: sans-serif;
      font-size: 0.85rem;
      z-index: 12;
    `;
    document.body.appendChild(container);
  
    const header = document.createElement("div");
    header.innerHTML = `<strong style="display:block;padding:0.75rem;border-bottom:1px solid #ddd;">Recent Incidents</strong>`;
    container.appendChild(header);
  
    const body = document.createElement("div");
    body.id = "incident-list";
    body.style.padding = "0.5rem";
    container.appendChild(body);
  
    // Fetch or simulate data
    fetch("data/incidents.json")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          renderIncidents(data);
        } else {
          body.innerHTML = "<p style='padding:0.5rem;'>No data available.</p>";
        }
      })
      .catch(() => {
        body.innerHTML = "<p style='padding:0.5rem;'>Failed to load incident data.</p>";
      });
  
    function renderIncidents(incidents) {
      body.innerHTML = "";
      incidents.slice(0, 6).forEach((incident) => {
        const card = document.createElement("div");
        card.style = `
          margin-bottom: 0.5rem;
          padding: 0.5rem;
          border-radius: 0.375rem;
          background: #f9fafb;
          border-left: 4px solid ${incident.color || '#3b82f6'};
        `;
        card.innerHTML = `
          <div><strong>${incident.type}</strong></div>
          <div style="font-size:0.75rem;color:#555;">${incident.location}</div>
          <div style="font-size:0.75rem;color:#888;">${incident.time}</div>
        `;
        body.appendChild(card);
      });
    }
  });