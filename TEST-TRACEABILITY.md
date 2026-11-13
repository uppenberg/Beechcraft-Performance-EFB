# Testspårbarhetsmatris – utkast EJ FÖR ANVÄNDNING

Datum: 2026-11-13. Bas: commit `707ef29` och den lokala arbetskopian vid granskningen, inklusive pågående testuppdelning och ändringar i `js/aircraft-ui.js` och `version.js`. Dokumentet beskriver alltså inte enbart en ren commit. Status: **utkast för krav- och testgranskning**. Kravägare och godkännare: ej utsedda.

Matrisen kopplar appens beteenden och användarguide till risker, verifierbara scenarier och befintliga tester. Den omfattar BE20, B190 och C56X, båda flygfaserna, data, väder, lokal lagring, offline/uppdatering och testinfrastruktur. Den ändrar inte appen eller testkörningen. Inga tester har körts för att skapa dokumentet. Täckning nedan betyder att testkod finns, inte att senaste körningen passerade.

Utkastet innehåller **95 krav-/scenariorader**, **70 befintliga testdeklarationer** med koppling i båda riktningarna och **8 öppna krav-/referensfrågor**. Parametrisering gör att antalet körda testfall är större än antalet deklarationer.

## Läsanvisning

Varje krav-ID är avsett att behållas även om testfiler flyttas. Testreferenser som `CAL-03` pekar på katalogen sist i dokumentet med fil och exakt testtitel. Parametriserade testtitlar betecknar flera körda fall. Krav-ID och test-ID är separata namnrymder; exempelvis skiljer kolumnrubriken krav INIT-01 från test INIT-01. Katalogens tillfälliga nummer bör ersättas med stabila ID:n i testerna om spårbarheten senare automatiseras.

**Underlag:** `G` = användarguiden i index.html; `K` = härlett ur nuvarande kod; `H` = repoändring/regressionshistorik; `F` = föreslagen verifiering utifrån risk. Källor i samma rad gäller tillsammans. Kod är bevis för implementation, inte ett oberoende facit för korrekt flygprestanda. Guidepåståenden om AFM och regelverk återges som produktkrav; dokumentet verifierar inte deras operativa giltighet.

**Prioritet:** P0 = risk för missvisande prestanda, fel flygplan/bana eller förlust av fungerande offlineversion; P1 = viktigt användarflöde, dataintegritet eller återhämtning; P2 = presentation och utvecklingsstöd. Prioriteten är ett granskningsförslag.

**Täckning:** B = befintliga direkta assertioner för det avgränsade beteendet; D = delvis, med angiven lucka; N = inget riktat automatiserat test identifierat; M = föreslagen manuell kontroll. B är inte ett påstående om uttömmande kombinationstäckning. `—` betyder ingen identifierad testkoppling. Scenarier och utfall i N/M-rader är förslag som inte är implementerade.

**Nivå:** U = direkt logiktest utan browser; Kt = data-/källkontrakt; I = integration mellan motor, data och UI; E = användarflöde i browser; Enhet = fysisk iPad. I katalogen finns även logiktester som i dag körs i browser; föreslagen nivå får inte förväxlas med nuvarande körmiljö.

## Källregister

| Källa | Innehåll och avgränsning |
| --- | --- |
| [User Guide](index.html#help-overview) | Inbyggd guide: `help-reg`, `help-settings`, `help-runway`, `help-saved`, `help-install`, `help-rwcc`, `help-eop`, samt Take-off, Landing, METAR och Common Pitfalls. Versionsbunden till arbetskopian. |
| [App och flygplansdefinitioner](js/app-state.js) | Registreringar, typ, cellmappning, flapval och massintervall; [start och flygplansbyte](js/aircraft-ui.js). |
| [Input](js/performance-inputs.js), [gränser](js/performance-limits.js), [resultat](js/results-ui.js) | Råa indata, full precision i beslut, kort, METAR-validering och diagram. |
| [Workbook-data](js/workbook-data.js), [adapter](js/workbook-adapter.js), [motorintegration](js/workbook-engine.js) | XLSX/HyperFormula, formelkonvertering, återställning och motorutdata. |
| [C56X UI](js/c56x-ui.js), [takeoff](data/c56x/calculations.js), [landing](data/c56x/landing-calculations.js), [core](data/c56x/core.js) | Beräkningar, interpolation, korrigeringar, checklistor och maxmassökning. |
| [Flygplatser](js/airport-ui.js), [databas](data/airports.json), [granskningsverktyg](tools/review-airports-json.js) | Val och intersections, tillgänglighet, OEI, formatkontroll. Ingen extern generated-JSON används som källa här. |
| [METAR-parser](js/metar-weather.js) | Enheter, medelvind, temperatur och tryck. |
| [Offline/UI](js/offline-ui.js), [service worker](sw.js), [release-check](js/release-check.js), [version](version.js) | Offlineberedskap, versionscache, installation och uppdatering. |
| [Testbeskrivning](TESTING.md), [browserkonfiguration](playwright.config.js), [Node-konfiguration](playwright.node.config.js), [CI](.github/workflows/tests.yml) | Körmiljö, rapporter, täckning och begränsningar. |
| [AFM: 12 punkter](tests/references/c56x-afm-figure-4-44.json) | 56XFM-13, Configuration AA, Figure 4-44, sidor 4-494/495/500/507. Avläst PDF finns inte i repot. Status `TRANSCRIBED_FROM_SUPPLIED_PDF_PENDING_USER_REVIEW`. Exakt jämförelse av distans/VREF/VAPP vid tabellpunkter. |
| [Manuellt verifierad tabell](tools/afm-audit/review/landing-distance-level-0ft-20000.verified.json) | Märkt `MANUALLY_VERIFIED`: 0 ft, 20 000 lb, plan bana. Testet använder 16 temperaturer × 5 vindar = 80 distansvärden. Metadata `verifiedCellCount: 96` är inte antalet distansassertioner; omfattningen behöver dokumenteras. |
| [Appbaslinje](tests/references/app-update-regression.json) | Godkänd regressionsbaslinje observerad i appversion 0.544. Filen säger uttryckligen att den inte är oberoende AFM-verifierad. |

## 1. Start, flygplansval och indata

| ID / Prio | Krav, källa och risk | Scenario och förväntat utfall | Testkoppling / täckning | Föreslagen nivå |
| --- | --- | --- | --- | --- |
| INIT-01 / P0 | G Overview; K `aircraft-ui.init`: inga användbara resultat före synkronisering. | Fördröj workbook-laddning. Resultaten döljs tills synliga fält och motor hör ihop. | INIT-01; B | I |
| INIT-02 / P0 | G Registration; K AIRCRAFT_MODELS: rätt data per registrering. | Starta SE-LTL, SE-KVL, SE-MJU, SE-MHU, SE-MJV, SE-RIJ utan egna ändringar; header, typ, motor och indata överensstämmer. | INIT-03; B för start, inte oberoende verifiering av varje workbook | I |
| INIT-03 / P0 | G Registration; K handleRegistrationChange: typbyte ska bekräftas. | BE20→B190→C56X: Cancel behåller föregående val; bekräftelse laddar vald typ. Utöka med omvända byten och upprepade klick. | FLOW-07; D: full bytesmatris saknas | E |
| INIT-04 / P1 | K registreringsfel; H 4d37d37. | Okänd registrering ger begripligt återställbart fel utan motorbyte; övergående tomt val återställer sparad stödd registrering. | UI-07, REG-03; B | I |
| INIT-05 / P0 | G Saved Data; K initializeWorkbookInputs/restorePersistedFormState. | Sparade väder-/setupvärden återställs till vald motor för en registrering per typ. Utöka med återgång mellan typer och BE20-registreringar. | INIT-04, UI-09, FLOW-06; D | I/E |
| INIT-06 / P1 | K loadData; G Pitfalls. | Korrupt workbook ger initieringsfel; ersätt med giltig fil och ladda om: beräkning fungerar igen. | STRESS-03; B | E |
| INIT-07 / P0 | G mass/flaps; K app-state/aircraft-ui. | Kontrollera exakta min/max/steg och flapval per typ och fas; inga gamla val från annan typ. BE20 TO 9 200–12 500, LDG 9 000–12 500; B190 10 000–16 600; C56X TO 13 500–20 000, LDG 13 000–20 000 lb. | UI-09, INIT-03, FLOW-03; D: riktade ändpunktsassertioner behövs | U/I |
| INIT-08 / P0 | K readPerformanceInputs/handleManualWeatherInput; risk tomt blir noll. | Tom sträng, blanksteg, 0, negativ vind och ogiltig text skiljs åt; ogiltig vind ändrar inte motorns tidigare indata. Testa båda faser och alla typer. | LIMIT-01, STRESS-05, FLOW-09; D: rå snapshot och samtliga fält behöver direkt test | U/I |
| INIT-09 / P1 | K händelsehantering; F återhämtning. | Snabba flikbyten/extremvärden lämnar appen responsiv utan oinsamlade fel. Följ med giltigt värde och verifiera nytt resultat. | STRESS-02, FLOW-09; B för befintligt urval | E |

## 2. Beräkningar, enheter och gränsbeslut

| ID / Prio | Krav, källa och risk | Scenario och förväntat utfall | Testkoppling / täckning | Föreslagen nivå |
| --- | --- | --- | --- | --- |
| CALC-01 / P0 | K finiteNumber: felvärden får inte bli giltiga distanser. | null, undefined, tomt, blanksteg, workbook-fel, NaN, Infinity, objekt, array och boolesk ger null; giltiga numeriska strängar accepteras. | LIMIT-01; B | U |
| CALC-02 / P0 | G distanskort; K exceedsDistanceLimit. | 99,99 / 100 / 100,01 mot 100: inom / inom / överskridet. Saknad distans eller gräns ger okänt, aldrig grönt godkännande. | LIMIT-02/03, CAL-07, UI-06; B | U + I |
| CALC-03 / P0 | K results-ui/c56x-ui: beslut före avrundning. | Distans strax över gränsen trots lika avrundade siffror ger rött. Kontrollera även visningens avrundningsregel per motortyp. | INIT-05/07; B | I |
| CALC-04 / P0 | K vindkort; G WIND. | XW vid gräns är tillåten, över gräns röd; TW 9,99/10/10,01 ger amber/amber/röd; XW-överskridande har företräde. Nollvind ska inte bli tailwind. | LIMIT-04, INIT-06, UI-06; B | U + I |
| CALC-05 / P0 | G väder/enheter; K core och workbook-adapter. | Oberoende räkneexempel för QNH→tryckhöjd, grader→vindkomponenter, ft→m, Q/A-tryck. Nollhöjd/standardtryck, 0/360°, ±90°, med-/motvind och enhetsgränser. | MET-03, AFM-02, CAL-04/06; D: ingen samlad oberoende enhetsverifiering | U/I |
| CALC-06 / P0 | K workbook formelkonvertering. | Stödda formler bevarar beräkning; ej stödda formler använder avsett cachat värde. Lägg till nästlade INDEX, citat, tom cache och felreferens. | UI-01; D: begränsade syntaktiska exempel | U + I |
| CALC-07 / P0 | G BE20/B190; K workbooks. | Massökning och tailwind ger väntad distansriktning; befintligt urval varierar flap, anti-ice och RWCC 1–6 på båda faser. | FLOW-04; B för samband/finita resultat, inte AFM-facit | I |
| CALC-08 / P0 | G B190 technique; K handle/setup technique. | Samma startvillkor med Static respektive Rolling ger respektive godkända referensvärden för TOR/TOD/ASD; kontroll påverkar endast B190. | UI-09 återställning; D: explicit prestandafacit för tekniker saknas | U/I |
| CALC-09 / P0 | F oberoende BE20/B190-facit. | För varje unik workbook: godkända AFM-/prestandareferenser för fart, distans, OEI och emergency return vid tabellpunkter och mellanpunkter. | FLOW-03/04 använder baslinje/samband; D: oberoende referenspaket saknas | I + referensgranskning |
| CALC-10 / P1 | H appuppdateringar; K sparad baslinje. | Samma kända indata ska reproducera godkända apputdata; avvikelse granskas före ny baslinje. | CAL-02, FLOW-03; B, endast regressionsbevis | I |
| CALC-11 / P0 | G/kod: okända beräkningar. | Ogiltig setup, vind, QNH och värden utanför datadomän ger null/definierat fel och tydligt otillgängligt UI, utan gamla gröna kort. | CAL-08, FLOW-09; D: UI-kedja för varje fel och typ saknas | U + I |
| CALC-12 / P0 | G EASA Class A checklist; K checkContaminationLogic/takeoffLimitsOk. | Isolera varje checklistvillkor: distans, V1, kontamination och OEI. Okänt eller underkänt villkor får inte bli pass; gränslikhet enligt respektive regel. | FLOW-03/05, UI-06; D: separat sanningstabell saknas | U/I |

## 3. C56X prestanda och maxmassa

| ID / Prio | Krav, källa och risk | Scenario och förväntat utfall | Testkoppling / täckning | Föreslagen nivå |
| --- | --- | --- | --- | --- |
| C56-01 / P0 | G takeoff; K getC56xTakeoffFieldLengths. | Flaps 7/15, anti-ice ON/OFF, RWCC 1–6, massa, vind, slope och fluid. Positiva distanser samt exakt faktorprodukt; befintligt rutnät omfattar 1 296 kombinationer. | CAL-03/04; B för faktorsamband, inte oberoende tabellvalidering | U/I |
| C56-02 / P0 | G deice: faktor 1,15. | Samma indata med fluid NO/YES ger kvot 1,15; utöka med UI-värde, båda flaplägena och alla RWCC. Type I ska representeras av NO enligt guiden. | CAL-03/04, UI-09; D: separat UI-resultatassertion saknas | U/I |
| C56-03 / P0 | G takeoff reversers: ingen distanskredit. | AVAILABLE/INOP ska ge samma redovisade takeoff-distance med övriga villkor lika. Kontrollera separat påverkan på eventuell wet-mass-check. | —; N: CAL-03 varierar inte takeoff reversers | U/I |
| C56-04 / P0 | G V1; K getC56xV1GradientAdjustment/getC56xTakeoffSpeeds. | Exakt slope-steg, strax under/över steg, downhill SHADED och domängränser; jämför V1/VR/V2 med oberoende referens. | CAL-02 regressionspunkt; D: riktade gräns- och referensfall saknas | U/I |
| C56-05 / P0 | G climb; K getC56xSecondSegmentClimbGradient. | Straight/Turning/saknat climb path. Vid 19 323 lb och strax över verifieras vikt ×1,035 respektive minus 1,2 procentenheter; Straight oförändrat, saknat märks antaget. | UI-06 testar pathklassning, inte korrigeringsvärden; D | U + I |
| C56-06 / P0 | K getC56xWetRunwayMassLimit/checklist. | RWCC 6 respektive 1–5, tillgängliga/saknade distanser, massa vid/över gräns och beräkningsfel; pass/fail/unknown åtskilda. | —; N | U/I |
| C56-07 / P0 | G Landing Required distance; AFM Figure 4-44. | 12 exakta tabellpunkter: distans ft, VREF och VAPP exakt lika referens; två punkter även från synliga UI-indata till UI-resultat. | AFM-01/02; D tills referensernas väntande granskning slutförts | I/E + referensgranskning |
| C56-08 / P0 | Manuellt verifierad Figure 4-44-tabell. | Samtliga 80 lagrade distansvärden vid 0 ft/20 000 lb/plan bana ska matcha exakt. Det bevisar inte tillåten landningsmassa. | CAL-01; B inom just denna deltabell | U/I |
| C56-09 / P0 | G landing; K getC56xLandingPerformance. | RWCC × reversers × anti-ice × massa × vind × downhill: 864 kombinationer med finita farter och distance × factor = required distance. | CAL-05/06; B för interna samband | U/I |
| C56-10 / P0 | G reversers landing. | INOP ger högre faktor i verifierat fall; utöka med oberoende faktortabell för varje RWCC och båda lägena. | CAL-06; D: en faktorjämförelse bevisar inte hela tabellen | U |
| C56-11 / P0 | G Figure 4-45/46 och interpolation. | Plan, uphill, −1/−2 %, mellanpunkter i slope, höjd, massa, temperatur och vind; godkänt handräknat facit, hörn och utanför domänen. | CAL-05/06/08; D: samband finns, oberoende mellanpunktsfacit saknas | U |
| C56-12 / P0 | G anti-ice landing; K landing-calculations. | Max landningsmassa är mindre av climb-/brake-limit; testa vartdera som begränsande, lika, saknad tabell och anti-ice ON/OFF. | CAL-05 kontrollerar egenskap, inte korrekt gränsvärde; D | U/I |
| C56-13 / P0 | G climb minima 2,5/3,2; K updateC56xLandingClimbCard. | Approach och landing strax under/exakt/över minimum, var för sig samt null; rött om någon understiger. | FLOW-03 allmänt flöde; D: riktat gränsrutnät saknas | U/I |
| C56-14 / P0 | G max take-off mass; K updateMaxTakeoffMass. | Alla tre typer: högsta tillåtna 50-lb-steg ska klara kriterierna; nästa steg ska fallera eller ligga över max. Jämför med oberoende uttömmande sökning. | —; N | I |
| C56-15 / P0 | G maxmasskort; K samma funktion. | Inga tillåtna massor kontra saknade data ger korrekt None/Not available; marginal rätt tecken; slider, workbookceller och vanliga resultat återställs efter sökning även vid fel. | FLOW-02 gäller annan tillgänglighetskontroll; N för maxmassökning | I |
| C56-16 / P1 | K scheduleMaxTakeoffMassUpdate; F gammalt resultat. | Byt snabbt bana, massa och väder medan uppdatering väntar. Maxmasskortets slutresultat ska tillhöra senaste setup. | —; N | I/E |
| C56-17 / P0 | K updateC56xAntiIceOatWarning. | Testa temperatur vid och på båda sidor om kodens anti-ice-varningsgräns, båda faser och ON/OFF. Fastställ referens/krav innan förväntat tal låses. | —; N, öppet kravunderlag | U/I |

## 4. Flygplatser, banor och datakvalitet

| ID / Prio | Krav, källa och risk | Scenario och förväntat utfall | Testkoppling / täckning | Föreslagen nivå |
| --- | --- | --- | --- | --- |
| APT-01 / P0 | G ICAO/RWY; K airport-ui. | ICAO via tangentbord eller suggestion väljer rätt flygplats; runway-listan hör till flygplatsen; okänt ICAO ska inte lämna tidigare giltig bana aktiv. | UI-03, FLOW-09; D: samtliga rensningsvägar behöver verifieras | E |
| APT-02 / P0 | G Intersection; K getSelectedAirportRecord. | Byt fullängd↔intersection; rätt TORA/TODA/ASDA, höjd, slope och OEI från vald rad; landning väljer avsedd LDA-rad. | UI-03; D: alla fält och landningsval behöver riktade assertions | I/E |
| APT-03 / P0 | K runwayRowsForPage/runwayAvailableForPage. | Endast LDA användbar → landning; kompletta TO-distanser → start. Tomma, noll och ogiltiga distanser ska hanteras enligt fastställt datakontrakt. | DATA-01 för datastruktur; D: fasspecifikt UI-filter behöver fixtures | U/I |
| APT-04 / P0 | G runway suggestion; K evaluateTakeoffRunwayAvailability. | Ofullständig och för kort bana blir unavailable med orsak och spärrad Use RWY. Lämplig bana går att välja. | UI-04/06; D: knappspärr och varje separat avslagsorsak behöver kontrolleras | I/E |
| APT-05 / P0 | K tillfälliga workbookberäkningar. | Jämför serialiserade inputceller före/efter tillgänglighetskontroll: identiska. Lägg till exception mitt i kontrollen. | FLOW-02; D: felvägen saknas | I |
| APT-06 / P0 | G EOP/OEI; H 4d37d37. | Vald banas OEI-varning uppdateras och rensas vid avmarkering för BE20/B190/C56X. Kontrollera separat exakt Escape Route-text inklusive tomt värde. | REG-04; D: full routingtext behöver eget facit | I/E |
| APT-07 / P0 | H 2c95d5d; K updateCustomAirportData/updateC56xLanding. | Byt landningsflygplats/bana med annan höjd/slope/LDA utan ändrat väder. C56X-resultat ska räknas om direkt från den nya raden. | UI-03, AFM-02 indirekt; D: isolerad regression rekommenderas | I |
| APT-08 / P0 | K data/airports.json; H bd3f106. | Sheet1 icke-tom, obligatoriska kolumner, ICAO/RWY, kontrolltecken, numerik, heading och erforderliga distanser följer kontrakt. | DATA-01; B för testets nuvarande kontrakt | Kt |
| APT-09 / P0 | H formatförlust vid Excel-export; K review-airports-json. | Strängen 8→08, numerisk 25→"25", 1L→01L; giltigt värde oförändrat. Endast RWY-format ändras, inga rader eller andra cellvärden. | airports:review/fix-format finns; N för automatiserat verktygstest | U/Kt |
| APT-10 / P0 | K granskningsverktyg; F regressionsskydd. | Fix två gånger är idempotent; BOM bevaras; trasig JSON skrivs inte över; otillåtna värden/dubbletter rapporteras och check får felkod. Testa i temporär kopia. | —; N | Kt |
| APT-11 / P0 | F databaskälla kontra format. | Granska förändrade rader mot godkänd källdata: ICAO/RWY/intersection, enheter, distanser, heading, höjd, slope, OEI/routing. Dokumentera källa/utgåva/datum och granskare. | DATA-01 verifierar endast struktur; M för sakriktighet | Manuell datagranskning |
| APT-12 / P1 | H 53e12f8/7d723e7. | Inget återinfört källhashkrav. Modullista och cacheversion är aktuella kontrakt; referensfilers provenance-hash är metadata och ska inte förväxlas med release-gating. | SRC-01/02, INIT-02, PWA-05; B för relaterade kontrakt | Kt/I |

## 5. Egna flygplatser och sparade data

| ID / Prio | Krav, källa och risk | Scenario och förväntat utfall | Testkoppling / täckning | Föreslagen nivå |
| --- | --- | --- | --- | --- |
| SAVE-01 / P0 | G Custom overrides database; K applyAirportSource. | Aktivering använder endast egna banor på båda flikar och visar CUSTOM. Avaktivering återgår till inbyggd databas men behåller egna rader. | FLOW-08, UI-05; D: explicit isolering och badge i båda faser behövs | E |
| SAVE-02 / P1 | G Custom CRUD; K setupCustomAirportUi. | Skapa, välja, återöppna, redigera, radera; sparad ICAO+RWY ersätts utan dubblett. | FLOW-08, UI-05; B | E |
| SAVE-03 / P0 | G custom fields; K formvalidering. | Ogiltiga värden nekas; numeriska enheter och Turning/Straight sparas korrekt. Lägg till alla fältens ändpunkter och text med markup ska förbli text. | UI-05; D | U/I |
| SAVE-04 / P1 | G Saved Data; K persistFormState. | Separat TO/LDG-state per typ, aktiv flik, registrering, intersection och setup återkommer efter reload utan sammanblandning. | FLOW-06, UI-09, INIT-04; D: systematiskt cross-type/cross-phase-test saknas | E |
| SAVE-05 / P1 | K lagringsläsning; F korruption. | Trasig JSON/sparad METAR hindrar inte start eller nya indata. Lägg till gammal schemaversion och delvis giltigt objekt. | STRESS-01; D | I/E |
| SAVE-06 / P1 | G lokalt lagrat; F lagringsfel. | localStorage quota/åtkomstfel ger hanterat resultat; rensad data ger definierad nystart. Förväntad återkoppling behöver beslutas. | —; N | I/Enhet |
| SAVE-07 / P0 | G updates retain data. | Spara egna banor och olika TO/LDG-värden; installera ny release och verifiera allt efter omstart. | PWA-tester verifierar release, FLOW-08 vanlig reload; N för kombinationen | E/Enhet |
| SAVE-08 / P1 | G Overview/Saved Data: lokala beräkningar/data. | Med kontrollerat nätverk: beräkning skickar inga indata/custom-rader externt. Separera förväntade METAR-/update-anrop. | Externa anrop blockeras i många tester men sekretess påvisas inte; N | I |

## 6. METAR och banförslag

| ID / Prio | Krav, källa och risk | Scenario och förväntat utfall | Testkoppling / täckning | Föreslagen nivå |
| --- | --- | --- | --- | --- |
| METAR-01 / P0 | G METAR; K parser/populateWeather. | KT fyller tillgängliga fält i båda faser; medelvind används, gust bevaras separat; negativ temperatur och A/Q-tryck parsas korrekt. | MET-02/03; B för befintliga exempel | U + I |
| METAR-02 / P0 | K explicit MPS-regel. | MPS normaliseras för vindanalys men ändrar inget väderfält i kalkylatorn, inklusive OAT/QNH. Varning ska visas. | MET-01/03; B | U + I |
| METAR-03 / P0 | G VRB/calm; K parseWeather/suggestRunwayFromMetar. | VRB representeras med okänd riktning i parsern; kalkylatorns avsedda fallback och råd verifieras separat. Calm ger nollvind och inget banförslag. | MET-03/05; D: explicit VRB-UI-fallback behövs | U/I |
| METAR-04 / P0 | G åldersgräns; K validateMetar. | Fel station, gammal rapport, saknad/ogiltig tid nekas; färsk rätt station accepteras. | MET-04/06; B för testade fall | U/I |
| METAR-05 / P0 | K UTC-datumbestämning; F tidsgränser. | Fryst klocka: 59:59, 60:00, 60:01; månad/årsskifte, skottdag, framtid och ogiltigt datum. Lås krav för exakt 60 minuter före godkännande. | MET-04 använder 10/70 minuter; D | U/I |
| METAR-06 / P1 | G färgkodning; K metarAgeColor; H tidigare färgfix. | Grönt före 35 min, amber från 35, rött från 60 enligt kod; färg åldras även utan fetch och efter restore. | REG-02; D: samtliga exakta gränser och restoreväg behövs | I |
| METAR-07 / P0 | G manuell override; K fetchMetarForAirport. | Felaktig rapport bevarar manuell väderinmatning; giltig ny rapport skriver över tillgängliga fält enligt guide. | MET-02/06; B för befintliga vägar | I/E |
| METAR-08 / P0 | K stale-request guard; H METAR-härdning. | Långsamt svar för flygplats A får inte ändra flygplats B efter byte. Utöka med två svar för samma flygplats i omvänd ordning. | STRESS-04; D: samma-station-race saknas | I |
| METAR-09 / P1 | G offline/manual weather; K fetchMetarText. | Timeout, offline, serverfel och fallback-källans fel ger hanterad status och fortsatt manuell beräkning. Custom ICAO följer samma flöde. | MET-06/STRESS-01 delvis; D: separat felmatris saknas | I/E |
| METAR-10 / P0 | G runway suggestion; K suggestRunwayFromMetar. | Störst motvind föreslås; VRB, calm, ren sidvind/ingen motvind och nästan lika kandidater ger inget entydigt förslag. | MET-05; D: nästan lika headwind saknas | U/I |
| METAR-11 / P0 | G Use RWY; K applySuggestedRunway. | Knappen väljer korrekt bana/intersection för rätt fas och uppdaterar resultat; inget automatiskt byte utan användarhandling. | UI-04; D: explicit inget-självbyte behöver assertion | E |
| METAR-12 / P0 | G magnetic direction; K direkt användning av METAR-riktning. | Fastställ avsedd sann/magnetisk referens för vind och runway heading. Lägg oberoende exempel där variationen inte är noll innan algoritmkravet godkänns. | —; N, kravfråga Q-02 | Kravgranskning + U/I |

## 7. Resultatpresentation och användbarhet

| ID / Prio | Krav, källa och risk | Scenario och förväntat utfall | Testkoppling / täckning | Föreslagen nivå |
| --- | --- | --- | --- | --- |
| UIREQ-01 / P0 | G takeoff/landing cards; K updateRunwayExceedanceCard. | En enda överskriden distans räcker för rött; korrekt begränsning namnges. Okänt ger Awaiting performance. | UI-06, FLOW-03/05, INIT-07; B | I/E |
| UIREQ-02 / P0 | G climb; K updateClimbCheckCard/updateMissedClimbCard. | OEI vid/under/över erforderligt värde; saknat Req ger okänt. BE20/B190 missed climb vid 2,5 % och runt gränsen. | UI-06 täcker ett avrundningsfall; D | U/I |
| UIREQ-03 / P0 | G emergency return. | BE20/B190 VREF och distans för UP/DOWN kommer från korrekt cell och använder vald avgångsbanas LDA. Kontrollera om guiden förutsätter jämförelse som UI faktiskt utför. | FLOW-03 allmän output; D: riktad källa/facit behövs | I |
| UIREQ-04 / P0 | G overweight warning; K updateLandingOverweightWarning. | B190 över 16 100 och C56X över 18 700 visar emergency-use-only; vid exakt gräns ingen överviktsvarning. | UI-08 testar under/över; D: exakt gräns saknas | I |
| UIREQ-05 / P1 | G Runway Visualization; K render*Chart. | Markörvärden, vald flap och C56X-markörer följer korrekt distans; null/0/överskridande och olik TORA/TODA/ASDA ska ge begriplig skala. | UI-06; D: full geometri och guiden överensstämmer inte säkert, Q-03 | I + visuell review |
| UIREQ-06 / P1 | G Settings/Guide; K delegated actions. | Settings, guideavsnitt, stängning och update notice nås via kontroller; deklarerade actionnamn har handlers och inga inline handlers. | UI-02, FLOW-01, ACTION-01; B | Kt/E |
| UIREQ-07 / P1 | G ForeFlight. | Länken `foreflightmobile://` startar ForeFlight och kan öppnas från fysisk iPad med installerad ForeFlight; inget installerat program ska inte blockera appen. | UI-02 kontrollerar länk; D, faktisk överlämning M | E/Enhet |
| UIREQ-08 / P1 | TESTING: iPad mini A17 Pro portrait. | 744×1133, touch/fokus, återläst ICAO, kontroller inom viewport och ingen horisontell overflow för tre typer. | IPAD-01; B för emulering, inte fysisk iPad | E |
| UIREQ-09 / P1 | F fysisk användning/tillgänglighet. | Verklig iPad: tangentbord täcker inte viktiga fält, native select fungerar, zoom/VoiceOver/fokus i dialoger, text utöver färg för fel. | —; M; acceptansmått behöver beslutas | Enhet |
| UIREQ-10 / P2 | G och kod hålls samstämmiga. | Gå igenom alla guideavsnitt mot aktuella labels, regler och synliga funktioner; lös Q-01–Q-08. Rotationsbeteende kontrolleras utan att utöka porträttstödet. | UI-02 testar navigation, inte innehåll; M | Dokument-/enhetsreview |

## 8. Offline, release och återhämtning

| ID / Prio | Krav, källa och risk | Scenario och förväntat utfall | Testkoppling / täckning | Föreslagen nivå |
| --- | --- | --- | --- | --- |
| OFF-01 / P0 | G Offline readiness; K sw asset list. | Alla filer för aktuell release installeras, inte bara HTML. Importer och C56X-loaderfiler ingår i offline-listan. | PWA-01, SRC-02; B | Kt + E |
| OFF-02 / P0 | G retry; K offline status. | Workbook-download misslyckas → ej ready; retry efter återanslutning hämtar data och initiering fungerar. | PWA-02; B | E |
| OFF-03 / P0 | G offline calculations. | Installerad app startar offline och återansluter för update check. Utöka med varje unik workbook, båda faser, custom-data och väder manuellt. | PWA-03; D: full motor-/fasmatris saknas | E/Enhet |
| OFF-04 / P0 | K version.js/release-cache; H 7d723e7/cdf6a3f. | Ny release upptäcks/installas/aktiveras; gammalt shell aktivt tills bytet; version marker blockerar inte kalkylatorstart. | PWA-04/05, INIT-02; B | E |
| OFF-05 / P0 | K multi-tab activation; H 725dc72. | Tvångsuppdatering flyttar alla öppna flikar till samma release; vänta på faktisk reload före assertion. | PWA-06; B | E |
| OFF-06 / P0 | K atomisk installation. | Avbruten/misslyckad ny release lämnar föregående fungerande offline-snapshot användbar. | PWA-07; B för injicerat fel | E |
| OFF-07 / P0 | K cache repair. | Saknad fil repareras i vald release-cache; fall där servern nu har annan release får inte skapa en tyst blandning av versioner. | PWA-08/09; D: testar återhämtning, inte versionsidentitet hos reparerade bytes; Q-08 | E |
| OFF-08 / P1 | K isLocalDevelopmentHost; H 2c95d5d. | Endast avsedd utvecklingsport identifieras som Live Server; normal server behåller offline/uppdateringsbeteende. | REG-01; B | U/I |
| OFF-09 / P0 | G install iPad; F verklig lagring/livscykel. | Safari→Add to Home Screen, full stängning, flygplansläge, kallstart, uppdatering och ny kallstart på fysisk iPad mini. Anteckna iPadOS/version och datarelease. | —; M; Chromium-SW-test ersätter inte detta | Enhet |
| OFF-10 / P1 | K persistent storage UI; F eviction. | Nekad persistens, quota, cache raderad delvis och avbruten installation ger korrekt beredskapsstatus/återhämtning. | PWA-02/07/08 delvis; D | I/Enhet |

## 9. Test- och rapportkontrakt

| ID / Prio | Krav, källa och risk | Scenario och förväntat utfall | Testkoppling / täckning | Föreslagen nivå |
| --- | --- | --- | --- | --- |
| QA-01 / P1 | K package/config: testlager. | Node-test kör utan HTTP-server/browser; browserprojekt inkluderar inte tests/node. Lint/typecheck och båda sviter är tydligt separerade i CI. | Konfigurationsgranskning och testdiscovery; N för automatiserat metatest, normalt inget sådant nödvändigt | CI-review |
| QA-02 / P1 | K reporters; TESTING. | Rapport visar projekt, fall, fel, skip och bilagor. Avbruten körning får inte beskrivas som full pass. Kontrollera även artifact-upload vid failure. | Reporter-/workflowkonfiguration; M vid CI-verifiering | CI-review |
| QA-03 / P1 | K coverage scope/report. | Nya appmoduler inkluderas; ej laddade filer ger noll; observationer slås ihop. Node, SW, sekundära sidor, workbook och statiska C56X-tabeller ingår inte i Chromium-siffran. | COV-01/02; B för helperkontrakt | U/Kt |
| QA-04 / P1 | H radslut/assetproblem. | Checkout-attribut definierar LF för text och binary/-text där tillämpligt; assetlistans filer finns. Inget återinfört SHA-manifest. | SRC-01/02; B | Kt |
| QA-05 / P1 | F reproducerbart bevis. | Varje körning registrerar commit + dirty diff, appversion, projekt, miljö, urval och run-id. Separata körningar får inte kombineras till påstådd helsvitspass. | Rapporter finns, ingen automatisk krav-ID-rollup; D | Rapportprocess |

## Öppna krav- och referensfrågor

Följande är granskningspunkter, inte konstaterade fel eller instruktioner att ändra appen.

| ID | Observation | Beslut/bevis som behövs | Berörda krav |
| --- | --- | --- | --- |
| Q-01 | METAR-validering avvisar `age > 60`, färgen blir röd vid `age >= 60`. | Bekräfta om exakt 60 minuter får fylla fält men visas rött. Skriv ett klockstyrt gränsfall och motsvarande guideformulering. | METAR-05/06 |
| Q-02 | Guiden kallar vindriktningen magnetisk; parsern för vidare rapportens grader utan synlig konvertering. | Fastställ vindens och banheadingens referenssystem samt avsedd behandling av variation. Underlaget här räcker inte för ett operativt korrekt numeriskt facit. | METAR-12, CALC-05 |
| Q-03 | Guiden beskriver två landningsmarkörer för BE20/B190; UI-06 kräver att endast vald flapsmarkör är synlig. | Bestäm önskat beteende och justera därefter guide eller test/app i separat uppgift. | UIREQ-05/10 |
| Q-04 | Tolv AFM-punkter väntar på användargranskning; annan fixture är MANUALLY_VERIFIED men saknar full revisions-/signeringskedja. | Fastställ AFM-utgåva/revision, tillämpbarhet, sida, avläsare, oberoende granskare, datum och tolerans. Förklara 96 metadata-celler kontra 80 testade distanser. | C56-07/08, CALC-09 |
| Q-05 | Guiden säger maxmassökning kontrollerar "speeds"; workbook-vägen i takeoffLimitsOk kontrollerar uttryckligen V1. | Bestäm vilka farter/villkor som ska vara giltiga för alla motorer och vad maxmasskortet faktiskt garanterar. Kontrollera även vindbegränsningens roll. | C56-14/15, CALC-12 |
| Q-06 | Common Pitfalls beskriver typbyte som BE20/B190 trots att huvudguiden även beskriver C56X. | Synkronisera omfattning vid nästa guidegranskning. | INIT-03, UIREQ-10 |
| Q-07 | MPS-regeln i kod bevarar alla kalkylatorfält; generell guidetext säger att METAR skriver över manuella vädervärden. | Dokumentera undantag och hur användaren ser att manuella uppgifter behöver behållas/anges. | METAR-02/07 |

| Q-08 | PWA-09 accepterar HTTP 200 och cachelagring även efter att testservern bytt release; den jämför inte filinnehållets release med cachen. | Besluta om reparation får hämta aktuell serverfil till äldre cache utan innehållsidentifiering. Ett krav på strikt versionskonsistens är ännu inte verifierat av testet och ska inte beskrivas som befintligt skydd. Detta innebär inte förslag att återinföra hashkravet. | OFF-07 |

## Hur urvalet motiveras av historiken

Historiken används för att välja regressionsfall, inte som bevis för att ett test passerar. För commits utan beskrivande titel görs ingen funktionstolkning enbart utifrån commitmeddelandet.

| Historik | Risk som ska hållas under test | Koppling |
| --- | --- | --- |
| `bd3f106`, `53e12f8` samt sessionens RWY-formatproblem | Ledande nollor/numeriska typer, strikt men korrekt datakontrakt, inget återinfört källhashkrav | APT-08–12 |
| `7d723e7`, `cdf6a3f` | Versionerad assetlista och atomiska installationer, användbar gammal release vid fel | OFF-01/04/06/07 |
| `2c95d5d` | Fel utvecklingsidentifiering och utebliven C56X-landningsuppdatering efter flygplatsbyte | OFF-08, APT-07 |
| `4d37d37` | OEI-varning kvar från gammal bana och övergående tom registrering | APT-06, INIT-04 |
| `7e0f97e`, `5965021` | Delad METAR-parsning, enhetsblandning, återställning och svar i fel ordning | METAR-01–09, INIT-05 |
| `36f29c7` | Moduluppdelning/delegerade actions tappar handlers eller offline-importer | UIREQ-06, OFF-01 |
| `9c731dc`, `41f310f` | Missvisande coverage och plattformsberoende filformat | QA-03/04 |
| `725dc72`, `6173774`, `8ed7035` | Tester läser före reload eller blockeras av update-dialog | OFF-05, QA-02; synkronisering ska följa observerat tillstånd |

## Referens- och toleransregler för kommande tester

1. Ett förväntat numeriskt resultat ska ange källa och metod. Anropa inte produktionsfunktionen för att skapa dess eget facit. Appbaslinjer märks alltid regression, aldrig oberoende AFM-validering.
2. Exakta tabellpunkter använder referensens publicerade enhet och precision. De befintliga AFM-punkterna jämför exakt; ändra inte till en större tolerans för att dölja ett fel.
3. För interpolation: lagra ingående tabellpunkter, handräknad metod och beslutad absolut/relativ tolerans. Toleransen ska motiveras av tabellprecision och numerik, inte väljas efter observerad differens.
4. Skilj algoritmresultat från visning. Testa både oavrundat gränsbeslut och avsedd avrundad sträng. Jämför inte två avrundade UI-värden som ersättning för gränstest.
5. Flygplatsers struktur och formatering valideras automatiskt; sakriktighet behöver separat källgranskning. En godkänd JSON-parser bevisar inte korrekta banlängder eller OEI-data.
6. Testdata ska vara små och avsiktliga för gränser, fel och kombinationer. Använd syntetiska custom-rader för extrema värden så att verkliga airport-data inte behöver ändras.

## Föreslagen teststrategi och genomförandeordning

Behåll ett fåtal hela användarresor per typ och de särskilda PWA-livscykelfallen. Lägg nya rena gräns-, parser-, interpolations- och formatfall i Node när befintlig kod kan laddas där utan appändring. Behåll motor-/DOM-/workbookkopplingar som integrationstester. Att ett test kör i browser gör det inte automatiskt till ett end-to-end-test.

| Ordning | Föreslagen leverans | Varför |
| --- | --- | --- |
| 1 | Avgör Q-02/04/05 och komplettera C56-14/15, APT-09/10 samt METAR-05. | Felaktigt facit, högsta tillåtna massa, formatförlust och tidsgränser har hög konsekvens och tydliga identifierade luckor. |
| 2 | Oberoende referenser för BE20/B190 och C56X-farter, climb, begränsningsmassa och interpolation; C56-03–06/10–13. | Många nuvarande tester bevisar samband eller regressionsstabilitet, inte numerisk korrekthet mot källa. |
| 3 | SAVE-07, APT-07, felåterställning och isolering mellan typ/fas; fullständigare unknown-kort. | Täcker övergångar där rätt data annars kan visas för fel kontext. |
| 4 | Fysisk iPad enligt OFF-09/UIREQ-09 och guidefrågor. | Emulering verifierar inte installerad iOS-PWA, native kontroller eller faktisk lagringslivscykel. |
| 5 | Stabil krav-ID-märkning och rapportkoppling. | Gör ändringspåverkan och kvarvarande luckor synliga utan att duplicera assertions. |

Detta är ett urvalsförslag, inte en beslutad releasegrind. Fullt kartesisk kombination av alla UI-fält behövs inte: välj ekvivalensklasser, gränsvärden och riskstyrda par/kombinationer, och behåll uttömmande små sanningstabeller för gränslogik. Ta inte bort ett browserfall bara för att en del av det också täcks av Node.

## Körstatus, rapportering och förvaltning

Matrisen är en versionshanterad hjälpfil. Playwright genererar inte automatiskt en kravrapport från den. Befintliga rapporter beskrivs i [TESTING.md](TESTING.md): browser HTML/JSON/JUnit i `playwright-report/` och `test-results/`, Node JSON/JUnit i `test-results-node/`, AFM-bilagor samt separat Chromium-coverage. Kodtäckning mäter exekvering, inte kravuppfyllelse, och omfattar inte Node eller alla datakällor.

Körstatus ska registreras separat för varje krav/test/projekt: **Ej kört, Pass, Fail, Blockerat, Skippat**. För delvis täckta krav får ett grönt test inte automatiskt ge grönt krav. Exempel på en ännu tom körningsrad:

| Krav-ID | Test-ID/projekt | Commit + arbetskopiediff | App/datareferens | Körning/miljö | Resultat | Bevis/avvikelse | Granskare |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CALC-02 | LIMIT-02 / node | Fylls vid körning | Fylls vid körning | Run-id + Node/OS | Ej kört i denna dokumentuppgift | Rapportlänk fylls vid körning | Ej utsedd |

Vid den föregående teständringsuppgiften rapporterades 21 passerade Node-fall och 28 passerade Chromium-fall i två ändrade browserfiler. Motsvarande WebKit-start blockerades lokalt av `spawn UNKNOWN`. Det är historisk, begränsad körinformation och ingen helsvits- eller releaseverifiering för denna matris. Hämta aktuellt CI-resultat innan en releasebedömning görs.

Vid ändring: identifiera berörda krav via källfil/funktion, uppdatera testkoppling och källa i samma review, behåll krav-ID, dokumentera ändrad referens separat och länka relevant körbevis. Föreslagna ägarroller: produkt-/operativ kravägare för guide/AFM, utvecklare för implementation/test, oberoende sakgranskare för referensvärden. Ingen person eller godkännandestatus är tilldelad här.

## Befintlig testkatalog

Katalogen nedan återger testdeklarationer i den granskade arbetskopian. `${...}` betyder parametriserad titel; löpnummer avser deklarationen, inte antal körningar. De numrerade referenserna ovan är kopplingar till dessa deklarationer, inte nya tester. `LIMIT-04` omfattar exempelvis flera vindfall.


### INIT – [initialization-and-limits.spec.js](tests/initialization-and-limits.spec.js)

| Test-ID | Exakt deklarerad titel | Krav som hänvisar hit |
| --- | --- | --- |
| INIT-01 | performance stays hidden until the workbook and visible inputs are synchronized | INIT-01 |
| INIT-02 | version.js is the single release marker and does not block calculator startup | APT-12, OFF-04 |
| INIT-03 | ${registration}: untouched startup has a consistent engine and visible inputs | INIT-02, INIT-07 |
| INIT-04 | ${registration}: saved inputs restore to the selected engine | INIT-05, SAVE-04 |
| INIT-05 | precision decisions and displayed rounding agree at runway limits | CALC-03 |
| INIT-06 | ${registration}: wind cards compare exact values and show rounded values | CALC-04 |
| INIT-07 | C56X compares actual takeoff and landing distances before rounding their display | CALC-03, UIREQ-01 |

### FLOW – [browser-flows.spec.js](tests/browser-flows.spec.js)

| Test-ID | Exakt deklarerad titel | Krav som hänvisar hit |
| --- | --- | --- |
| FLOW-01 | UI actions are externalized and delegated without inline event handlers | UIREQ-06 |
| FLOW-02 | takeoff runway availability checks restore serialized workbook input cells | C56-15, APT-05 |
| FLOW-03 | ${aircraft.model}: startup, takeoff/landing calculation and runway limits | INIT-07, CALC-09, CALC-10, CALC-12, C56-13, UIREQ-01, UIREQ-03 |
| FLOW-04 | ${aircraft.model}: workbook calculations cover mass, wind, flaps, anti-ice and all RCC values | CALC-07, CALC-09 |
| FLOW-05 | ${aircraft.model}: short custom runway flags takeoff and landing exceedances | CALC-12, UIREQ-01 |
| FLOW-06 | BE20 takeoff and landing inputs and selected airport persist through reload | INIT-05, SAVE-04 |
| FLOW-07 | BE20 to B190 and C56X model changes require confirmation and load the selected model | INIT-03 |
| FLOW-08 | custom airports can be created, selected, reused after reload, edited and deleted | SAVE-01, SAVE-02, SAVE-07 |
| FLOW-09 | missing and invalid fields stay recoverable without unhandled browser errors | INIT-08, INIT-09, CALC-11, APT-01 |

### CAL – [calculations.spec.js](tests/calculations.spec.js)

| Test-ID | Exakt deklarerad titel | Krav som hänvisar hit |
| --- | --- | --- |
| CAL-01 | C56X landing calculations match manually verified Figure 4-44 cells | C56-08 |
| CAL-02 | C56X algorithm outputs match the approved app-update regression baseline | CALC-10, C56-04 |
| CAL-03 | C56X takeoff matrix covers wind, weight, flaps, anti-ice, RCC, slope and fluid | C56-01, C56-02, C56-03 |
| CAL-04 | C56X takeoff distance reacts consistently to mass, headwind, tailwind, RCC and runway slope | CALC-05, C56-01, C56-02 |
| CAL-05 | C56X landing matrix covers wind, weight, RCC, anti-ice, reversers and runway slope | C56-09, C56-11, C56-12 |
| CAL-06 | C56X landing factors, wind, mass and runway-limit boundaries are internally consistent | CALC-05, C56-09, C56-10, C56-11 |
| CAL-07 | runway-limit comparison passes at equality and fails just above the limit | CALC-02 |
| CAL-08 | C56X calculations reject invalid wind, setup, weather and AFM-out-of-range cases | CALC-11, C56-11 |

### AFM – [afm-landing.spec.js](tests/afm-landing.spec.js)

| Test-ID | Exakt deklarerad titel | Krav som hänvisar hit |
| --- | --- | --- |
| AFM-01 | AFM Figure 4-44: 12 exact table points with a comparison report | C56-07 |
| AFM-02 | AFM Figure 4-44: visible landing inputs and outputs with screenshots | CALC-05, C56-07, APT-07 |

### UI – [ui-feature-coverage.spec.js](tests/ui-feature-coverage.spec.js)

| Test-ID | Exakt deklarerad titel | Krav som hänvisar hit |
| --- | --- | --- |
| UI-01 | workbook formula conversion preserves supported formulas and cached unsupported formulas | CALC-06 |
| UI-02 | settings, guide navigation, update notice and ForeFlight link work | UIREQ-06, UIREQ-07, UIREQ-10 |
| UI-03 | ICAO autocomplete supports keyboard selection and runway intersections update the selected record | APT-01, APT-02, APT-07 |
| UI-04 | METAR runway suggestion can be applied to takeoff and landing | APT-04, METAR-11 |
| UI-05 | custom-airport validation rejects invalid form values and duplicate runways update in place | SAVE-01, SAVE-02, SAVE-03 |
| UI-06 | runway status cards, climb and wind cards, and chart markers render their states | CALC-02, CALC-04, CALC-12, C56-05, APT-04, UIREQ-01, UIREQ-02, UIREQ-05 |
| UI-07 | an unsupported registration gives a recoverable error without switching engines | INIT-04 |
| UI-08 | ${item.registration}: landing mass warning follows its design limit | UIREQ-04 |
| UI-09 | ${item.registration}: supported setup and representative inputs persist across reload | INIT-05, INIT-07, CALC-08, C56-02, SAVE-04 |

### MET – [metar.spec.js](tests/metar.spec.js)

| Test-ID | Exakt deklarerad titel | Krav som hänvisar hit |
| --- | --- | --- |
| MET-01 | MPS METAR leaves takeoff and landing weather fields unchanged | METAR-02 |
| MET-02 | KT METAR continues to fill available takeoff and landing weather fields | METAR-01, METAR-07 |
| MET-03 | shared METAR parser normalizes wind once and keeps MPS out of calculator values | CALC-05, METAR-01, METAR-02, METAR-03 |
| MET-04 | METAR validation rejects station mismatch, stale observations and invalid timestamps | METAR-04, METAR-05 |
| MET-05 | runway suggestions handle variable, calm, pure crosswind and reciprocal runway wind | METAR-03, METAR-10 |
| MET-06 | an invalid fetched METAR leaves manually entered weather unchanged | METAR-04, METAR-07, METAR-09 |

### REG – [recent-code-regressions.spec.js](tests/recent-code-regressions.spec.js)

| Test-ID | Exakt deklarerad titel | Krav som hänvisar hit |
| --- | --- | --- |
| REG-01 | Live Server detection is limited to its development port | OFF-08 |
| REG-02 | METAR display color follows observation age after render | METAR-06 |
| REG-03 | transient empty registration restores the saved supported aircraft | INIT-04 |
| REG-04 | ${registration}: OEI warning follows the selected takeoff runway and clears with the selection | APT-06 |

### STRESS – [stress.spec.js](tests/stress.spec.js)

| Test-ID | Exakt deklarerad titel | Krav som hänvisar hit |
| --- | --- | --- |
| STRESS-01 | malformed saved inputs and METAR do not prevent startup or later input | SAVE-05, METAR-09 |
| STRESS-02 | rapid tab changes and malformed/extreme numeric input leave the calculator responsive | INIT-09 |
| STRESS-03 | a corrupt workbook shows a recoverable initialization error and reload succeeds | INIT-06 |
| STRESS-04 | a late METAR response for the previous airport is ignored | METAR-08 |
| STRESS-05 | negative wind speeds are rejected on both tabs without changing calculator inputs | INIT-08 |

### PWA – [pwa.spec.js](tests/pwa.spec.js)

| Test-ID | Exakt deklarerad titel | Krav som hänvisar hit |
| --- | --- | --- |
| PWA-01 | offline asset installation downloads the complete current release | OFF-01 |
| PWA-02 | failed workbook download reports failure, enables retry and recovers after reconnecting | OFF-02, OFF-10 |
| PWA-03 | installed app starts offline and reconnects for update checks | OFF-03 |
| PWA-04 | service worker update can be detected, installed and activated | OFF-04 |
| PWA-05 | version.js selects a new cache while the old app shell remains active until update | APT-12, OFF-04 |
| PWA-06 | a forced update moves other open tabs to the same versioned release | OFF-05 |
| PWA-07 | a failed update retains the previously usable offline snapshot | OFF-06, OFF-10 |
| PWA-08 | offline repair downloads a missing file into the selected release cache | OFF-07, OFF-10 |
| PWA-09 | a missing cached file can be repaired from the current server release | OFF-07 |

### IPAD – [ipad-mini.spec.js](tests/ipad-mini.spec.js)

| Test-ID | Exakt deklarerad titel | Krav som hänvisar hit |
| --- | --- | --- |
| IPAD-01 | ${registration}: iPad mini A17 Pro portrait touch and layout | UIREQ-08 |

### LIMIT – [performance-limits.spec.js](tests/node/performance-limits.spec.js)

| Test-ID | Exakt deklarerad titel | Krav som hänvisar hit |
| --- | --- | --- |
| LIMIT-01 | missing, non-finite and workbook error values cannot become valid numbers | INIT-08, CALC-01 |
| LIMIT-02 | distance ${distance} against limit 100 uses full precision | CALC-02 |
| LIMIT-03 | missing actual distance or available distance produces an unknown decision | CALC-02 |
| LIMIT-04 | wind status: ${label} | CALC-04 |

### DATA – [airport-data-validation.spec.js](tests/node/airport-data-validation.spec.js)

| Test-ID | Exakt deklarerad titel | Krav som hänvisar hit |
| --- | --- | --- |
| DATA-01 | airports.json is valid and every runway follows the airport data standard | APT-03, APT-08, APT-11 |

### SRC – [source-integrity.spec.js](tests/node/source-integrity.spec.js)

| Test-ID | Exakt deklarerad titel | Krav som hänvisar hit |
| --- | --- | --- |
| SRC-01 | offline asset checkout attributes preserve identical bytes across platforms | APT-12, QA-04 |
| SRC-02 | all app module imports and C56X loader files are included in the offline asset list | APT-12, OFF-01, QA-04 |

### ACTION – [ui-contract.spec.js](tests/node/ui-contract.spec.js)

| Test-ID | Exakt deklarerad titel | Krav som hänvisar hit |
| --- | --- | --- |
| ACTION-01 | all declared UI action names resolve to registered handlers | UIREQ-06 |

### COV – [coverage-report.spec.js](tests/node/coverage-report.spec.js)

| Test-ID | Exakt deklarerad titel | Krav som hänvisar hit |
| --- | --- | --- |
| COV-01 | coverage scope includes new app modules and excludes other origins and data | QA-03 |
| COV-02 | unloaded files report zero coverage and separate observations merge | QA-03 |
