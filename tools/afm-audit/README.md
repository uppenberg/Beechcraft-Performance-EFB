# AFM-auditverktyg för takeoff-tabeller

Det här paketet är generaliserat för takeoff-filerna i [data/c56x/](/home/uppenberg1/Github/Beechcraft-Performance-EFB/data/c56x).
Det stöder samma radformat som `temp/tailwind/zero/headwind/vr/v2`-tabellerna använder.

## Vad som stöds nu

- `takeoff-dry-flaps7.js`
- `takeoff-dry-flaps15.js`
- `takeoff-wet-flaps7.js`
- `takeoff-wet-flaps15.js`
- `takeoff-wet-flaps15-no-reverser.js`

Profiler finns i [tools/afm-audit/profiles/](/home/uppenberg1/Github/Beechcraft-Performance-EFB/tools/afm-audit/profiles).

## Vad som inte stöds ännu

Filer med annan struktur (t.ex. climb-gradient, takeoff-gradient, climb-flightpath) kräver extra parserstöd.

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

