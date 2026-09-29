let appAirports = [];
let activeAirport = null;

async function initApp() {
  console.log("Startar PWA och laddar lokal databas...");
  
  try {
    // Hämta flygplatser via db.js (från JSON eller IndexedDB)
    appAirports = await getAirports();
    populateAirportDropdowns();
  } catch (err) {
    console.error("Kunde inte ladda flygplatsdatabas:", err);
  }

  // Lyssna på online/offline-status
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  updateNetworkStatus();
}

function populateAirportDropdowns() {
  const selectTo = document.getElementById('in-to-c4');
  const selectLdg = document.getElementById('in-ldg-c4');
  
  if (!selectTo) return;

  selectTo.innerHTML = '<option value="">-- Välj flygplats/bana --</option>';
  if (selectLdg) selectLdg.innerHTML = '<option value="">-- Välj flygplats/bana --</option>';

  appAirports.forEach(airport => {
    airport.runways.forEach(rwy => {
      const optionVal = `${airport.icao} RWY ${rwy.designator}`;
      
      const opt1 = document.createElement('option');
      opt1.value = optionVal;
      opt1.innerText = `${airport.icao} - ${airport.name} (RWY ${rwy.designator})`;
      selectTo.appendChild(opt1);

      if (selectLdg) {
        const opt2 = document.createElement('option');
        opt2.value = optionVal;
        opt2.innerText = `${airport.icao} - ${airport.name} (RWY ${rwy.designator})`;
        selectLdg.appendChild(opt2);
      }
    });
  });
}

function updateNetworkStatus() {
  const statusElem = document.getElementById('network-status');
  if (!statusElem) return;
  
  if (navigator.onLine) {
    statusElem.innerText = "ONLINE";
    statusElem.className = "status-badge online";
  } else {
    statusElem.innerText = "OFFLINE";
    statusElem.className = "status-badge offline";
  }
}

// Kör igång när sidan laddas
window.addEventListener('DOMContentLoaded', initApp);
