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
    const airports = await resA.json();
    
    const resF = await fetch('./data/factors.json');
    const factors = await resF.json();

    const db = await openDB();
    const tx = db.transaction(['airports', 'factors'], 'readwrite');
    airports.forEach(a => tx.objectStore('airports').put(a));
    tx.objectStore('factors').put({ id: 'config', ...factors });

    return { airports, factors };
  } catch (err) {
    console.warn("Offline: Hämtar data från IndexedDB", err);
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(['airports', 'factors'], 'readonly');
      let airports = [], factors = {};
      tx.objectStore('airports').getAll().onsuccess = (e) => airports = e.target.result;
      tx.objectStore('factors').get('config').onsuccess = (e) => factors = e.target.result || {};
      tx.oncomplete = () => resolve({ airports, factors });
    });
  }
}
