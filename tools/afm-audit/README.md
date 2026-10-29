# AFM-auditverktyg för takeoff-tabeller

Det här paketet är generaliserat för takeoff-filerna i [data/c56x/](/home/uppenberg1/Github/Beechcraft-Performance-EFB/data/c56x).
Det stöder samma radformat som `temp/tailwind/zero/headwind/vr/v2`-tabellerna använder.

## Vad som stöds nu

- `takeoff-dry-flaps7.js`
- `takeoff-dry-flaps15.js`
- `takeoff-wet-flaps7.js`
- `takeoff-wet-flaps15.js`
- `takeoff-wet-flaps15-no-reverser.js`
- `climb-gradient`-tabeller i formatet `altitudeFt / weights / data / windKnots`

Profiler finns i [tools/afm-audit/profiles/](/home/uppenberg1/Github/Beechcraft-Performance-EFB/tools/afm-audit/profiles).

## Vad som inte stöds ännu

Filer med annan struktur, till exempel takeoff-gradient och climb-flightpath, kräver extra parserstöd.

## Viktig princip

OCR används bara som sållning. Ändra aldrig data enbart från OCR – verifiera alltid visuellt mot PDF.

## Kommandon

Kör från repo-roten:

```bash
node tools/afm-audit/show.js --profile dry-flaps7 off:3000-14500
node tools/afm-audit/show.js --profile wet-flaps15 on:0-15000
```

```bash
node tools/afm-audit/apply.js --profile dry-flaps7 /tmp/c56w/b18.txt
```

```bash
node tools/afm-audit/analyze.js --profile dry-flaps7 --crops /tmp/c56-ocr-crops
```

```bash
node tools/afm-audit/sort-rows.js data/c56x/takeoff-wet-flaps15.js
```

```bash
node tools/afm-audit/compare.js --profile dry-flaps15 batch.txt   # jämför utan att ändra
node tools/afm-audit/check.js batch.txt                           # rimlighetskontroll av avläsning
```

```bash
node tools/afm-audit/columns.js /tmp/afm-crops/off-3000-14500.tsv
```

## Spec-format

`show.js` accepterar:

- `[tagg:]höjd-vikt` (ex. `off:3000-14500`, `on:0-16000`)
- `KONSTANT@vikt`
- unik del av konstantnamn + `@vikt` (om träffen är unik)

`apply.js` batchfil:

1. Rubrikrad: `<tabellspec>|<vikt>`
2. Därefter en rad per temperatur med exakt 13 heltal:
   `temp tailV1 tailDist zeroV1 zeroDist h10V1 h10Dist h20V1 h20Dist h30V1 h30Dist vr v2`

Exempel:

```txt
off:3000|14500
-30 95 3760 95 3200 95 2980 95 2780 95 2610 96 109
...
```

## Profiler

En profil innehåller minst:

- `file`: målfil
- `defaultTag`: fallback-tag
- `tags.<tag>.template` och ev. `alt0` / `alts`
- valfritt OCR-upplägg: `cols`, `yMin`, `yMax`

`resolveConst` stöder:

- exakt konstantnamn
- `[tagg:]höjd` via profilmall
- unik delsträng

## OCR-flöde för nya PDF:er

1. Rendera PDF till bild (externa verktyg krävs).
2. Beskär tabeller till `*.png` (se [crop_png.py](/home/uppenberg1/Github/Beechcraft-Performance-EFB/tools/afm-audit/crop_png.py)).
3. Kör Tesseract till `*.tsv`.
4. Kalibrera kolumner med `columns.js` och lägg in `cols` i profil.
5. Kör `analyze.js` för att prioritera tabeller.
6. Verifiera visuellt och applicera hela block med `apply.js`.

## Radordning

Efter `apply.js` sorteras temperaturerna stigande inom varje `data`-array automatiskt.
Du kan också köra [sort-rows.js](/home/uppenberg1/Github/Beechcraft-Performance-EFB/tools/afm-audit/sort-rows.js) separat.


## Arbetsflöde och lärdomar (Flaps 7 och Flaps 15)

1. Gör backup av datafilen först (utanför repot).
2. Läs av AFM till en batchfil (`<tabell>|<vikt>` + 13 heltal/rad). Alla tabeller i en fil kan ligga i samma batch.
3. `check.js batch.txt` – flaggar felavläsningar innan något skrivs.
4. `compare.js` – visar exakt vad som skiljer (rad/kolumn, kod mot AFM, saknade/extra temperaturer).
5. Visa användaren statistiken och be om stickprov när hela block ersätts. Ersätt sedan med `apply.js`
   (sorterar lägsta temp först, kontrollerar syntax och CRLF).
6. Kör `compare.js` igen: målet är 0 skillnader (jämförelsen är mot din avläsning, så visuell kontroll behövs fortfarande).

### Läs alltid från samma tabell
Jämför höjd, vikt och anti-ice-läge mot rätt PDF-sida. Flaps 15 OFF har två sidor per höjd
(udda sida: 20000/19000/18000 vänster, 19500/18500/17500 höger; jämn sida: 17000/16000/14500 och 16500/15500/13500).
Flaps 15 ON har en sida per höjd med 10 vikter och temperaturer -30..10.

### Bildbaserade PDF:er utan textlager och utan tesseract
- Rendera sidor med pymupdf (300 dpi), tröskla (gråvärde < 140), ta bort långa linjer och hitta tecken
  som sammanhängande komponenter.
- Klustra tecken med k-means (K≈48) och märk varje kluster till en siffra visuellt en gång. Tunga OCR-motorer
  (rapidocr) var alldeles för långsamma (~1 min/sida).
- Minustecken är mycket låga, breda komponenter. Sammanslagna tecken (bredare än en siffra) delas via kolumnprojektion.
- En giltig rad har exakt 13 ord. Rader med okända tecken (`?`) ska aldrig gissas – läs dem visuellt från en beskärning.

### Fallgropar
- **Skuggade (dithrade) celler** ger tyst felaktiga siffror (V1 som 405/465, avstånd som 6840 i stället för 6810).
  Hitta dem genom att leta efter täta områden med många små komponenter (≤4 px) och läs dem manuellt.
  Typiskt: heta, tunga rader i motvindskolumnen (flaps 15 OFF 4000–6000 ft, 20000 lb).
- Avstånd ska sluta på 0, minska med motvind och V1 ligga ca 80–110. Avvikelser = misstänkt avläsning.
- Avstånd som minskar när temperaturen ökar vid vissa vikter är äkta AFM-data (V1-begränsning), inte fel.
- Låga VR/V2 vid 13500 lb är normalt.
- Några tabeller har andra temperatursteg/ändar än förväntat (t.ex. 46, 48 eller 50 °C i översta raden) – kopiera exakt från AFM.
- Kontrollera att PDF:en täcker alla höjder i filen; höjder som saknas i PDF:en kan inte granskas.
- `view`-verktyget behöver ibland en nyskapad PNG-fil i ett separat anrop.

## Automatisk avläsning av bild-PDF:er (glyph-pipeline)

AFM-PDF:erna saknar textlager. Tesseract fungerar INTE (hänger utan `OMP_THREAD_LIMIT=1`, slår ihop/tappar siffror). Använd i stället:

- Miljö: `python3 -m venv --system-site-packages /tmp/afmenv && /tmp/afmenv/bin/pip install pymupdf pillow numpy scipy scikit-learn`
- `read_pages.py PDF TAG OUT.txt --weights w1,w2,.. [--two-per-alt] [--pages 1,2] [--maxd 4.5]`
  - ON-sidor (flaps7 wet): 10 block/sida, vikter 20000,19500,19000,18500,18000,17500,16500,15500,14500,13500.
  - OFF-sidor: 6 block/sida, 2 sidor per höjd, `--two-per-alt`, vikter 20000..17500 resp. 17000,16500,16000,15500,14500,13500.
  - Skriver OUT.txt (rena rader, kan matas direkt till compare/apply), OUT.txt.todo (VERIFIERA/OSÄKER) och OUT.txt.rows.json.
- `crop.py PDF OUT.txt.rows.json PREFIX --per 12` ger bilder av flaggade rader med avläst text i rött ovanför → granska visuellt, rätta i en korrigeringsfil.
- Mallar: `glyph_templates.json` (k-means-centroider + etiketter), `glyphs.py` (rendering, radborttagning, sammanvuxna siffror delas där summan av klassdistans är lägst).
- Lärdomar: raster-/skuggade celler (tung, varm, hög temp, tail-kolumnen) läses fel → alltid visuell kontroll av flaggade rader; temp "5" intill ramen är falskt larm; 5-siffriga avstånd (10120) ger OSÄKER och måste läsas manuellt; kör alltid `check.js` på batchen, sedan `compare.js`, sedan `apply.js` (säkerhetskopiera först).
- Hela flödet för wet flaps7 tog ~4 min läsning + ~60 manuellt rättade rader.

## Climb-gradient-tabeller

För sekundsegmentets nettostiggradient används en separat profil eftersom AFM-tabellen
har höjdblock, viktkolumner och fem vindkolumner i ett annat format än takeoff-tabellerna.
Tesseract används endast för första avläsning; granska alltid värdena visuellt mot PDF:en.
Läsaren OCR:ar en viktpanel i taget, och profilen kan ange separata horisontella sidförskjutningar.
Avläsningar med saknade, oparsade eller lågsäkra celler skrivs till `.todo` och ger statuskod 2.

```bash
.venv/bin/python tools/afm-audit/read_gradient.py input.pdf /tmp/climb-on.js \
  --profile tools/afm-audit/profiles/climb-gradient-f7-on.json \
  --const secondSegmentClimbGradient_flaps7_anti_ice_on \
  --max-altitude 6000 \
  --corrections tools/afm-audit/profiles/climb-gradient-f7-on-corrections.json
node tools/afm-audit/compare-gradient.js data/c56x/climb-gradient-flaps7.js \
  secondSegmentClimbGradient_flaps7_anti_ice_on /tmp/climb-on.js.json
```

The reader emits the JavaScript constant, an adjacent `.json` reference for comparison,
and a `.todo` list for OCR cells needing review. A non-empty `.todo` makes the reader
exit with status 2; do not treat such output as verified AFM data. After checking flagged
cells against the AFM, pass a JSON object of corrections keyed by
`altitudeFt/weight/temp/wind`, for example `{"0/20000/-35/-10": 5.6}`, using
`--corrections corrections.json`. Unmatched corrections are rejected. For another climb
gradient chart with the same grid, copy and adjust the profile's page mappings, altitude
and weight sets, temperature rows, and cell-center calibration.

### Snabbare nästa gång (ny climb-gradient-PDF)

1. Kopiera en profil (`profiles/climb-gradient-f15-on.json` passar 6-sidiga ark med 6 höjder/sida och
   temperaturraderna -35..10; `f7-on` är identisk) och justera `pageAltitudes`, `pageWeights`, `temperatures`.
2. Kör `read_gradient.py` (se ovan). Utdata är redan kompakt, en rad per temperatur.
3. Titta på `.todo`: `crop_gradient_rows.py PDF PROFIL.json ut.png 1000/20000/-25 ...` ger en bildremsa per
   cell (höjd/vikt/temp) för visuell kontroll; lägg värdena i `*-corrections.json` och kör om.
4. `check-gradient-monotonic.js ut.js.json` flaggar orimliga värden (gradient ska inte minska med mer vind,
   lägre vikt eller lägre temperatur; höjd är inte monoton i AFM) – fångar tysta OCR-fel.
5. `compare-gradient.js datafil.js CONST ut.js.json` jämför mot befintlig datafil.

## Flaps 7 anti-ice OFF grid layout (4 altitudes per sheet, variable temperature rows)

- `read_gradient_grid.py` splits each row into 25 numbers, but the glyph classifier still confuses `6`/`8` and drops minus signs here. Treat its output as a hint only.
- Reliable workflow: run `check-gradient-monotonic.js` (ignore "missing" lines), then render the flagged weight block at 400 dpi, crop the temperature column plus the 5 wind columns, and compare by eye. `show-weight.js` is a template for printing one weight table from the const.
- The monotonic check does not catch duplicated or shifted neighbour values; a full visual pass is needed for those.
