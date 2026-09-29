const DB_NAME = 'AviationEFB_DB';
const DB_VERSION = 1;
const STORE_NAME = 'airports';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'icao' });
      }
    };
  });
}

async function saveAirportsToCache(airports) {
  const db = await openDatabase();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  airports.forEach(airport => store.put(airport));
  return tx.complete;
}

async function getAirports() {
  try {
    // Försök ladda lokalt från JSON-fil
    const response = await fetch('./data/airports.json');
    if (!response.ok) throw new Error('Kunde inte läsa airports.json');
    const airports = await response.json();
    
    // Spara undan i IndexedDB för offline-bruk
    await saveAirportsToCache(airports);
    return airports;
  } catch (error) {
    console.warn("Använder offline-databas från IndexedDB:", error);
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
