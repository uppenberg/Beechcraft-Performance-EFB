import { persistAirportSelection, showAirportSelectionError, updateRunwaySuggestion } from './airport-ui.js';
import { AppState } from './app-state.js';
import { clearAirportMetar } from './results-ui.js';
import { CUSTOM_AIRPORT_ENABLED_KEY, isCustomAirportEnabled, loadAirportDatabase, loadCustomAirports, populateAirportSelects, restoreSavedMetar, saveCustomAirports } from './workbook-data.js';


// Custom airports, settings, and service worker controls

function isLocalDevelopmentHost() {
  return ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
}

export function updateCustomAirportIndicator() {
  const enabled = isCustomAirportEnabled();
  ['to', 'ldg'].forEach((prefix) => {
    const input = document.getElementById(`${prefix}-airport-icao`);
    if (!input) return;
    input.classList.toggle('custom-airport-active', enabled);
    input.title = enabled ? 'Custom airport data is in use (not airports.json)' : '';
    const badge = input.parentElement.querySelector('.custom-airport-badge');
    if (badge) badge.hidden = !enabled;
  });
}

export async function applyAirportSource() {
  AppState.globalData.airports = await loadAirportDatabase();
  populateAirportSelects();
  ['to', 'ldg'].forEach((prefix) => {
    persistAirportSelection(prefix);
    clearAirportMetar(prefix);
    restoreSavedMetar(prefix);
    updateRunwaySuggestion(prefix, '');
  });
  showAirportSelectionError('');
  updateCustomAirportIndicator();
}

export function setupCustomAirportUi() {
  const checkbox = document.getElementById('custom-airport-checkbox');
  const editButton = document.getElementById('edit-custom-airports-button');
  const dialog = document.getElementById('custom-airport-dialog');
  const form = document.getElementById('custom-airport-form');
  const list = document.getElementById('custom-airport-list');
  const errorElement = document.getElementById('custom-airport-error');
  const panel = document.getElementById('settings-panel');
  const toggle = document.getElementById('settings-toggle');
  if (!checkbox || !editButton || !dialog || !form || !list) return;

  const fields = {
    'ICAO': 'ca-icao',
    'RWY': 'ca-rwy',
    'RWY Elev [ft] (B6)': 'ca-elev',
    'TORA [m] (C6)': 'ca-tora',
    'TODA [m](D6)': 'ca-toda',
    'ASDA [m](E6)': 'ca-asda',
    'LDA [m](F6)': 'ca-lda',
    'Slope [%](G6)': 'ca-slope',
    'RWYHDG [°](H6)': 'ca-hdg',
    'min climb gradient OEI(I6)': 'ca-grad',
  };

  const showError = (message) => {
    errorElement.textContent = message;
    errorElement.hidden = !message;
  };

  const renderList = () => {
    const rows = loadCustomAirports();
    list.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement('div');
      empty.className = 'custom-airport-empty';
      empty.textContent = 'No custom runways saved yet.';
      list.appendChild(empty);
      return;
    }
    rows.forEach((row, index) => {
      const item = document.createElement('div');
      item.className = 'custom-airport-item';
      const label = document.createElement('span');
      label.textContent = `${row.ICAO} RWY ${row.RWY} · ${row['Engine out climb path']}`;
      const actions = document.createElement('div');
      actions.className = 'custom-airport-item-actions';
      const editRow = document.createElement('button');
      editRow.type = 'button';
      editRow.textContent = 'Edit';
      editRow.addEventListener('click', () => {
        Object.entries(fields).forEach(([key, id]) => {
          document.getElementById(id).value = row[key] ?? '';
        });
        document.getElementById('ca-turning').checked = row['Engine out climb path'] === 'Turning';
        showError('');
      });
      const deleteRow = document.createElement('button');
      deleteRow.type = 'button';
      deleteRow.textContent = 'Delete';
      deleteRow.addEventListener('click', async () => {
        const current = loadCustomAirports();
        current.splice(index, 1);
        saveCustomAirports(current);
        renderList();
        if (isCustomAirportEnabled()) await applyAirportSource();
      });
      actions.append(editRow, deleteRow);
      item.append(label, actions);
      list.appendChild(item);
    });
  };

  const syncEditButton = () => {
    checkbox.checked = isCustomAirportEnabled();
    editButton.hidden = !checkbox.checked;
  };
  syncEditButton();

  checkbox.addEventListener('change', async () => {
    localStorage.setItem(CUSTOM_AIRPORT_ENABLED_KEY, String(checkbox.checked));
    syncEditButton();
    try {
      await applyAirportSource();
    } catch (error) {
      console.error('Could not switch airport source:', error);
      showAirportSelectionError(`Could not switch airport source: ${error.message}`);
    }
  });

  function openDialog() {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    showError('');
    renderList();
    if (typeof dialog.showModal === 'function' && !dialog.open) dialog.showModal();
  }

  form.addEventListener('focusin', (event) => {
    if (event.target.matches('input:not([type="checkbox"])')) event.target.select();
  });

  editButton.addEventListener('click', openDialog);
  document.getElementById('custom-airport-close').addEventListener('click', () => dialog.close());

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const row = {};
    for (const [key, id] of Object.entries(fields)) {
      const value = document.getElementById(id).value.trim();
      if (value === '' || (key !== 'ICAO' && key !== 'RWY' && !Number.isFinite(Number(value)))) {
        showError(`Enter a valid value for ${key.replace(/\s*\(.*\)$/, '')}.`);
        return;
      }
      row[key] = key === 'ICAO' || key === 'RWY' ? value.toUpperCase() : String(Number(value));
    }
    if (!/^[A-Z0-9]{4}$/.test(row.ICAO)) {
      showError('ICAO must be 4 letters or digits.');
      return;
    }
    row['Engine out climb path'] = document.getElementById('ca-turning').checked ? 'Turning' : 'Straight';

    const rows = loadCustomAirports();
    const existing = rows.findIndex((item) => item.ICAO === row.ICAO && item.RWY === row.RWY);
    if (existing >= 0) rows[existing] = row;
    else rows.push(row);
    saveCustomAirports(rows);
    showError('');
    form.reset();
    renderList();
    if (isCustomAirportEnabled()) await applyAirportSource();
  });
}

export function setupSettingsMenu() {
  const toggle = document.getElementById('settings-toggle');
  const panel = document.getElementById('settings-panel');
  const updateButton = document.getElementById('check-updates-button');
  const updateDialog = document.getElementById('app-update-dialog');
  const installUpdateButton = document.getElementById('app-update-install');
  const laterUpdateButton = document.getElementById('app-update-later');
  const helpDialog = document.getElementById('help-dialog');
  const openHelpButton = document.getElementById('open-help-button');
  const helpCloseBtn = document.getElementById('help-close-btn');
  const helpCloseBtnFooter = document.getElementById('help-close-btn-footer');

  if (!toggle || !panel || !updateButton) return;
  if (isLocalDevelopmentHost()) {
    updateButton.disabled = true;
    updateButton.title = 'App updates are disabled while using Live Server.';
    setUpdateStatus('App updates are disabled while using Live Server.');
    const offlineButton = document.getElementById('offline-data-retry');
    if (offlineButton) {
      offlineButton.disabled = true;
      offlineButton.title = 'Offline file checks are disabled while using Live Server.';
    }
  }
  setupCustomAirportUi();
  setupOfflineReadiness();

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    panel.hidden = isOpen;
  });

  document.addEventListener('click', (event) => {
    if (!panel.hidden && !event.target.closest('.settings-menu')) {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });

  // Help dialog
  function openHelpDialog() {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    if (helpDialog && typeof helpDialog.showModal === 'function') {
      helpDialog.showModal();
    }
  }

  function closeHelpDialog() {
    helpDialog?.close();
  }

  openHelpButton?.addEventListener('click', openHelpDialog);
  helpCloseBtn?.addEventListener('click', closeHelpDialog);
  helpCloseBtnFooter?.addEventListener('click', closeHelpDialog);
  helpDialog?.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeHelpDialog();
  });

  // TOC links — scroll within dialog instead of following href anchors
  helpDialog?.querySelectorAll('.help-toc a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = helpDialog.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  updateButton.addEventListener('click', checkForAppUpdate);
  installUpdateButton?.addEventListener('click', () => {
    updateDialog?.close();
    checkForAppUpdate();
  });
  laterUpdateButton?.addEventListener('click', () => updateDialog?.close());
  updateDialog?.addEventListener('cancel', () => {
    updateDialog.close();
  });
}

export function setUpdateStatus(message) {
  const status = document.getElementById('update-status');
  if (status) status.textContent = message;
}

export function setOfflineDataStatus(message, state = '') {
  const status = document.getElementById('offline-data-status');
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('is-ready', state === 'ready');
  status.classList.toggle('is-error', state === 'error');
}

export async function waitForServiceWorkerReady(timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error('Timed out while starting offline support.'));
    }, timeoutMs);
    navigator.serviceWorker.ready.then(
      (registration) => {
        window.clearTimeout(timeout);
        resolve(registration);
      },
      (error) => {
        window.clearTimeout(timeout);
        reject(error);
      }
    );
  });
}

export async function getOfflineDataWorker({ retry = false } = {}) {
  if (isLocalDevelopmentHost()) {
    throw new Error('Offline file checks are unavailable while using Live Server.');
  }
  if (!('serviceWorker' in navigator)) {
    throw new Error('Offline file checks are not supported in this browser.');
  }

  let registration = AppState.appServiceWorkerRegistration || await navigator.serviceWorker.getRegistration();
  if (registration) AppState.appServiceWorkerRegistration = registration;
  let worker = navigator.serviceWorker.controller || registration?.active;
  if (worker) return worker;
  if (!retry) throw new Error('Open the app online once so offline support can start.');

  // A failed first install can leave a stale registration without a usable worker.
  // Registering again restarts that path; register() already starts its update check.
  const hasUsableRegistration = registration && (
    registration.active ||
    registration.waiting ||
    (registration.installing && registration.installing.state !== 'redundant')
  );
  if (!hasUsableRegistration) {
    registration = await navigator.serviceWorker.register('./sw.js', {
      updateViaCache: 'none',
    });
    AppState.appServiceWorkerRegistration = registration;
  }

  const installingWorker = registration.installing;
  if (installingWorker) await waitForServiceWorkerInstall(installingWorker);
  if (!registration.active && !registration.waiting) {
    registration = await waitForServiceWorkerReady();
    AppState.appServiceWorkerRegistration = registration;
  }

  worker = navigator.serviceWorker.controller || registration.active || registration.waiting;
  if (!worker) throw new Error('Offline support could not start. Connect to the internet and retry.');
  return worker;
}

export async function requestOfflineDataWorkerMessage(type) {
  const worker = await getOfflineDataWorker({ retry: type === 'RETRY_OFFLINE_DATA' });

  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timeout = window.setTimeout(() => {
      channel.port1.close();
      reject(new Error('The offline file check timed out.'));
    }, 60000);
    channel.port1.onmessage = (event) => {
      window.clearTimeout(timeout);
      channel.port1.close();
      resolve(event.data);
    };
    channel.port1.onmessageerror = () => {
      window.clearTimeout(timeout);
      channel.port1.close();
      reject(new Error('Could not read the offline file check result.'));
    };
    try {
      worker.postMessage({ type }, [channel.port2]);
    } catch (error) {
      window.clearTimeout(timeout);
      channel.port1.close();
      channel.port2.close();
      reject(error);
    }
  });
}

export async function updatePersistentStorageStatus(request = false) {
  const status = document.getElementById('offline-storage-status');
  if (!status) return;
  const storage = navigator.storage;
  if (!storage?.persisted) {
    status.textContent = 'Storage protection is unavailable in this browser.';
    return;
  }

  try {
    let persistent = await storage.persisted();
    if (!persistent && request && storage.persist) persistent = await storage.persist();
    status.textContent = persistent
      ? 'Persistent storage is enabled for this app.'
      : 'Storage is best-effort; the device may clear offline files. Recheck before relying on offline use.';
  } catch (error) {
    status.textContent = 'Could not check storage protection. Recheck offline files before use.';
    console.warn('Could not check persistent storage:', error);
  }
}

export async function checkOfflineData({ retry = false, requestPersistence = false } = {}) {
  const button = document.getElementById('offline-data-retry');
  const reloadButton = document.getElementById('offline-app-reload');
  if (button) button.disabled = true;
  if (reloadButton) reloadButton.hidden = true;
  setOfflineDataStatus(retry ? 'Checking and downloading missing files…' : 'Checking offline files…');
  try {
    if (requestPersistence) await updatePersistentStorageStatus(true);
    const result = await requestOfflineDataWorkerMessage(
      retry ? 'RETRY_OFFLINE_DATA' : 'CHECK_OFFLINE_DATA'
    );
    if (result.ready) {
      setOfflineDataStatus(
        AppState.appInitializationFailed && retry
          ? `✓ All ${result.total} files are available offline. Reload to retry app initialization.`
          : `✓ All ${result.total} app and performance files are available offline.`,
        'ready'
      );
      if (AppState.appInitializationFailed && retry && reloadButton) reloadButton.hidden = false;
    } else if (result.error) {
      setOfflineDataStatus(`Could not check offline files: ${result.error}`, 'error');
    } else if (retry) {
      setOfflineDataStatus(
        `${result.missing.length} file(s) could not be downloaded. Connect to the internet and retry.`,
        'error'
      );
    } else {
      setOfflineDataStatus(
        `${result.missing.length} file(s) are missing. Connect to the internet and tap Check / download.`,
        'error'
      );
    }
  } catch (error) {
    setOfflineDataStatus(`${error.message} Connect to the internet and retry.`, 'error');
  } finally {
    if (button) button.disabled = false;
  }
}

export function setupOfflineReadiness() {
  const button = document.getElementById('offline-data-retry');
  const reloadButton = document.getElementById('offline-app-reload');
  button?.addEventListener('click', () => {
    checkOfflineData({ retry: true, requestPersistence: true });
  });
  reloadButton?.addEventListener('click', () => window.location.reload());
  updatePersistentStorageStatus();
}

export function setUpdateAvailable(isAvailable) {
  const toggle = document.getElementById('settings-toggle');
  const updateButton = document.getElementById('check-updates-button');
  if (!toggle || !updateButton) return;

  toggle.classList.toggle('update-available', isAvailable);
  toggle.setAttribute('aria-label', isAvailable ? 'Open settings, update available' : 'Open settings');
  updateButton.textContent = isAvailable ? 'Update available — install' : 'Check for updates';
  if (isAvailable) {
    setUpdateStatus('A new app version is ready to install.');
    const updateDialog = document.getElementById('app-update-dialog');
    if (updateDialog && !updateDialog.open) updateDialog.showModal();
  }
}

export function watchForServiceWorkerUpdate(registration) {
  registration.addEventListener('updatefound', () => {
    const installingWorker = registration.installing;
    if (!installingWorker) return;

    installingWorker.addEventListener('statechange', () => {
      if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
        setUpdateAvailable(true);
      } else if (installingWorker.state === 'redundant') {
        setUpdateStatus('The update could not be installed. Check your connection and try again.');
      }
    });
  });
}

export async function registerAppServiceWorker() {
  if (isLocalDevelopmentHost()) return;

  if (!('serviceWorker' in navigator)) {
    setUpdateStatus('App updates are not supported in this browser.');
    setOfflineDataStatus('Offline file verification is not supported in this browser.', 'error');
    return;
  }

  try {
    AppState.appServiceWorkerRegistration = await navigator.serviceWorker.register('./sw.js', {
      updateViaCache: 'none'
    });

    let wasControlled = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Every open app tab must switch its document and modules together.
      // Do not reload when the first worker merely claims a newly installed app.
      if (wasControlled || AppState.reloadAfterServiceWorkerChange) window.location.reload();
      wasControlled = true;
    });

    watchForServiceWorkerUpdate(AppState.appServiceWorkerRegistration);

    if (AppState.appServiceWorkerRegistration.waiting && navigator.serviceWorker.controller) {
      setUpdateAvailable(true);
    } else {
      setUpdateStatus('Checking for app updates…');
    }

    await AppState.appServiceWorkerRegistration.update();
    if (AppState.appServiceWorkerRegistration.waiting && navigator.serviceWorker.controller) {
      setUpdateAvailable(true);
    } else if (!AppState.appServiceWorkerRegistration.installing) {
      setUpdateStatus('The app is up to date.');
    }
    navigator.serviceWorker.ready
      .then(() => checkOfflineData())
      .catch((error) => setOfflineDataStatus(`Could not start offline check: ${error.message}`, 'error'));
  } catch (error) {
    console.error('Could not register or check the app service worker:', error);
    setUpdateStatus('Could not check for updates. Check your connection and try again.');
    navigator.serviceWorker.getRegistration()
      .then((registration) => {
        if (navigator.serviceWorker.controller || registration?.active) {
          checkOfflineData();
        } else {
          setOfflineDataStatus('Open the app online once, then retry the offline download.', 'error');
        }
      })
      .catch((offlineError) => setOfflineDataStatus(
        `Could not verify offline files: ${offlineError.message}`,
        'error'
      ));
  }
}

export function waitForServiceWorkerInstall(worker) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      worker.removeEventListener('statechange', onStateChange);
      if (error) reject(error);
      else resolve();
    };
    const onStateChange = () => {
      if (worker.state === 'installed' || worker.state === 'activating' || worker.state === 'activated') {
        finish();
      } else if (worker.state === 'redundant') {
        finish(new Error('The app update worker became redundant before installation.'));
      }
    };
    const timeout = window.setTimeout(
      () => finish(new Error('Timed out while installing the app service worker.')),
      60000
    );
    onStateChange();
    if (!settled) worker.addEventListener('statechange', onStateChange);
  });
}

export function activateAppUpdate(worker) {
  AppState.reloadAfterServiceWorkerChange = true;
  setUpdateStatus('Installing the update and refreshing the app…');
  const updateButton = document.getElementById('check-updates-button');
  if (updateButton) updateButton.disabled = true;
  worker.postMessage({ type: 'SKIP_WAITING' });
}

export async function checkForAppUpdate() {
  if (isLocalDevelopmentHost()) {
    setUpdateStatus('App updates are disabled while using Live Server.');
    return;
  }
  const registration = AppState.appServiceWorkerRegistration;
  const updateButton = document.getElementById('check-updates-button');
  if (!registration || !updateButton) {
    setUpdateStatus('App updates are not available until the app is connected securely.');
    return;
  }

  updateButton.disabled = true;
  setUpdateStatus('Checking for app updates…');

  try {
    if (registration.waiting) {
      activateAppUpdate(registration.waiting);
      return;
    }

    const workerBeingInstalled = registration.installing;
    await registration.update();
    const installingWorker = registration.installing || workerBeingInstalled;
    if (!registration.waiting && installingWorker) {
      await waitForServiceWorkerInstall(installingWorker);
    }

    if (registration.waiting) {
      setUpdateAvailable(true);
      activateAppUpdate(registration.waiting);
    } else {
      setUpdateAvailable(false);
      setUpdateStatus('The app is already up to date.');
      updateButton.disabled = false;
    }
  } catch (error) {
    console.error('Could not install the app update:', error);
    setUpdateStatus('The update failed. Check your connection and try again.');
    updateButton.disabled = false;
  }
}

// 2. Ladda Excel-filen
