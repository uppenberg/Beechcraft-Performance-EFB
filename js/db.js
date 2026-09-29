const DB_NAME = 'BE20_EFB_DB';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('airports')) db.createObjectStore('airports', { keyPath: 'icao' });
      if (!db.objectStoreNames.contains('factors')) db.createObjectStore('factors', { keyPath: 'id' });
    };
  });
}

async function loadData() {
  try {
    const resA = await fetch('./data/airports.json');
    if (!resA.ok) throw new Error('Kunde inte hämta airports.json');
    const airports = await resA.json();
    
    const resF = await fetch('./data/factors.json');
    if (!resF.ok) throw new Error('Kunde inte hämta factors.json');
    const factors = await resF.json();

    const db = await openDB();
    const tx = db.transaction(['airports', 'factors'], 'readwrite');
    airports.forEach(a => tx.objectStore('airports').put(a));
    tx.objectStore('factors').put({ id: 'config', ...factors });

    return { airports, factors };
  } catch (err) {
    console.warn("Använder cachad data från IndexedDB pga nätverksfel eller sökväg:", err);
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(['airports', 'factors'], 'readonly');
      let airports = [], factors = {};
      
      const reqA = tx.objectStore('airports').getAll();
      reqA.onsuccess = (e) => airports = e.target.result;

      const reqF = tx.objectStore('factors').get('config');
      reqF.onsuccess = (e) => factors = e.target.result || {};

      tx.oncomplete = () => {
        // Om IndexedDB är helt tom, returnera hårdkodad grunddata så appen inte hänger sig
        if (!airports.length) {
          airports = [
            {
              icao: "ESPA",
              name: "Luleå Airport",
              runways: [{ designator: "14 A3", heading: 127, elevationFt: 65, slope: 0.0, tora: 2250, toda: 2250, asda: 3150, lda: 3350, minClimbGradient: 3.3 }]
            }
          ];
        }
        resolve({ airports, factors });
      };
    });
  }
}
