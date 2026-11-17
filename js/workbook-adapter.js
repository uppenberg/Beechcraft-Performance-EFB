import { AppState, CELL_MAPPING, TAKEOFF_RESULT_COLUMN_BY_FLAPS } from './app-state.js';

// Workbook access is isolated from rendering and other aircraft engines.

export function colLetterToIndex(letter) {
  let column = 0;
  for (let i = 0; i < letter.length; i++) {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, letter.length - i - 1);
  }
  return column - 1;
}

export function parseCellRef(cellRef) {
  const match = cellRef.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  const col = colLetterToIndex(match[1]);
  const row = parseInt(match[2], 10) - 1;
  return { col, row };
}

export function setWorkbookCellValues(sheetId, updates) {
  if (!AppState.hfInstance || updates.length === 0) return;
  AppState.hfInstance.batch(() => {
    updates.forEach(({ position, value }) => {
      AppState.hfInstance.setCellContents(
        { sheet: sheetId, col: position.col, row: position.row },
        [[value]]
      );
    });
  });
}

export function getOutputVal(sheetName, cellRef, roundNumber = true) {
  if (!AppState.hfInstance) return '-';
  if (!cellRef) return '-';
  try {
    const sheetId = AppState.hfInstance.getSheetId(sheetName);
    const pos = parseCellRef(cellRef);
    if (!pos) return '-';

    let val = AppState.hfInstance.getCellValue({ sheet: sheetId, col: pos.col, row: pos.row });
    if (roundNumber && typeof val === 'number') {
      val = Math.round(val);
    }

    return (val !== null && val !== undefined && val !== '') ? val : '-';
  } catch {
    return '-';
  }
}

export function getTakeoffOutput(outputKey, roundNumber = true) {
  const config = CELL_MAPPING.takeoff;
  const cellRef = config.outputs[outputKey];
  if (!cellRef) return '-';

  const column = TAKEOFF_RESULT_COLUMN_BY_FLAPS[
    document.getElementById('to-flaps')?.value || 'UP'
  ];
  const selectedCellRef = ['tor', 'tod', 'asd', 'v1', 'vr', 'v2', 'climbGrad'].includes(outputKey)
    ? `${column || 'C'}${cellRef.match(/\d+$/)?.[0]}`
    : cellRef;
  return getOutputVal(config.sheetName, selectedCellRef, roundNumber);
}

