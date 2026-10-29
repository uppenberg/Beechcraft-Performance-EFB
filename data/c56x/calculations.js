function interpolateC56xTakeoffAxis(points, target, getCoordinate, getValue) {
    if (!Number.isFinite(target) || !Array.isArray(points) || points.length === 0) return null;
    const sorted = points.slice().sort((a, b) => getCoordinate(a) - getCoordinate(b));
    if (target < getCoordinate(sorted[0]) || target > getCoordinate(sorted[sorted.length - 1])) return null;

    for (const point of sorted) {
        if (target === getCoordinate(point)) {
            const value = getValue(point);
            return Number.isFinite(value) ? value : null;
        }
    }

    for (let index = 1; index < sorted.length; index += 1) {
        const upper = sorted[index];
        const lower = sorted[index - 1];
        const lowerCoordinate = getCoordinate(lower);
        const upperCoordinate = getCoordinate(upper);
        if (target > upperCoordinate) continue;

        const lowerValue = getValue(lower);
        const upperValue = getValue(upper);
        if (!Number.isFinite(lowerValue) || !Number.isFinite(upperValue)) return null;
        const fraction = (target - lowerCoordinate) / (upperCoordinate - lowerCoordinate);
        return lowerValue + (upperValue - lowerValue) * fraction;
    }
    return null;
}

function interpolateC56xTakeoffTableDistance(rows, weightLb, oatC, headwindKnots) {
    const windSamples = [
        { knots: -10, key: 'tailwind10' },
        { knots: 0, key: 'zeroWind' },
        { knots: 10, key: 'headwind10' },
        { knots: 20, key: 'headwind20' },
        { knots: 30, key: 'headwind30' },
    ];
    const interpolateWind = (temperatureRow) => interpolateC56xTakeoffAxis(
        windSamples,
        headwindKnots,
        (sample) => sample.knots,
        (sample) => temperatureRow[sample.key]?.dist
    );
    const interpolateTemperature = (weightRow) => interpolateC56xTakeoffAxis(
        weightRow.data,
        oatC,
        (row) => row.temp,
        interpolateWind
    );
    return interpolateC56xTakeoffAxis(
        rows,
        weightLb,
        (row) => row.weight,
        interpolateTemperature
    );
}

function interpolateC56xTakeoffAltitude(tables, pressureAltitudeFt, weightLb, oatC, headwindKnots) {
    return interpolateC56xTakeoffAxis(
        tables,
        pressureAltitudeFt,
        (table) => table.altitudeFt,
        (table) => interpolateC56xTakeoffTableDistance(
            table.rows,
            weightLb,
            oatC,
            headwindKnots
        )
    );
}

function interpolateC56xGradientTable(rows, distanceFt, distanceKey, correctionKey) {
    return interpolateC56xTakeoffAxis(
        rows,
        distanceFt,
        (row) => row[distanceKey],
        (row) => row[correctionKey]
    );
}

function getC56xV1GradientAdjustment(adjustments, slopePercent) {
    if (!Number.isFinite(slopePercent)) return null;
    if (Math.abs(slopePercent) < 0.000001) return 0;

    const parseAdjustment = (value) => {
        if (typeof value !== 'string') return null;
        const match = value.match(/^(?:V1\s*)?([+-])\s*(\d+(?:\.\d+)?)$/i);
        if (!match) return null;
        const magnitude = Number(match[2]);
        return Number.isFinite(magnitude)
            ? (match[1] === '-' ? -magnitude : magnitude)
            : null;
    };

    if (slopePercent > 0) {
        const step = [0.5, 1, 1.5, 2].find((value) => slopePercent <= value);
        if (!step) return null;
        const adjustment = adjustments?.uphill?.[`${step.toFixed(1)}%`] ??
            adjustments?.[`uphill${String(step).replace('.', '_')}pct`];
        return parseAdjustment(adjustment);
    }

    const downhillSlope = Math.abs(slopePercent);
    if (downhillSlope > 2) return null;
    if (downhillSlope < 1) return 0;
    const step = downhillSlope <= 1 ? 1 : 2;
    const key = `-${step}%`;
    const adjustment = adjustments?.downhillShaded?.[key] ??
        adjustments?.[`downhillShaded_${step}pct`];
    return parseAdjustment(adjustment);
}

function applyC56xRunwayGradient(distanceFt, slopePercent, isWet, antiIce = 'ON', flaps = 7) {
    if (!Number.isFinite(distanceFt) || !Number.isFinite(slopePercent)) return null;
    if (Math.abs(slopePercent) < 0.000001) return distanceFt;

    const uphillSteps = [
        { slope: 0.5, dryKey: '0.5%', wetKey: 'uphill0_5pct' },
        { slope: 1, dryKey: '1.0%', wetKey: 'uphill1pct' },
        { slope: 1.5, dryKey: '1.5%', wetKey: 'uphill1_5pct' },
        { slope: 2, dryKey: '2.0%', wetKey: 'uphill2pct' },
    ];
    if (slopePercent > 0) {
        // Round uphill slopes up to the next published correction for a conservative result.
        const step = uphillSteps.find((entry) => entry.slope >= slopePercent);
        if (!step) return null;
        if (isWet && flaps === 15) {
            const rows = (antiIce === 'OFF'
                ? takeoffFieldLengthGradient_Wet_Flaps15_AntiIceOff
                : takeoffFieldLengthGradient_Wet_Flaps15_AntiIceOn).map((row) => ({
                baseFieldLength: row.baseFieldLength,
                correction: row.uphill[step.dryKey],
            }));
            return interpolateC56xGradientTable(
                rows,
                distanceFt,
                'baseFieldLength',
                'correction'
            );
        }
        const dryGradientRows = flaps === 15
            ? antiIce === 'OFF'
                ? takeoffFieldLengthGradient_Dry_Flaps15_AntiIceOff
                : takeoffFieldLengthGradient_Dry_Flaps15_AntiIceOn
            : antiIce === 'OFF'
                ? takeoffFieldLengthGradient_Dry_Flaps7
                : takeoffFieldLengthGradient_Dry_Flaps7_AntiIceOn;
        const rows = isWet
            ? (antiIce === 'OFF'
                ? takeoffGradientAdjustment_wet_reversers_Flaps7_AntiIceOff.data
                : takeoffGradientAdjustment_reversers_wet_Flaps7_AntiIceOn.data)
            : dryGradientRows.map((row) => ({
                baseFieldLength: row.baseFieldLength,
                correction: row.uphill[step.dryKey],
            }));
        return interpolateC56xGradientTable(
            rows,
            distanceFt,
            isWet ? 'zeroGradient' : 'baseFieldLength',
            isWet ? step.wetKey : 'correction'
        );
    }

    if (slopePercent < -2) return null;
    if (slopePercent > -1) return distanceFt;

    const dryGradientRows = flaps === 15
        ? antiIce === 'OFF'
            ? takeoffFieldLengthGradient_Dry_Flaps15_AntiIceOff
            : takeoffFieldLengthGradient_Dry_Flaps15_AntiIceOn
        : antiIce === 'OFF'
            ? takeoffFieldLengthGradient_Dry_Flaps7
            : takeoffFieldLengthGradient_Dry_Flaps7_AntiIceOn;
    if (isWet && flaps === 15) {
        const rows = antiIce === 'OFF'
            ? takeoffFieldLengthGradient_Wet_Flaps15_AntiIceOff
            : takeoffFieldLengthGradient_Wet_Flaps15_AntiIceOn;
        const correctionValues = [];
        ['downhillShaded', 'downhillNonShaded'].forEach((group) => {
            ['-1%', '-2%'].forEach((key) => {
                const value = interpolateC56xGradientTable(
                    rows.map((row) => ({
                        baseFieldLength: row.baseFieldLength,
                        adjusted: row[group][key],
                    })),
                    distanceFt,
                    'baseFieldLength',
                    'adjusted'
                );
                if (value !== null) correctionValues.push(value);
            });
        });
        return correctionValues.length ? Math.max(distanceFt, ...correctionValues) : null;
    }
    const rows = isWet
        ? (antiIce === 'OFF'
            ? takeoffGradientAdjustment_wet_reversers_Flaps7_AntiIceOff.data
            : takeoffGradientAdjustment_reversers_wet_Flaps7_AntiIceOn.data)
        : dryGradientRows;
    const keys = isWet
        ? [
            'downhillShaded_1pct', 'downhillShaded_2pct',
            'downhillNonShaded_1pct', 'downhillNonShaded_2pct',
        ]
        : ['downhillShaded', 'downhillNonShaded'];
    const correctionValues = [];

    // Runway shading is not recorded in airports.json, so downhill credit is not taken.
    if (isWet) {
        keys.forEach((key) => {
            const value = interpolateC56xGradientTable(rows, distanceFt, 'zeroGradient', key);
            if (value !== null) correctionValues.push(value);
        });
    } else {
        keys.forEach((group) => ['-1%', '-2%'].forEach((key) => {
            const value = interpolateC56xGradientTable(
                rows.map((row) => ({
                    baseFieldLength: row.baseFieldLength,
                    adjusted: row[group][key],
                })),
                distanceFt,
                'baseFieldLength',
                'adjusted'
            );
            if (value !== null) correctionValues.push(value);
        }));
    }
    return Math.max(distanceFt, ...correctionValues);
}

function getC56xTakeoffFieldLengths({
    qnhHpa,
    fieldElevationFt,
    oatC,
    weightLb,
    windDirectionDeg,
    windSpeedKnots,
    runwayHeadingDeg,
    runwaySlopePercent = 0,
    runwayConditionCode,
    reverserStatus = 'AVAILABLE',
    antiIce = 'ON',
    flaps = 7,
}) {
    const pressureAltitudeFt = calculateC56xPressureAltitude(qnhHpa, fieldElevationFt);
    const direction = Number(windDirectionDeg);
    const speed = Number(windSpeedKnots);
    const heading = Number(runwayHeadingDeg);
    if (pressureAltitudeFt === null || !Number.isFinite(Number(oatC)) ||
        !Number.isFinite(Number(weightLb)) || !Number.isFinite(speed) || speed < 0 ||
        !Number.isFinite(Number(runwaySlopePercent)) ||
        !Number.isFinite(heading) || heading < 0 || heading > 360 ||
        (speed !== 0 &&
            (!Number.isFinite(direction) || direction < 0 || direction > 360))) {
        return null;
    }
    if (runwayConditionCode !== '5' && runwayConditionCode !== '6') return null;
    if (reverserStatus !== 'AVAILABLE' && reverserStatus !== 'INOP') return null;
    if (antiIce !== 'ON' && antiIce !== 'OFF') return null;
    if (flaps !== 7 && flaps !== 15) return null;

    const headwindKnots = speed === 0
        ? 0
        : speed * Math.cos((((direction - heading + 540) % 360) - 180) * Math.PI / 180);
    const dryTables = flaps === 15
        ? antiIce === 'OFF'
            ? [
                { altitudeFt: 0, rows: takeoffFieldLength_Dry_Flaps15_SeaLevel },
                { altitudeFt: 1000, rows: takeoffFieldLength_Dry_Flaps15_1000ft },
                { altitudeFt: 2000, rows: takeoffFieldLength_Dry_Flaps15_2000ft },
                { altitudeFt: 3000, rows: takeoffFieldLength_Dry_Flaps15_3000ft },
                { altitudeFt: 4000, rows: takeoffFieldLength_Dry_Flaps15_4000ft },
                { altitudeFt: 5000, rows: takeoffFieldLengthDry_Flaps15_5000ft },
                { altitudeFt: 6000, rows: takeoffFieldLengthDry_Flaps15_6000ft },
            ]
            : [
                { altitudeFt: 0, rows: takeoffFieldLength_Dry_Flaps15_SeaLevel_AntiIceOn },
                { altitudeFt: 1000, rows: takeoffFieldLength_Dry_Flaps15_1000ft_AntiIceOn },
                { altitudeFt: 2000, rows: takeoffFieldLength_Dry_Flaps15_2000ft_AntiIceOn },
                { altitudeFt: 3000, rows: takeoffFieldLength_Dry_Flaps15_3000ft_AntiIceOn },
                { altitudeFt: 4000, rows: takeoffFieldLength_Dry_Flaps15_4000ft_AntiIceOn },
                { altitudeFt: 5000, rows: takeoffFieldLength_Dry_Flaps15_5000ft_AntiIceOn },
                { altitudeFt: 6000, rows: takeoffFieldLength_Dry_Flaps15_6000ft_AntiIceOn },
            ]
        : antiIce === 'OFF'
        ? [
            { altitudeFt: 0, rows: takeoffFieldLength_Dry_Flaps7_0ft },
            { altitudeFt: 1000, rows: takeoffFieldLength_Dry_Flaps7_1000ft_Complete },
            { altitudeFt: 2000, rows: takeoffFieldLength_Dry_Flaps7_2000ft_Complete },
            { altitudeFt: 3000, rows: takeoffFieldLength_Dry_Flaps7_3000ft_Complete },
            { altitudeFt: 4000, rows: takeoffFieldLength_Dry_Flaps7_4000ft_Complete },
            { altitudeFt: 5000, rows: takeoffFieldLength_Dry_Flaps7_5000ft_Complete },
            { altitudeFt: 6000, rows: takeoffFieldLength_Dry_Flaps7_6000ft_Complete },
        ]
        : [
            { altitudeFt: 0, rows: takeoffFieldLength_Dry_Flaps7_AntiIceOn_0ft },
            { altitudeFt: 1000, rows: takeoffFieldLength_Dry_Flaps7_AntiIceOn_1000ft },
            { altitudeFt: 2000, rows: takeoffFieldLength_Dry_Flaps7_AntiIceOn_2000ft },
            { altitudeFt: 3000, rows: takeoffFieldLength_Dry_Flaps7_AntiIceOn_3000ft },
            { altitudeFt: 4000, rows: takeoffFieldLength_Dry_Flaps7_AntiIceOn_4000ft },
            { altitudeFt: 5000, rows: takeoffFieldLength_Dry_Flaps7_AntiIceOn_5000ft },
            { altitudeFt: 6000, rows: takeoffFieldLength_Dry_Flaps7_AntiIceOn_6000ft },
        ];
    const wetTables = flaps === 15
        ? antiIce === 'OFF'
            ? [
                { altitudeFt: 0, rows: takeoffFieldLength_Wet_Flaps15_Reversers_SeaLevel_AntiIceOff },
                { altitudeFt: 1000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_1000ft_AntiIceOff },
                { altitudeFt: 2000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_2000ft_AntiIceOff },
                { altitudeFt: 3000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_3000ft_AntiIceOff },
                { altitudeFt: 4000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_4000ft_AntiIceOff },
                { altitudeFt: 5000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_5000ft_AntiIceOff },
                { altitudeFt: 6000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_6000ft_AntiIceOff },
            ]
            : [
                { altitudeFt: 0, rows: takeoffFieldLength_Wet_Flaps15_Reversers_SeaLevel_AntiIceOn },
                { altitudeFt: 1000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_1000ft_AntiIceOn },
                { altitudeFt: 2000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_2000ft_AntiIceOn },
                { altitudeFt: 3000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_3000ft_AntiIceOn },
                { altitudeFt: 4000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_4000ft_AntiIceOn },
                { altitudeFt: 5000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_5000ft_AntiIceOn },
                { altitudeFt: 6000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_6000ft_AntiIceOn },
            ]
        : antiIce === 'ON'
            ? [
                { altitudeFt: 0, rows: takeoffWithReversers_wet_Flaps7_SeaLevel_AntiIceOn },
                { altitudeFt: 1000, rows: takeoffWithReversers_wet_Flaps7_1000ft_AntiIceOn },
                { altitudeFt: 2000, rows: takeoffWithReversers_wet_Flaps7_2000ft_AntiIceOn },
                { altitudeFt: 3000, rows: takeoffWithReversers_wet_Flaps7_3000ft_AntiIceOn },
                { altitudeFt: 4000, rows: takeoffWithReversers_wet_Flaps7_4000ft_AntiIceOn },
                { altitudeFt: 5000, rows: takeoffWithReversers_wet_Flaps7_5000ft_AntiIceOn },
                { altitudeFt: 6000, rows: takeoffWithReversers_wet_Flaps7_6000ft_AntiIceOn },
            ]
            : [
                { altitudeFt: 0, rows: takeoffWithReversers_Wet_flaps7_0ft },
                { altitudeFt: 1000, rows: takeoffWithReversers_Wet_flaps7_1000ft },
                { altitudeFt: 2000, rows: takeoffWithReversers_Wet_flaps7_2000ft },
                { altitudeFt: 3000, rows: takeoffWithReversers_Wet_flaps7_3000ft },
                { altitudeFt: 4000, rows: takeoffWithReversers_Wet_flaps7_4000ft },
                { altitudeFt: 5000, rows: takeoffWithReversers_Wet_flaps7_5000ft },
                { altitudeFt: 6000, rows: takeoffWithReversers_Wet_flaps7_6000ft },
            ];
    const wetTablesWithoutReversers = flaps === 15
        ? antiIce === 'OFF'
            ? [
                { altitudeFt: 0, rows: takeoffFieldLength_NoRev_Flaps15_SeaLevel_AntiIceOff },
                { altitudeFt: 1000, rows: takeoffFieldLength_NoRev_Flaps15_1000ft_AntiIceOff },
                { altitudeFt: 2000, rows: takeoffFieldLength_NoRev_Flaps15_2000ft_AntiIceOff },
                { altitudeFt: 3000, rows: takeoffFieldLength_NoRev_Flaps15_3000ft_AntiIceOff },
                { altitudeFt: 4000, rows: takeoffFieldLength_NoRev_Flaps15_4000ft_AntiIceOff },
                { altitudeFt: 5000, rows: takeoffFieldLength_NoRev_Flaps15_5000ft_AntiIceOff },
                { altitudeFt: 6000, rows: takeoffFieldLength_NoRev_Flaps15_6000ft_AntiIceOff },
            ]
            : [
                { altitudeFt: 0, rows: takeoffFieldLength_NoRev_Flaps15_SeaLevel_AntiIceOn },
                { altitudeFt: 1000, rows: takeoffFieldLength_NoRev_Flaps15_1000ft_AntiIceOn },
                { altitudeFt: 2000, rows: takeoffFieldLength_NoRev_Flaps15_2000ft_AntiIceOn },
                { altitudeFt: 3000, rows: takeoffFieldLength_NoRev_Flaps15_3000ft_AntiIceOn },
                { altitudeFt: 4000, rows: takeoffFieldLength_NoRev_Flaps15_4000ft_AntiIceOn },
                { altitudeFt: 5000, rows: takeoffFieldLength_NoRev_Flaps15_5000ft_AntiIceOn },
                { altitudeFt: 6000, rows: takeoffFieldLength_NoRev_Flaps15_6000ft_AntiIceOn },
            ]
        : [];
    const tableArgs = [pressureAltitudeFt, Number(weightLb), Number(oatC), headwindKnots];
    const dryUncorrectedFt = interpolateC56xTakeoffAltitude(dryTables, ...tableArgs);
    if (dryUncorrectedFt === null) return null;

    const dryDistanceFt = applyC56xRunwayGradient(
        dryUncorrectedFt,
        Number(runwaySlopePercent),
        false,
        antiIce,
        flaps
    );
    if (dryDistanceFt === null) return null;

    const selectedWetTables = reverserStatus === 'INOP'
        ? wetTablesWithoutReversers
        : wetTables;
    const wetTablesAvailable = selectedWetTables.length > 0 &&
        selectedWetTables.every((table) => Array.isArray(table.rows));
    if (!wetTablesAvailable) {
        return {
            pressureAltitudeFt,
            headwindKnots,
            dryDistanceFt,
            wetChartDistanceFt: null,
            wetRequiredDistanceFt: null,
            selectedDistanceFt: runwayConditionCode === '6' ? dryDistanceFt : null,
            antiIce,
        };
    }

    const wetUncorrectedFt = interpolateC56xTakeoffAltitude(selectedWetTables, ...tableArgs);
    if (wetUncorrectedFt === null) return null;

    const wetChartDistanceFt = applyC56xRunwayGradient(
        wetUncorrectedFt,
        Number(runwaySlopePercent),
        true,
        antiIce,
        flaps
    );
    if (wetChartDistanceFt === null) {
        return {
            pressureAltitudeFt,
            headwindKnots,
            dryDistanceFt,
            wetChartDistanceFt: null,
            wetRequiredDistanceFt: null,
            selectedDistanceFt: runwayConditionCode === '6' ? dryDistanceFt : null,
            antiIce,
        };
    }

    const wetRequiredDistanceFt = Math.max(dryDistanceFt, wetChartDistanceFt);
    const selectedDistanceFt = runwayConditionCode === '5'
        ? wetRequiredDistanceFt
        : dryDistanceFt;
    return {
        pressureAltitudeFt,
        headwindKnots,
        dryDistanceFt,
        wetChartDistanceFt,
        wetRequiredDistanceFt,
        selectedDistanceFt,
    };
}

function getC56xTakeoffSpeeds({
    pressureAltitudeFt,
    weightLb,
    oatC,
    headwindKnots,
    runwayConditionCode,
    runwaySlopePercent = 0,
    reverserStatus = 'AVAILABLE',
    antiIce = 'ON',
    flaps = 7,
}) {
    const useWetTable = runwayConditionCode === '5';
    if (flaps !== 7 && flaps !== 15) return null;
    if (antiIce !== 'ON' && antiIce !== 'OFF') return null;
    if (useWetTable && reverserStatus !== 'AVAILABLE' &&
        !(reverserStatus === 'INOP' && flaps === 15)) return null;
    if (runwayConditionCode !== '5' && runwayConditionCode !== '6') return null;
    const tables = flaps === 15
        ? useWetTable
            ? reverserStatus === 'INOP'
                ? antiIce === 'OFF'
                    ? [
                        { altitudeFt: 0, rows: takeoffFieldLength_NoRev_Flaps15_SeaLevel_AntiIceOff },
                        { altitudeFt: 1000, rows: takeoffFieldLength_NoRev_Flaps15_1000ft_AntiIceOff },
                        { altitudeFt: 2000, rows: takeoffFieldLength_NoRev_Flaps15_2000ft_AntiIceOff },
                        { altitudeFt: 3000, rows: takeoffFieldLength_NoRev_Flaps15_3000ft_AntiIceOff },
                        { altitudeFt: 4000, rows: takeoffFieldLength_NoRev_Flaps15_4000ft_AntiIceOff },
                        { altitudeFt: 5000, rows: takeoffFieldLength_NoRev_Flaps15_5000ft_AntiIceOff },
                        { altitudeFt: 6000, rows: takeoffFieldLength_NoRev_Flaps15_6000ft_AntiIceOff },
                    ]
                    : [
                        { altitudeFt: 0, rows: takeoffFieldLength_NoRev_Flaps15_SeaLevel_AntiIceOn },
                        { altitudeFt: 1000, rows: takeoffFieldLength_NoRev_Flaps15_1000ft_AntiIceOn },
                        { altitudeFt: 2000, rows: takeoffFieldLength_NoRev_Flaps15_2000ft_AntiIceOn },
                        { altitudeFt: 3000, rows: takeoffFieldLength_NoRev_Flaps15_3000ft_AntiIceOn },
                        { altitudeFt: 4000, rows: takeoffFieldLength_NoRev_Flaps15_4000ft_AntiIceOn },
                        { altitudeFt: 5000, rows: takeoffFieldLength_NoRev_Flaps15_5000ft_AntiIceOn },
                        { altitudeFt: 6000, rows: takeoffFieldLength_NoRev_Flaps15_6000ft_AntiIceOn },
                    ]
                : antiIce === 'OFF'
                    ? [
                    { altitudeFt: 0, rows: takeoffFieldLength_Wet_Flaps15_Reversers_SeaLevel_AntiIceOff },
                    { altitudeFt: 1000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_1000ft_AntiIceOff },
                    { altitudeFt: 2000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_2000ft_AntiIceOff },
                    { altitudeFt: 3000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_3000ft_AntiIceOff },
                    { altitudeFt: 4000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_4000ft_AntiIceOff },
                    { altitudeFt: 5000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_5000ft_AntiIceOff },
                    { altitudeFt: 6000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_6000ft_AntiIceOff },
                ]
                    : [
                    { altitudeFt: 0, rows: takeoffFieldLength_Wet_Flaps15_Reversers_SeaLevel_AntiIceOn },
                    { altitudeFt: 1000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_1000ft_AntiIceOn },
                    { altitudeFt: 2000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_2000ft_AntiIceOn },
                    { altitudeFt: 3000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_3000ft_AntiIceOn },
                    { altitudeFt: 4000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_4000ft_AntiIceOn },
                    { altitudeFt: 5000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_5000ft_AntiIceOn },
                    { altitudeFt: 6000, rows: takeoffFieldLength_Wet_Flaps15_Reversers_6000ft_AntiIceOn },
                ]
            : antiIce === 'OFF'
                ? [
                    { altitudeFt: 0, rows: takeoffFieldLength_Dry_Flaps15_SeaLevel },
                    { altitudeFt: 1000, rows: takeoffFieldLength_Dry_Flaps15_1000ft },
                    { altitudeFt: 2000, rows: takeoffFieldLength_Dry_Flaps15_2000ft },
                    { altitudeFt: 3000, rows: takeoffFieldLength_Dry_Flaps15_3000ft },
                    { altitudeFt: 4000, rows: takeoffFieldLength_Dry_Flaps15_4000ft },
                    { altitudeFt: 5000, rows: takeoffFieldLengthDry_Flaps15_5000ft },
                    { altitudeFt: 6000, rows: takeoffFieldLengthDry_Flaps15_6000ft },
                ]
                : [
                    { altitudeFt: 0, rows: takeoffFieldLength_Dry_Flaps15_SeaLevel_AntiIceOn },
                    { altitudeFt: 1000, rows: takeoffFieldLength_Dry_Flaps15_1000ft_AntiIceOn },
                    { altitudeFt: 2000, rows: takeoffFieldLength_Dry_Flaps15_2000ft_AntiIceOn },
                    { altitudeFt: 3000, rows: takeoffFieldLength_Dry_Flaps15_3000ft_AntiIceOn },
                    { altitudeFt: 4000, rows: takeoffFieldLength_Dry_Flaps15_4000ft_AntiIceOn },
                    { altitudeFt: 5000, rows: takeoffFieldLength_Dry_Flaps15_5000ft_AntiIceOn },
                    { altitudeFt: 6000, rows: takeoffFieldLength_Dry_Flaps15_6000ft_AntiIceOn },
                ]
        : useWetTable
        ? antiIce === 'OFF'
            ? [
                { altitudeFt: 0, rows: takeoffWithReversers_Wet_flaps7_0ft },
                { altitudeFt: 1000, rows: takeoffWithReversers_Wet_flaps7_1000ft },
                { altitudeFt: 2000, rows: takeoffWithReversers_Wet_flaps7_2000ft },
                { altitudeFt: 3000, rows: takeoffWithReversers_Wet_flaps7_3000ft },
                { altitudeFt: 4000, rows: takeoffWithReversers_Wet_flaps7_4000ft },
                { altitudeFt: 5000, rows: takeoffWithReversers_Wet_flaps7_5000ft },
                { altitudeFt: 6000, rows: takeoffWithReversers_Wet_flaps7_6000ft },
            ]
            : [
                { altitudeFt: 0, rows: takeoffWithReversers_wet_Flaps7_SeaLevel_AntiIceOn },
                { altitudeFt: 1000, rows: takeoffWithReversers_wet_Flaps7_1000ft_AntiIceOn },
                { altitudeFt: 2000, rows: takeoffWithReversers_wet_Flaps7_2000ft_AntiIceOn },
                { altitudeFt: 3000, rows: takeoffWithReversers_wet_Flaps7_3000ft_AntiIceOn },
                { altitudeFt: 4000, rows: takeoffWithReversers_wet_Flaps7_4000ft_AntiIceOn },
                { altitudeFt: 5000, rows: takeoffWithReversers_wet_Flaps7_5000ft_AntiIceOn },
                { altitudeFt: 6000, rows: takeoffWithReversers_wet_Flaps7_6000ft_AntiIceOn },
            ]
        : antiIce === 'OFF'
            ? [
                { altitudeFt: 0, rows: takeoffFieldLength_Dry_Flaps7_0ft },
                { altitudeFt: 1000, rows: takeoffFieldLength_Dry_Flaps7_1000ft_Complete },
                { altitudeFt: 2000, rows: takeoffFieldLength_Dry_Flaps7_2000ft_Complete },
                { altitudeFt: 3000, rows: takeoffFieldLength_Dry_Flaps7_3000ft_Complete },
                { altitudeFt: 4000, rows: takeoffFieldLength_Dry_Flaps7_4000ft_Complete },
                { altitudeFt: 5000, rows: takeoffFieldLength_Dry_Flaps7_5000ft_Complete },
                { altitudeFt: 6000, rows: takeoffFieldLength_Dry_Flaps7_6000ft_Complete },
            ]
            : [
                { altitudeFt: 0, rows: takeoffFieldLength_Dry_Flaps7_AntiIceOn_0ft },
                { altitudeFt: 1000, rows: takeoffFieldLength_Dry_Flaps7_AntiIceOn_1000ft },
                { altitudeFt: 2000, rows: takeoffFieldLength_Dry_Flaps7_AntiIceOn_2000ft },
                { altitudeFt: 3000, rows: takeoffFieldLength_Dry_Flaps7_AntiIceOn_3000ft },
                { altitudeFt: 4000, rows: takeoffFieldLength_Dry_Flaps7_AntiIceOn_4000ft },
                { altitudeFt: 5000, rows: takeoffFieldLength_Dry_Flaps7_AntiIceOn_5000ft },
                { altitudeFt: 6000, rows: takeoffFieldLength_Dry_Flaps7_AntiIceOn_6000ft },
            ];
    const windSamples = [
        { knots: -10, key: 'tailwind10' },
        { knots: 0, key: 'zeroWind' },
        { knots: 10, key: 'headwind10' },
        { knots: 20, key: 'headwind20' },
        { knots: 30, key: 'headwind30' },
    ];
    const interpolateAtWeightAndTemperature = (rows, valueKey) =>
        interpolateC56xTakeoffAxis(
            rows,
            weightLb,
            (row) => row.weight,
            (weightRow) => interpolateC56xTakeoffAxis(
                weightRow.data,
                oatC,
                (row) => row.temp,
                (temperatureRow) => valueKey === 'v1'
                    ? interpolateC56xTakeoffAxis(
                        windSamples,
                        headwindKnots,
                        (sample) => sample.knots,
                        (sample) => temperatureRow[sample.key]?.v1
                    )
                    : temperatureRow[valueKey]
            )
        );
    const interpolateAtAltitude = (valueKey) => interpolateC56xTakeoffAxis(
        tables,
        pressureAltitudeFt,
        (table) => table.altitudeFt,
        (table) => interpolateAtWeightAndTemperature(table.rows, valueKey)
    );

    const v1 = interpolateAtAltitude('v1');
    const vr = interpolateAtAltitude('vr');
    const v2 = interpolateAtAltitude('v2');
    if (![v1, vr, v2].every(Number.isFinite)) return null;

    const adjustments = useWetTable
        ? flaps === 7
            ? antiIce === 'OFF'
                ? takeoffGradientAdjustment_wet_reversers_Flaps7_AntiIceOff.v1Adjustments
                : takeoffGradientAdjustment_reversers_wet_Flaps7_AntiIceOn.v1Adjustments
            : reverserStatus === 'INOP'
                ? antiIce === 'OFF'
                    ? v1Adjustments_Wet_Flaps15_AntiIceOff
                    : v1Adjustments_Wet_Flaps15_AntiIceOn
                : antiIce === 'OFF'
                    ? v1Adjustments_Wet_WithReversers_Flaps15_AntiIceOff
                    : v1Adjustments_WetWithReversers_Flaps15_AntiIceOn
        : flaps === 7
            ? antiIce === 'OFF'
                ? v1Adjustments
                : v1Adjustments_AntiIceOn
            : antiIce === 'OFF'
                ? v1Adjustments_Dry_Flaps15_AntiIceOff
                : v1Adjustments_Dry_Flaps15_AntiIceOn;
    const v1Adjustment = getC56xV1GradientAdjustment(adjustments, runwaySlopePercent);
    if (v1Adjustment === null) return null;
    return {
        v1: v1 + v1Adjustment,
        vr,
        v2,
        v1CorrectionKnots: v1Adjustment,
    };
}

function getC56xSecondSegmentClimbGradient({
    pressureAltitudeFt,
    weightLb,
    oatC,
    headwindKnots,
    flaps = 7,
    antiIce = 'ON',
}) {
    const data = flaps === 15
        ? antiIce === 'OFF'
            ? secondSegmentClimbGradient_flaps15_anti_ice_off
            : secondSegmentClimbGradient_flaps15_anti_ice_on
        : flaps === 7
            ? antiIce === 'OFF'
                ? secondSegmentClimbGradient_flaps7_anti_ice_off
                : secondSegmentClimbGradient_flaps7_anti_ice_on
            : [];
    const dataByAltitude = new Map();
    data.forEach((altitudeData) => {
        const existing = dataByAltitude.get(altitudeData.altitudeFt) || [];
        const weightTables = altitudeData.data || altitudeData.weights || [];
        existing.push(...weightTables.map((weightTable) => {
            if (Array.isArray(weightTable.temperatures)) return weightTable;
            return {
                weight: weightTable.weight,
                temperatures: (weightTable.data || []).map((row) => ({
                    temp: row.temp,
                    windMinus10: row.windKnots?.['-10'],
                    wind0: row.windKnots?.['0'],
                    wind10: row.windKnots?.['10'],
                    wind20: row.windKnots?.['20'],
                    wind30: row.windKnots?.['30'],
                })),
            };
        }));
        dataByAltitude.set(altitudeData.altitudeFt, existing);
    });
    const altitudeTables = [...dataByAltitude.entries()]
        .map(([altitudeFt, rows]) => ({ altitudeFt, rows }));
    const windSamples = [
        { knots: -10, key: 'windMinus10' },
        { knots: 0, key: 'wind0' },
        { knots: 10, key: 'wind10' },
        { knots: 20, key: 'wind20' },
        { knots: 30, key: 'wind30' },
    ];
    const adjustedWeightLb = weightLb <= 19323
        ? weightLb * 1.035
        : weightLb;
    const gradient = interpolateC56xTakeoffAxis(
        altitudeTables,
        pressureAltitudeFt,
        (table) => table.altitudeFt,
        (altitudeTable) => interpolateC56xTakeoffAxis(
            altitudeTable.rows,
            adjustedWeightLb,
            (row) => row.weight,
            (weightRow) => interpolateC56xTakeoffAxis(
                weightRow.temperatures,
                oatC,
                (row) => row.temp,
                (temperatureRow) => interpolateC56xTakeoffAxis(
                    windSamples,
                    headwindKnots,
                    (sample) => sample.knots,
                    (sample) => temperatureRow[sample.key]
                )
            )
        )
    );
    if (gradient === null || weightLb <= 19323) return gradient;
    return gradient - 1.2;
}
