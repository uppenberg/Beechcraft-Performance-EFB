// Gemensamma hjälpfunktioner för afm-audit.
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const opts = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) opts[a.slice(2)] = argv[++i];
    else opts._.push(a);
  }
  return opts;
}

// Profil = JSON i profiles/ (eller en egen sökväg) med datafil, tabellnamn och OCR-kolumner.
function loadProfile(opts) {
  let profile = {};
  if (opts.profile) {
    const p = fs.existsSync(opts.profile) ? opts.profile : path.join(__dirname, 'profiles', opts.profile.replace(/\.json$/, '') + '.json');
    profile = JSON.parse(fs.readFileSync(p, 'utf8'));
    profile.file = path.resolve(path.join(__dirname, '..', '..'), profile.file);
  }
  if (opts.file) profile.file = path.resolve(opts.file);
  if (!profile.file) throw new Error('Ange --profile <namn> eller --file <datafil.js>');
  profile.crops = opts.crops || profile.crops || '/tmp/afm-crops';
  profile.work = opts.work || profile.work || '/tmp/afm-work';
  profile.tags = profile.tags || {};
  fs.mkdirSync(profile.work, { recursive: true });
  return profile;
}

// Läser in alla array-konstanter (takeoff-tabeller) i en datafil.
function loadTables(file) {
  const src = fs.readFileSync(file, 'utf8');
  const names = [...src.matchAll(/^\s*(?:export\s+)?const (\w+)\s*=\s*\[/gm)].map(m => m[1]);
  const body = src.replace(/^export\s+/gm, '') + `\nreturn {${names.join(',')}};`;
  return { src, names, tables: new Function(body)() };
}

// Tabellnamn kan anges som: exakt konstnamn, [tagg:]höjd (via profilens mall) eller unik delsträng.
function resolveConst(profile, names, token) {
  if (names.includes(token)) return token;
  const m = token.match(/^(?:(\w+):)?(\d+)$/);
  if (m) {
    const tag = m[1] || profile.defaultTag;
    const spec = profile.tags[tag];
    if (!spec) throw new Error(`Okänd tagg "${tag}" för ${token} (saknas i profilen)`);
    const alt = +m[2];
    const mapped = spec.alts && spec.alts[String(alt)];
    const name = mapped || (alt === 0 && spec.alt0 ? spec.alt0 : spec.template.replace('{alt}', alt));
    if (!names.includes(name)) throw new Error(`Konstanten ${name} finns inte i ${profile.file}`);
    return name;
  }
  const hits = names.filter(n => n.includes(token));
  if (hits.length !== 1) throw new Error(`"${token}" matchar ${hits.length} konstanter${hits.length ? ': ' + hits.join(', ') : ''}`);
  return hits[0];
}

module.exports = { parseArgs, loadProfile, loadTables, resolveConst };
