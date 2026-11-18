// Edit only the affected OOXML parts. Excel may have saved notes, styling and
// additional worksheets that a full import/export would otherwise discard.
const path = require('node:path').posix;
const JSZip = require('jszip');
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');

const sheetNS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const relNS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const parse = text => new DOMParser().parseFromString(text.replace(/^\uFEFF/, ''), 'application/xml');
const elements = (node, name) => Array.from(node.getElementsByTagNameNS('*', name));
const child = (parent, name) => {
  const node = parent.ownerDocument.createElementNS(parent.namespaceURI, parent.prefix ? parent.prefix + ':' + name : name);
  return parent.appendChild(node);
};
const resolvePart = (from, target) => target.startsWith('/') ? target.slice(1) : path.join(path.dirname(from), target);

async function openWorkbook(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const read = async part => parse(await zip.file(part).async('string'));
  const changed = new Map();
  const save = (part, doc) => changed.set(part, doc);
  const main = 'xl/workbook.xml';
  const relPath = 'xl/_rels/workbook.xml.rels';
  const workbook = await read(main);
  const rels = await read(relPath);
  const shared = zip.file('xl/sharedStrings.xml') ? elements(await read('xl/sharedStrings.xml'), 'si')
    .map(si => elements(si, 't').map(t => t.textContent).join('')) : [];

  async function sheet(name, create = false) {
    const sheets = elements(workbook, 'sheets')[0];
    let def = elements(sheets, 'sheet').find(e => e.getAttribute('name') === name);
    let doc, part;
    if (def) {
      const id = def.getAttributeNS(relNS, 'id');
      const rel = elements(rels, 'Relationship').find(e => e.getAttribute('Id') === id);
      part = resolvePart(main, rel.getAttribute('Target'));
      doc = await read(part);
    } else {
      if (!create) throw Error('Excelblad saknas: ' + name);
      const next = 1 + Math.max(...elements(sheets, 'sheet').map(e => Number(e.getAttribute('sheetId'))));
      part = 'xl/worksheets/catalogArchive' + next + '.xml';
      const id = 'rCatalogArchive' + next;
      def = child(sheets, 'sheet');
      def.setAttribute('name', name);
      def.setAttribute('sheetId', String(next));
      def.setAttributeNS(relNS, 'r:id', id);
      const rel = child(rels.documentElement, 'Relationship');
      rel.setAttribute('Id', id);
      rel.setAttribute('Type', relNS + '/worksheet');
      rel.setAttribute('Target', '/' + part);
      const types = await read('[Content_Types].xml');
      const entry = child(types.documentElement, 'Override');
      entry.setAttribute('PartName', '/' + part);
      entry.setAttribute('ContentType', 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml');
      doc = parse('<worksheet xmlns="' + sheetNS + '"><sheetData/></worksheet>');
      save(main, workbook); save(relPath, rels); save('[Content_Types].xml', types); save(part, doc);
    }
    const data = elements(doc, 'sheetData')[0];
    const rows = () => elements(data, 'row');
    const cells = row => elements(row, 'c');
    const column = cell => cell.getAttribute('r').replace(/\d+$/, '');
    function value(row, col) {
      const c = cells(row).find(e => column(e) === col);
      if (!c) return '';
      if (c.getAttribute('t') === 'inlineStr') return elements(c, 't').map(e => e.textContent).join('');
      const v = elements(c, 'v')[0]?.textContent ?? '';
      return c.getAttribute('t') === 's' ? shared[Number(v)] : v;
    }
    function set(row, col, text) {
      if (typeof text === 'number' ? value(row, col) !== '' && Number(value(row, col)) === text : value(row, col) === text) return;
      let c = cells(row).find(e => column(e) === col);
      if (!c) {
        c = child(row, 'c');
        c.setAttribute('r', col + row.getAttribute('r'));
        const after = cells(row).find(e => column(e).length > col.length || (column(e).length === col.length && column(e) > col));
        if (after) row.insertBefore(c, after);
      }
      while (c.firstChild) c.removeChild(c.firstChild);
      c.setAttribute('t', typeof text === 'number' ? 'n' : 'inlineStr');
      if (typeof text === 'number') child(c, 'v').textContent = String(text);
      else child(child(c, 'is'), 't').textContent = text;
      save(part, doc);
    }
    function append(template) {
      const row = child(data, 'row');
      const prev = row.previousSibling;
      const n = Number(prev?.nodeType === 1 ? prev.getAttribute('r') : rows().at(-2)?.getAttribute('r') || 0) + 1;
      row.setAttribute('r', String(n));
      row.setAttribute('ht', '78'); row.setAttribute('customHeight', '1');
      if (template) for (const c of cells(template)) {
        const blank = child(row, 'c');
        blank.setAttribute('r', column(c) + n);
        if (c.hasAttribute('s')) blank.setAttribute('s', c.getAttribute('s'));
      }
      save(part, doc);
      return row;
    }
    function remove(row) { data.removeChild(row); save(part, doc); }
    async function resizeTable() {
      const last = rows().length;
      rows().forEach((row, i) => {
        if (row.getAttribute('r') === String(i + 1)) return;
        row.setAttribute('r', String(i + 1));
        for (const c of cells(row)) c.setAttribute('r', column(c) + (i + 1));
        save(part, doc);
      });
      const ref = elements(doc, 'tablePart')[0];
      if (!ref) throw Error('Excel-tabell saknas på blad ' + name);
      const sheetRels = await read(path.join(path.dirname(part), '_rels', path.basename(part) + '.rels'));
      const link = elements(sheetRels, 'Relationship').find(e => e.getAttribute('Id') === ref.getAttributeNS(relNS, 'id'));
      const tablePath = resolvePart(part, link.getAttribute('Target'));
      const table = await read(tablePath);
      const old = table.documentElement.getAttribute('ref');
      const next = old.replace(/\d+$/, String(last));
      if (old !== next) {
        table.documentElement.setAttribute('ref', next);
        for (const filter of elements(table, 'autoFilter')) filter.setAttribute('ref', next);
        save(tablePath, table);
      }
      const dim = elements(doc, 'dimension')[0];
      if (dim && changed.has(part)) dim.setAttribute('ref', next);
    }
    return { rows, value, set, append, remove, resizeTable, cells, column };
  }
  return { sheet, changed, async bytes() {
    for (const [part, doc] of changed) zip.file(part, new XMLSerializer().serializeToString(doc));
    return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  } };
}
module.exports = { openWorkbook };
