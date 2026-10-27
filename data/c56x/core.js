const factorsRunwayConditionCodesTakeoff = [
    { code: "6", label: "RCC 6", factor: 1.0 },
    { code: "5", label: "RCC 5", factor: 1.0 },
    { code: "4", label: "RCC 4", factor: 1.0 },
    { code: "3", label: "RCC 3", factor: 1.0 },
    { code: "2", label: "RCC 2", factor: 1.0 },
    { code: "1", label: "RCC 1", factor: 1.0 }
];

const factorsRunwayConditionCodesLanding = [
    { code: "6", label: "RCC 6", factor: 1.0 },
    { code: "5", label: "RCC 5", factor: 1.0 },
    { code: "4", label: "RCC 4", factor: 1.0 },
    { code: "3", label: "RCC 3", factor: 1.0 },
    { code: "2", label: "RCC 2", factor: 1.0 },
    { code: "1", label: "RCC 1", factor: 1.0 }
];

const maxXwindByRCC = [
    { code: "6", label: "RCC 6", max_XW: 25 },
    { code: "5", label: "RCC 5", max_XW: 24 },
    { code: "4", label: "RCC 4", max_XW: 21 },
    { code: "3", label: "RCC 3", max_XW: 16 },
    { code: "2", label: "RCC 2", max_XW: 12 },
    { code: "1", label: "RCC 1", max_XW: 8 }
];

//AFM 4-38
const maxTakeoffWeightClimb_Flaps7 = [
    {
        altitude: 0,
        data: [
            { tempRange: " -54 TO 45", maxWeight: 20000 },
            { temp: 50, maxWeight: 18650 },
            { temp: 54, maxWeight: 17580 }
        ]
    },
    {
        altitude: 1000,
        data: [
            { tempRange: " -54 TO 42", maxWeight: 20000 },
            { temp: 45, maxWeight: 19230 },
            { temp: 50, maxWeight: 17830 },
            { temp: 52, maxWeight: 17300 }
        ]
    },
    {
        altitude: 2000,
        data: [
            { tempRange: " -54 TO 39", maxWeight: 20000 },
            { temp: 40, maxWeight: 19940 },
            { temp: 45, maxWeight: 18330 },
            { temp: 50, maxWeight: 17030 }
        ]
    },
    {
        altitude: 3000,
        data: [
            { tempRange: " -54 TO 36", maxWeight: 20000 },
            { temp: 40, maxWeight: 18990 },
            { temp: 45, maxWeight: 17560 },
            { temp: 48, maxWeight: 16760 }
        ]
    },
    {
        altitude: 4000,
        data: [
            { tempRange: " -54 TO 33", maxWeight: 20000 },
            { temp: 35, maxWeight: 19600 },
            { temp: 40, maxWeight: 18120 },
            { temp: 45, maxWeight: 16790 },
            { temp: 46, maxWeight: 16500 }
        ]
    },
    {
        altitude: 5000,
        data: [
            { tempRange: " -54 TO 30", maxWeight: 20000 },
            { temp: 35, maxWeight: 18720 },
            { temp: 40, maxWeight: 17360 },
            { temp: 44, maxWeight: 16260 }
        ]
    },
    {
        altitude: 6000,
        data: [
            { tempRange: " -54 TO 26", maxWeight: 20000 },
            { temp: 30, maxWeight: 19220 },
            { temp: 35, maxWeight: 17970 },
            { temp: 40, maxWeight: 16630 },
            { temp: 42, maxWeight: 16050 }
        ]
    },
    {
        altitude: 7000,
        data: [
            { tempRange: " -54 TO 23", maxWeight: 20000 },
            { temp: 25, maxWeight: 19570 },
            { temp: 30, maxWeight: 18420 },
            { temp: 35, maxWeight: 17240 },
            { temp: 40, maxWeight: 15870 }
        ]
    },
    {
        altitude: 8000,
        data: [
            { tempRange: " -54 TO 19", maxWeight: 20000 },
            { temp: 20, maxWeight: 19830 },
            { temp: 25, maxWeight: 18740 },
            { temp: 30, maxWeight: 17690 },
            { temp: 35, maxWeight: 16470 },
            { temp: 38, maxWeight: 15620 }
        ]
    },
    {
        altitude: 9000,
        data: [
            { tempRange: " -54 TO 15", maxWeight: 20000 },
            { temp: 20, maxWeight: 18930 },
            { temp: 25, maxWeight: 17920 },
            { temp: 30, maxWeight: 16900 },
            { temp: 35, maxWeight: 15660 },
            { temp: 36, maxWeight: 15370 }
        ]
    },
    {
        altitude: 10000,
        data: [
            { tempRange: " -54 TO 11", maxWeight: 20000 },
            { temp: 15, maxWeight: 19160 },
            { temp: 20, maxWeight: 18110 },
            { temp: 25, maxWeight: 17120 },
            { temp: 30, maxWeight: 16090 },
            { temp: 34, maxWeight: 15130 }
        ]
    },
    {
        altitude: 11000,
        data: [
            { tempRange: " -54 TO 7", maxWeight: 20000 },
            { temp: 10, maxWeight: 19480 },
            { temp: 15, maxWeight: 18380 },
            { temp: 20, maxWeight: 17390 },
            { temp: 25, maxWeight: 16400 },
            { temp: 30, maxWeight: 15360 },
            { temp: 32, maxWeight: 14900 }
        ]
    },
    {
        altitude: 12000,
        data: [
            { tempRange: " -54 TO 3", maxWeight: 20000 },
            { temp: 5, maxWeight: 19760 },
            { temp: 10, maxWeight: 18700 },
            { temp: 15, maxWeight: 17650 },
            { temp: 20, maxWeight: 16660 },
            { temp: 25, maxWeight: 15680 },
            { temp: 30, maxWeight: 14710 }
        ]
    },
    {
        altitude: 13000,
        data: [
            { tempRange: " -54 TO 0", maxWeight: 20000 },
            { temp: 5, maxWeight: 18960 },
            { temp: 10, maxWeight: 17910 },
            { temp: 15, maxWeight: 16930 },
            { temp: 20, maxWeight: 15960 },
            { temp: 25, maxWeight: 15010 },
            { temp: 28, maxWeight: 14410 }
        ]
    },
    {
        altitude: 14000,
        data: [
            { tempRange: " -54 TO -4", maxWeight: 20000 },
            { temp: 0, maxWeight: 19210 },
            { temp: 5, maxWeight: 18180 },
            { temp: 10, maxWeight: 17170 },
            { temp: 15, maxWeight: 16230 },
            { temp: 20, maxWeight: 15280 },
            { temp: 25, maxWeight: 14380 },
            { temp: 26, maxWeight: 14160 }
        ]
    }
];

//AFM 4-39
const maxTakeoffWeightClimb_Flaps7_AntiIceOn = [
    {
        altitude: 0,
        data: [
            { tempRange: "-54 TO 10", maxWeight: 20000 }
        ]
    },
    {
        altitude: 1000,
        data: [
            { tempRange: "-54 TO 10", maxWeight: 20000 }
        ]
    },
    {
        altitude: 2000,
        data: [
            { tempRange: "-54 TO 10", maxWeight: 20000 }
        ]
    },
    {
        altitude: 3000,
        data: [
            { tempRange: "-54 TO 10", maxWeight: 20000 }
        ]
    },
    {
        altitude: 4000,
        data: [
            { tempRange: "-54 TO 10", maxWeight: 20000 }
        ]
    },
    {
        altitude: 5000,
        data: [
            { tempRange: "-54 TO 10", maxWeight: 20000 }
        ]
    },
    {
        altitude: 6000,
        data: [
            { tempRange: "-54 TO 10", maxWeight: 20000 }
        ]
    },
    {
        altitude: 7000,
        data: [
            { tempRange: "-54 TO 10", maxWeight: 20000 }
        ]
    },
    {
        altitude: 8000,
        data: [
            { tempRange: "-54 TO 7", maxWeight: 20000 },
            { temp: 10, maxWeight: 19230 }
        ]
    },
    {
        altitude: 9000,
        data: [
            { tempRange: "-54 TO 3", maxWeight: 20000 },
            { temp: 5, maxWeight: 19650 },
            { temp: 10, maxWeight: 18450 }
        ]
    },
    {
        altitude: 10000,
        data: [
            { tempRange: "-54 TO 0", maxWeight: 20000 },
            { temp: 5, maxWeight: 18770 },
            { temp: 10, maxWeight: 17660 }
        ]
    },
    {
        altitude: 11000,
        data: [
            { tempRange: "-54 TO -4", maxWeight: 20000 },
            { temp: 0, maxWeight: 19260 },
            { temp: 5, maxWeight: 18070 },
            { temp: 10, maxWeight: 16930 }
        ]
    },
    {
        altitude: 12000,
        data: [
            { tempRange: "-54 TO -7", maxWeight: 20000 },
            { temp: -5, maxWeight: 19660 },
            { temp: 0, maxWeight: 18520 },
            { temp: 5, maxWeight: 17350 },
            { temp: 10, maxWeight: 16180 }
        ]
    },
    {
        altitude: 13000,
        data: [
            { tempRange: "-54 TO -10", maxWeight: 20000 },
            { temp: -5, maxWeight: 18880 },
            { temp: 0, maxWeight: 17760 },
            { temp: 5, maxWeight: 16610 },
            { temp: 10, maxWeight: 15440 }
        ]
    },
    {
        altitude: 14000,
        data: [
            { tempRange: "-54 TO -14", maxWeight: 20000 },
            { temp: -10, maxWeight: 19220 },
            { temp: -5, maxWeight: 18120 },
            { temp: 0, maxWeight: 17030 },
            { temp: 5, maxWeight: 15870 },
            { temp: 10, maxWeight: 14740 }
        ]
    }
];

//AFM 4-40
const maxTakeoffWeightClimb_Flaps15 = [
    {
        altitude: 0,
        data: [
            { tempRange: "-54 TO 42", maxWeight: 20000 },
            { temp: 45, maxWeight: 19330 },
            { temp: 50, maxWeight: 17840 },
            { temp: 54, maxWeight: 16800 }
        ]
    },
    {
        altitude: 1000,
        data: [
            { tempRange: "-54 TO 40", maxWeight: 20000 },
            { temp: 45, maxWeight: 18400 },
            { temp: 50, maxWeight: 17040 },
            { temp: 52, maxWeight: 16520 }
        ]
    },
    {
        altitude: 2000,
        data: [
            { tempRange: "-54 TO 37", maxWeight: 20000 },
            { temp: 40, maxWeight: 19080 },
            { temp: 45, maxWeight: 17530 },
            { temp: 50, maxWeight: 16270 }
        ]
    },
    {
        altitude: 3000,
        data: [
            { tempRange: "-54 TO 33", maxWeight: 20000 },
            { temp: 35, maxWeight: 19680 },
            { temp: 40, maxWeight: 18170 },
            { temp: 45, maxWeight: 16790 },
            { temp: 48, maxWeight: 16000 }
        ]
    },
    {
        altitude: 4000,
        data: [
            { tempRange: "-54 TO 30", maxWeight: 20000 },
            { temp: 35, maxWeight: 18750 },
            { temp: 40, maxWeight: 17340 },
            { temp: 45, maxWeight: 16040 },
            { temp: 46, maxWeight: 15760 }
        ]
    },
    {
        altitude: 5000,
        data: [
            { tempRange: "-54 TO 26", maxWeight: 20000 },
            { temp: 30, maxWeight: 19210 },
            { temp: 35, maxWeight: 17910 },
            { temp: 40, maxWeight: 16600 },
            { temp: 44, maxWeight: 15520 }
        ]
    },
    {
        altitude: 6000,
        data: [
            { tempRange: "-54 TO 23", maxWeight: 20000 },
            { temp: 25, maxWeight: 19570 },
            { temp: 30, maxWeight: 18370 },
            { temp: 35, maxWeight: 17190 },
            { temp: 40, maxWeight: 15890 },
            { temp: 42, maxWeight: 15320 }
        ]
    },
    {
        altitude: 7000,
        data: [
            { tempRange: "-54 TO 19", maxWeight: 20000 },
            { temp: 20, maxWeight: 19830 },
            { temp: 25, maxWeight: 18690 },
            { temp: 30, maxWeight: 17590 },
            { temp: 35, maxWeight: 16460 },
            { temp: 40, maxWeight: 15140 }
        ]
    },
    {
        altitude: 8000,
        data: [
            { tempRange: "-54 TO 15", maxWeight: 20000 },
            { temp: 20, maxWeight: 18920 },
            { temp: 25, maxWeight: 17880 },
            { temp: 30, maxWeight: 16870 },
            { temp: 35, maxWeight: 15710 },
            { temp: 38, maxWeight: 14900 }
        ]
    },
    {
        altitude: 9000,
        data: [
            { tempRange: "-54 TO 11", maxWeight: 20000 },
            { temp: 15, maxWeight: 19160 },
            { temp: 20, maxWeight: 18060 },
            { temp: 25, maxWeight: 17080 },
            { temp: 30, maxWeight: 16110 },
            { temp: 35, maxWeight: 14930 },
            { temp: 36, maxWeight: 14650 }
        ]
    },
    {
        altitude: 10000,
        data: [
            { tempRange: "-54 TO 7", maxWeight: 20000 },
            { temp: 10, maxWeight: 19370 },
            { temp: 15, maxWeight: 18280 },
            { temp: 20, maxWeight: 17260 },
            { temp: 25, maxWeight: 16320 },
            { temp: 30, maxWeight: 15320 },
            { temp: 34, maxWeight: 14410 }
        ]
    },
    {
        altitude: 11000,
        data: [
            { tempRange: "-54 TO 3", maxWeight: 20000 },
            { temp: 5, maxWeight: 19650 },
            { temp: 10, maxWeight: 18590 },
            { temp: 15, maxWeight: 17520 },
            { temp: 20, maxWeight: 16560 },
            { temp: 25, maxWeight: 15620 },
            { temp: 30, maxWeight: 14630 },
            { temp: 32, maxWeight: 14190 }
        ]
    },
    {
        altitude: 12000,
        data: [
            { tempRange: "-54 TO -1", maxWeight: 20000 },
            { temp: 0, maxWeight: 19900 },
            { temp: 5, maxWeight: 18860 },
            { temp: 10, maxWeight: 17820 },
            { temp: 15, maxWeight: 16820 },
            { temp: 20, maxWeight: 15870 },
            { temp: 25, maxWeight: 14920 },
            { temp: 30, maxWeight: 14000 }
        ]
    },
    {
        altitude: 13000,
        data: [
            { tempRange: "-54 TO -5", maxWeight: 20000 },
            { temp: 0, maxWeight: 19090 },
            { temp: 5, maxWeight: 18080 },
            { temp: 10, maxWeight: 17070 },
            { temp: 15, maxWeight: 16120 },
            { temp: 20, maxWeight: 15190 },
            { temp: 25, maxWeight: 14280 },
            { temp: 28, maxWeight: 13700 }
        ]
    },
    {
        altitude: 14000,
        data: [
            { tempRange: "-54 TO -9", maxWeight: 20000 },
            { temp: -5, maxWeight: 19320 },
            { temp: 0, maxWeight: 18310 },
            { temp: 5, maxWeight: 17320 },
            { temp: 10, maxWeight: 16350 },
            { temp: 15, maxWeight: 15440 },
            { temp: 20, maxWeight: 14530 },
            { temp: 25, maxWeight: 13670 },
            { temp: 26, maxWeight: 13450 }
        ]
    }
];

//AFM 4-41
const maxTakeoffWeightClimb_Flaps15_AntiIceOn = [
    {
        altitude: 0,
        data: [
            { tempRange: "-54 TO 10", maxWeight: 20000 }
        ]
    },
    {
        altitude: 1000,
        data: [
            { tempRange: "-54 TO 10", maxWeight: 20000 }
        ]
    },
    {
        altitude: 2000,
        data: [
            { tempRange: "-54 TO 10", maxWeight: 20000 }
        ]
    },
    {
        altitude: 3000,
        data: [
            { tempRange: "-54 TO 10", maxWeight: 20000 }
        ]
    },
    {
        altitude: 4000,
        data: [
            { tempRange: "-54 TO 10", maxWeight: 20000 }
        ]
    },
    {
        altitude: 5000,
        data: [
            { tempRange: "-54 TO 10", maxWeight: 20000 }
        ]
    },
    {
        altitude: 6000,
        data: [
            { tempRange: "-54 TO 10", maxWeight: 20000 }
        ]
    },
    {
        altitude: 7000,
        data: [
            { tempRange: "-54 TO 9", maxWeight: 20000 },
            { temp: 10, maxWeight: 19860 }
        ]
    },
    {
        altitude: 8000,
        data: [
            { tempRange: "-54 TO 6", maxWeight: 20000 },
            { temp: 10, maxWeight: 19000 }
        ]
    },
    {
        altitude: 9000,
        data: [
            { tempRange: "-54 TO 2", maxWeight: 20000 },
            { temp: 5, maxWeight: 19400 },
            { temp: 10, maxWeight: 18210 }
        ]
    },
    {
        altitude: 10000,
        data: [
            { tempRange: "-54 TO -1", maxWeight: 20000 },
            { temp: 0, maxWeight: 19790 },
            { temp: 5, maxWeight: 18530 },
            { temp: 10, maxWeight: 17410 }
        ]
    },
    {
        altitude: 11000,
        data: [
            { tempRange: "-54 TO -5", maxWeight: 20000 },
            { temp: 0, maxWeight: 19000 },
            { temp: 5, maxWeight: 17830 },
            { temp: 10, maxWeight: 16680 }
        ]
    },
    {
        altitude: 12000,
        data: [
            { tempRange: "-54 TO -8", maxWeight: 20000 },
            { temp: -5, maxWeight: 19390 },
            { temp: 0, maxWeight: 18260 },
            { temp: 5, maxWeight: 17100 },
            { temp: 10, maxWeight: 15930 }
        ]
    },
    {
        altitude: 13000,
        data: [
            { tempRange: "-54 TO -12", maxWeight: 20000 },
            { temp: -10, maxWeight: 19750 },
            { temp: -5, maxWeight: 18610 },
            { temp: 0, maxWeight: 17510 },
            { temp: 5, maxWeight: 16350 },
            { temp: 10, maxWeight: 15190 }
        ]
    },
    {
        altitude: 14000,
        data: [
            { tempRange: "-54 TO -15", maxWeight: 20000 },
            { temp: -10, maxWeight: 18950 },
            { temp: -5, maxWeight: 17860 },
            { temp: 0, maxWeight: 16770 },
            { temp: 5, maxWeight: 15630 },
            { temp: 10, maxWeight: 14520 }
        ]
    }
];

function calculateC56xPressureAltitude(qnhHpa, fieldElevationFt) {
    if (!Number.isFinite(qnhHpa) || !Number.isFinite(fieldElevationFt) || qnhHpa <= 0) {
        throw new RangeError("QNH must be a positive number and field elevation must be finite.");
    }

    return Math.max(0, fieldElevationFt + (1013.25 - qnhHpa) * 27);
}

function getC56xMaxTakeoffWeight({
    qnhHpa,
    fieldElevationFt,
    oatC,
    flaps,
    antiIce = "OFF"
}) {
    if (!Number.isFinite(oatC)) {
        throw new RangeError("OAT must be a finite number in degrees Celsius.");
    }

    const tableByFlapsAndAntiIce = {
        7: {
            OFF: maxTakeoffWeightClimb_Flaps7,
            ON: maxTakeoffWeightClimb_Flaps7_AntiIceOn
        },
        15: {
            OFF: maxTakeoffWeightClimb_Flaps15,
            ON: maxTakeoffWeightClimb_Flaps15_AntiIceOn
        }
    };
    const table = tableByFlapsAndAntiIce[flaps]?.[antiIce];
    if (!table) {
        throw new RangeError("C56X climb data requires flaps 7 or 15 and anti-ice ON or OFF.");
    }

    const pressureAltitudeFt = calculateC56xPressureAltitude(qnhHpa, fieldElevationFt);
    const emptyResult = { pressureAltitudeFt, maxTakeoffWeightLb: null };
    if (pressureAltitudeFt < table[0].altitude ||
        pressureAltitudeFt > table[table.length - 1].altitude) {
        return emptyResult;
    }

    const upperIndex = table.findIndex((row) => row.altitude >= pressureAltitudeFt);
    const upperRow = table[upperIndex];
    const lowerRow = upperIndex === 0 ? upperRow : table[upperIndex - 1];
    const lowerWeight = getC56xMaxWeightAtTemperature(lowerRow, oatC);
    const upperWeight = getC56xMaxWeightAtTemperature(upperRow, oatC);
    if (lowerWeight === null || upperWeight === null) return emptyResult;

    const altitudeFraction = lowerRow === upperRow
        ? 0
        : (pressureAltitudeFt - lowerRow.altitude) / (upperRow.altitude - lowerRow.altitude);
    const interpolatedWeight = lowerWeight + (upperWeight - lowerWeight) * altitudeFraction;

    return {
        pressureAltitudeFt,
        maxTakeoffWeightLb: Math.floor(interpolatedWeight)
    };
}

function getC56xMaxWeightAtTemperature(altitudeRow, oatC) {
    const [rangeEntry, ...temperatureEntries] = altitudeRow.data;
    const rangeMatch = rangeEntry.tempRange?.match(
        /^\s*(-?\d+(?:\.\d+)?)\s*TO\s*(-?\d+(?:\.\d+)?)\s*$/i
    );
    if (!rangeMatch) {
        throw new Error(`Invalid C56X temperature range at pressure altitude ${altitudeRow.altitude} ft.`);
    }

    const minimumTemperature = Number(rangeMatch[1]);
    const maxWeightTemperature = Number(rangeMatch[2]);
    const points = [
        { temp: maxWeightTemperature, maxWeight: rangeEntry.maxWeight },
        ...temperatureEntries.map(({ temp, maxWeight }) => ({ temp, maxWeight }))
    ];
    if (oatC < minimumTemperature || oatC > points[points.length - 1].temp) return null;
    if (oatC <= points[0].temp) return points[0].maxWeight;

    const upperIndex = points.findIndex((point) => point.temp >= oatC);
    const lowerPoint = points[upperIndex - 1];
    const upperPoint = points[upperIndex];
    const temperatureFraction = (oatC - lowerPoint.temp) / (upperPoint.temp - lowerPoint.temp);
    return lowerPoint.maxWeight +
        (upperPoint.maxWeight - lowerPoint.maxWeight) * temperatureFraction;
}

//AFM 4-42
