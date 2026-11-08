const C56X_MAX_DESIGN_LANDING_WEIGHT_LB = 18700;
const C56X_MIN_APPROACH_CLIMB_GRADIENT_PERCENT = 2.5;
const C56X_MIN_LANDING_CLIMB_GRADIENT_PERCENT = 3.2;
const C56X_LANDING_WIND_SAMPLES = [-10, 0, 10, 20, 30];
const C56X_LANDING_DISTANCE_WIND_KEYS = {
    '-10': 'tailwind10',
    '0': 'zeroWind',
    '10': 'headwind10',
    '20': 'headwind20',
    '30': 'headwind30',
};

// More than 30 kt headwind is held at 30 kt, which is conservative for every landing chart.
function interpolateC56xLandingChart(altitudeTables, pressureAltitudeFt, weightLb, oatC, headwindKnots, getWindValue) {
    if (!Number.isFinite(headwindKnots)) return null;
    const windKnots = Math.min(headwindKnots, 30);
    return interpolateC56xTakeoffAxis(
        altitudeTables,
        pressureAltitudeFt,
        (table) => table.altitudeFt,
        (altitudeTable) => interpolateC56xTakeoffAxis(
            altitudeTable.weights,
            weightLb,
            (weightRow) => weightRow.weight,
            (weightRow) => interpolateC56xTakeoffAxis(
                weightRow.data,
                oatC,
                (row) => row.temp,
                (temperatureRow) => interpolateC56xTakeoffAxis(
                    C56X_LANDING_WIND_SAMPLES,
                    windKnots,
                    (knots) => knots,
                    (knots) => getWindValue(temperatureRow, knots)
                )
            )
        )
    );
}

// Figures 4-44/4-45/4-46. Level and uphill runways use the 0 % chart. Returns feet, unfactored.
function getC56xLandingDistance({
    pressureAltitudeFt,
    weightLb,
    oatC,
    headwindKnots,
    runwaySlopePercent,
}) {
    if (!Number.isFinite(runwaySlopePercent) || runwaySlopePercent < -2) return null;
    const charts = [
        { slope: 0, table: landingDistanceFlaps35_zeroGradient },
        { slope: -1, table: landingDistanceFlaps35_down1Percent },
        { slope: -2, table: landingDistanceFlaps35_down2Percent },
    ];
    return interpolateC56xTakeoffAxis(
        charts,
        Math.min(runwaySlopePercent, 0),
        (chart) => chart.slope,
        (chart) => interpolateC56xLandingChart(
            chart.table,
            pressureAltitudeFt,
            weightLb,
            oatC,
            headwindKnots,
            (row, knots) => row[C56X_LANDING_DISTANCE_WIND_KEYS[knots]]
        )
    );
}

function getC56xLandingSpeeds({ pressureAltitudeFt, weightLb }) {
    // The speed headings match across Figures 4-44/4-45/4-46 and vary only by weight and altitude.
    const interpolateSpeed = (key) => interpolateC56xTakeoffAxis(
        landingDistanceFlaps35_zeroGradient,
        pressureAltitudeFt,
        (table) => table.altitudeFt,
        (altitudeTable) => interpolateC56xTakeoffAxis(
            altitudeTable.weights,
            weightLb,
            (weightRow) => weightRow.weight,
            (weightRow) => weightRow[key]
        )
    );
    return {
        vref: interpolateSpeed('vref'),
        vapp: interpolateSpeed('vapp'),
    };
}

// Figures 4-47 to 4-50. Approach climb uses flaps 15, landing (balked) climb uses flaps 35.
function getC56xLandingClimbGradients({
    pressureAltitudeFt,
    weightLb,
    oatC,
    headwindKnots,
    antiIce = 'OFF',
}) {
    const antiIceOn = antiIce === 'ON';
    const getGradient = (table) => interpolateC56xLandingChart(
        table,
        pressureAltitudeFt,
        weightLb,
        oatC,
        headwindKnots,
        (row, knots) => row.windKnots?.[String(knots)]
    );
    return {
        approach: getGradient(antiIceOn
            ? approachGrossClimbGradient_flaps15_anti_ice_on
            : approachGrossClimbGradient_flaps15_anti_ice_off),
        landing: getGradient(antiIceOn
            ? landingGrossClimbGradient_flaps35_anti_ice_on
            : landingGrossClimbGradient_flaps35_anti_ice_off),
    };
}

// Figure 4-43: climb (anti-ice OFF) and brake energy limited landing weight.
function getC56xFigure443MaxLandingWeight({
    pressureAltitudeFt,
    oatC,
    headwindKnots,
    runwaySlopePercent,
}) {
    const figure = c56xFigure443LandingWeight;
    const gradients = [...new Set(figure.weightColumns.map((column) => column.runwayGradientPercent))];
    if (!Number.isFinite(headwindKnots) || !Number.isFinite(runwaySlopePercent) ||
        runwaySlopePercent < Math.min(...gradients) || runwaySlopePercent > Math.max(...gradients)) {
        return null;
    }
    const windKnots = Math.min(headwindKnots, 30);
    const weight = interpolateC56xTakeoffAxis(
        figure.altitudeTables,
        pressureAltitudeFt,
        (table) => table.altitudeFt,
        (altitudeTable) => interpolateC56xTakeoffAxis(
            altitudeTable.rows,
            oatC,
            (row) => row.temperatureC,
            (row) => interpolateC56xTakeoffAxis(
                C56X_LANDING_WIND_SAMPLES,
                windKnots,
                (knots) => knots,
                (knots) => interpolateC56xTakeoffAxis(
                    gradients,
                    runwaySlopePercent,
                    (gradient) => gradient,
                    (gradient) => {
                        const columnIndex = figure.weightColumns.findIndex((column) =>
                            column.windKnots === knots && column.runwayGradientPercent === gradient
                        );
                        return columnIndex < 0 ? null : row.maximumLandingWeightLbByColumn[columnIndex];
                    }
                )
            )
        )
    );
    return weight === null ? null : Math.floor(weight);
}

function getC56xFigure442MaxLandingWeight({ pressureAltitudeFt, oatC }) {
    const weight = interpolateC56xTakeoffAxis(
        c56xFigure442LandingWeight.altitudeTables,
        pressureAltitudeFt,
        (table) => table.altitudeFt,
        (altitudeTable) => interpolateC56xTakeoffAxis(
            altitudeTable.rows,
            oatC,
            (row) => row.temp,
            (row) => row.maxLandingWeightLb
        )
    );
    return weight === null ? null : Math.floor(weight);
}

function getC56xMaxLandingWeight({
    pressureAltitudeFt,
    oatC,
    headwindKnots,
    runwaySlopePercent,
    antiIce = 'OFF',
}) {
    const figure443Lb = getC56xFigure443MaxLandingWeight({
        pressureAltitudeFt,
        oatC,
        headwindKnots,
        runwaySlopePercent,
    });
    const figure442Lb = antiIce === 'ON'
        ? getC56xFigure442MaxLandingWeight({ pressureAltitudeFt, oatC })
        : null;
    return {
        figure443Lb,
        figure442Lb,
        figure442Missing: antiIce === 'ON' && figure442Lb === null,
        limitingLb: antiIce === 'ON'
            ? Number.isFinite(figure442Lb) && Number.isFinite(figure443Lb)
                ? Math.min(figure442Lb, figure443Lb)
                : null
            : figure443Lb,
    };
}

function getC56xLandingPerformance({
    qnhHpa,
    fieldElevationFt,
    oatC,
    weightLb,
    headwindKnots,
    runwaySlopePercent,
    runwayConditionCode,
    antiIce = 'OFF',
    reverserStatus = 'AVAILABLE',
}) {
    const pressureAltitudeFt = calculateC56xPressureAltitude(qnhHpa, fieldElevationFt);
    const distanceInputs = { pressureAltitudeFt, weightLb, oatC, headwindKnots, runwaySlopePercent };
    const distanceFt = getC56xLandingDistance(distanceInputs);
    const landingSpeeds = getC56xLandingSpeeds({ pressureAltitudeFt, weightLb });
    const landingFactors = reverserStatus === 'INOP'
        ? factorsRunwayConditionCodesLanding_no_reversers
        : factorsRunwayConditionCodesLanding;
    const factor = landingFactors.find(
        (entry) => entry.code === String(runwayConditionCode)
    )?.factor ?? null;
    const climbGradients = getC56xLandingClimbGradients({
        pressureAltitudeFt,
        weightLb,
        oatC,
        headwindKnots,
        antiIce,
    });
    return {
        pressureAltitudeFt,
        distanceFt,
        factor,
        requiredDistanceFt: distanceFt !== null && factor !== null ? distanceFt * factor : null,
        approachClimbGradient: climbGradients.approach,
        landingClimbGradient: climbGradients.landing,
        vref: landingSpeeds.vref,
        vapp: landingSpeeds.vapp,
        maxLandingWeight: getC56xMaxLandingWeight({
            pressureAltitudeFt,
            oatC,
            headwindKnots,
            runwaySlopePercent,
            antiIce,
        }),
        isAboveMaxDesignLandingWeight: weightLb > C56X_MAX_DESIGN_LANDING_WEIGHT_LB,
    };
}
