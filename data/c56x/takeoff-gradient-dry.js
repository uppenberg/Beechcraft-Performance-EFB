const v1Adjustments = {
    uphill: { "2.0%": "V1 + 0", "1.5%": "V1 + 0", "1.0%": "V1 + 0", "0.5%": "V1 + 0" },
    downhillShaded: { "-1%": "V1 - 3", "-2%": "V1 - 5" },
    downhillNonShaded: { "-1%": "V1 + 1", "-2%": "V1 + 1" }
};
// hör ihop med ovan, v1Adjustments
const takeoffFieldLengthGradient_Dry_Flaps7 = [
    {
        baseFieldLength: 1600,
        uphill: { "2.0%": 1800, "1.5%": 1750, "1.0%": 1750, "0.5%": 1700 },
        downhillShaded: { "-1%": 1600, "-2%": 1550 },
        downhillNonShaded: { "-1%": 1700, "-2%": 1700 }
    },
    {
        baseFieldLength: 1800,
        uphill: { "2.0%": 2050, "1.5%": 2000, "1.0%": 1950, "0.5%": 1900 },
        downhillShaded: { "-1%": 1800, "-2%": 1750 },
        downhillNonShaded: { "-1%": 1900, "-2%": 1950 }
    },
    {
        baseFieldLength: 2000,
        uphill: { "2.0%": 2350, "1.5%": 2300, "1.0%": 2200, "0.5%": 2150 },
        downhillShaded: { "-1%": 2050, "-2%": 2000 },
        downhillNonShaded: { "-1%": 2150, "-2%": 2150 }
    },
    {
        baseFieldLength: 2200,
        uphill: { "2.0%": 2600, "1.5%": 2500, "1.0%": 2400, "0.5%": 2350 },
        downhillShaded: { "-1%": 2250, "-2%": 2200 },
        downhillNonShaded: { "-1%": 2350, "-2%": 2350 }
    },
    {
        baseFieldLength: 2400,
        uphill: { "2.0%": 2850, "1.5%": 2750, "1.0%": 2650, "0.5%": 2550 },
        downhillShaded: { "-1%": 2450, "-2%": 2400 },
        downhillNonShaded: { "-1%": 2550, "-2%": 2550 }
    },
    {
        baseFieldLength: 2600,
        uphill: { "2.0%": 3100, "1.5%": 3000, "1.0%": 2850, "0.5%": 2750 },
        downhillShaded: { "-1%": 2650, "-2%": 2600 },
        downhillNonShaded: { "-1%": 2750, "-2%": 2800 }
    },
    {
        baseFieldLength: 2800,
        uphill: { "2.0%": 3400, "1.5%": 3250, "1.0%": 3100, "0.5%": 3000 },
        downhillShaded: { "-1%": 2850, "-2%": 2800 },
        downhillNonShaded: { "-1%": 2950, "-2%": 3000 }
    },
    {
        baseFieldLength: 3000,
        uphill: { "2.0%": 3750, "1.5%": 3550, "1.0%": 3350, "0.5%": 3200 },
        downhillShaded: { "-1%": 3050, "-2%": 3000 },
        downhillNonShaded: { "-1%": 3150, "-2%": 3200 }
    },
    {
        baseFieldLength: 3200,
        uphill: { "2.0%": 4000, "1.5%": 3800, "1.0%": 3600, "0.5%": 3450 },
        downhillShaded: { "-1%": 3250, "-2%": 3200 },
        downhillNonShaded: { "-1%": 3350, "-2%": 3400 }
    },
    {
        baseFieldLength: 3400,
        uphill: { "2.0%": 4300, "1.5%": 4050, "1.0%": 3850, "0.5%": 3650 },
        downhillShaded: { "-1%": 3450, "-2%": 3350 },
        downhillNonShaded: { "-1%": 3550, "-2%": 3600 }
    },
    {
        baseFieldLength: 3600,
        uphill: { "2.0%": 4650, "1.5%": 4350, "1.0%": 4100, "0.5%": 3850 },
        downhillShaded: { "-1%": 3650, "-2%": 3550 },
        downhillNonShaded: { "-1%": 3750, "-2%": 3800 }
    },
    {
        baseFieldLength: 3800,
        uphill: { "2.0%": 4950, "1.5%": 4600, "1.0%": 4300, "0.5%": 4100 },
        downhillShaded: { "-1%": 3850, "-2%": 3750 },
        downhillNonShaded: { "-1%": 3950, "-2%": 4000 }
    },
    {
        baseFieldLength: 4000,
        uphill: { "2.0%": 5300, "1.5%": 4900, "1.0%": 4550, "0.5%": 4300 },
        downhillShaded: { "-1%": 4000, "-2%": 3900 },
        downhillNonShaded: { "-1%": 4150, "-2%": 4200 }
    },
    {
        baseFieldLength: 4200,
        uphill: { "2.0%": 5650, "1.5%": 5200, "1.0%": 4850, "0.5%": 4550 },
        downhillShaded: { "-1%": 4200, "-2%": 4100 },
        downhillNonShaded: { "-1%": 4400, "-2%": 4450 }
    },
    {
        baseFieldLength: 4400,
        uphill: { "2.0%": 6050, "1.5%": 5500, "1.0%": 5100, "0.5%": 4750 },
        downhillShaded: { "-1%": 4400, "-2%": 4300 },
        downhillNonShaded: { "-1%": 4550, "-2%": 4600 }
    },
    {
        baseFieldLength: 4600,
        uphill: { "2.0%": 6400, "1.5%": 5850, "1.0%": 5350, "0.5%": 5000 },
        downhillShaded: { "-1%": 4600, "-2%": 4450 },
        downhillNonShaded: { "-1%": 4800, "-2%": 4850 }
    },
    {
        baseFieldLength: 4800,
        uphill: { "2.0%": 6850, "1.5%": 6150, "1.0%": 5600, "0.5%": 5200 },
        downhillShaded: { "-1%": 4800, "-2%": 4650 },
        downhillNonShaded: { "-1%": 5000, "-2%": 5050 }
    },
    {
        baseFieldLength: 5000,
        uphill: { "2.0%": 7300, "1.5%": 6500, "1.0%": 5900, "0.5%": 5450 },
        downhillShaded: { "-1%": 5000, "-2%": 4800 },
        downhillNonShaded: { "-1%": 5200, "-2%": 5250 }
    },
    {
        baseFieldLength: 5200,
        uphill: { "2.0%": 7700, "1.5%": 6800, "1.0%": 6200, "0.5%": 5700 },
        downhillShaded: { "-1%": 5200, "-2%": 5000 },
        downhillNonShaded: { "-1%": 5400, "-2%": 5450 }
    },
    {
        baseFieldLength: 5400,
        uphill: { "2.0%": 8200, "1.5%": 7200, "1.0%": 6450, "0.5%": 5900 },
        downhillShaded: { "-1%": 5350, "-2%": 5200 },
        downhillNonShaded: { "-1%": 5600, "-2%": 5600 }
    },
    {
        baseFieldLength: 5600,
        uphill: { "2.0%": 8600, "1.5%": 7500, "1.0%": 6750, "0.5%": 6150 },
        downhillShaded: { "-1%": 5550, "-2%": 5350 },
        downhillNonShaded: { "-1%": 5800, "-2%": 5800 }
    },
    {
        baseFieldLength: 5800,
        uphill: { "2.0%": 9150, "1.5%": 7900, "1.0%": 7000, "0.5%": 6350 },
        downhillShaded: { "-1%": 5750, "-2%": 5550 },
        downhillNonShaded: { "-1%": 6000, "-2%": 6000 }
    },
    {
        baseFieldLength: 6000,
        uphill: { "2.0%": 9800, "1.5%": 8300, "1.0%": 7350, "0.5%": 6600 },
        downhillShaded: { "-1%": 5950, "-2%": 5700 },
        downhillNonShaded: { "-1%": 6200, "-2%": 6200 }
    },
    {
        baseFieldLength: 6200,
        uphill: { "2.0%": 10500, "1.5%": 8750, "1.0%": 7650, "0.5%": 6850 },
        downhillShaded: { "-1%": 6100, "-2%": 5900 },
        downhillNonShaded: { "-1%": 6350, "-2%": 6400 }
    },
    {
        baseFieldLength: 6400,
        uphill: { "2.0%": 11150, "1.5%": 9150, "1.0%": 7950, "0.5%": 7100 },
        downhillShaded: { "-1%": 6300, "-2%": 6050 },
        downhillNonShaded: { "-1%": 6500, "-2%": 6550 }
    },
    {
        baseFieldLength: 6600,
        uphill: { "2.0%": 11750, "1.5%": 9650, "1.0%": 8300, "0.5%": 7350 },
        downhillShaded: { "-1%": 6500, "-2%": 6200 },
        downhillNonShaded: { "-1%": 6650, "-2%": 6700 }
    },
    {
        baseFieldLength: 6800,
        uphill: { "2.0%": 12350, "1.5%": 10000, "1.0%": 8550, "0.5%": 7600 },
        downhillShaded: { "-1%": 6650, "-2%": 6400 },
        downhillNonShaded: { "-1%": 6800, "-2%": 6800 }
    },
    {
        baseFieldLength: 7000,
        uphill: { "2.0%": 12850, "1.5%": 10350, "1.0%": 8850, "0.5%": 7800 },
        downhillShaded: { "-1%": 6850, "-2%": 6550 },
        downhillNonShaded: { "-1%": 6900, "-2%": 6950 }
    },
    {
        baseFieldLength: 7200,
        uphill: { "2.0%": 13350, "1.5%": 10700, "1.0%": 9100, "0.5%": 8050 },
        downhillShaded: { "-1%": 7050, "-2%": 6750 },
        downhillNonShaded: { "-1%": 7050, "-2%": 7050 }
    },
    {
        baseFieldLength: 7400,
        uphill: { "2.0%": 13900, "1.5%": 11050, "1.0%": 9400, "0.5%": 8300 },
        downhillShaded: { "-1%": 7200, "-2%": 6900 },
        downhillNonShaded: { "-1%": 7150, "-2%": 7200 }
    },
    {
        baseFieldLength: 7600,
        uphill: { "2.0%": 14550, "1.5%": 11500, "1.0%": 9700, "0.5%": 8550 },
        downhillShaded: { "-1%": 7400, "-2%": 7050 },
        downhillNonShaded: { "-1%": 7300, "-2%": 7300 }
    },
    {
        baseFieldLength: 7800,
        uphill: { "2.0%": 15200, "1.5%": 11800, "1.0%": 9950, "0.5%": 8750 },
        downhillShaded: { "-1%": 7550, "-2%": 7200 },
        downhillNonShaded: { "-1%": 7400, "-2%": 7400 }
    },
    {
        baseFieldLength: 8000,
        uphill: { "2.0%": null, "1.5%": 12200, "1.0%": 10250, "0.5%": 8950 },
        downhillShaded: { "-1%": 7750, "-2%": 7350 },
        downhillNonShaded: { "-1%": 7500, "-2%": 7450 }
    },
    {
        baseFieldLength: 8200,
        uphill: { "2.0%": null, "1.5%": 12550, "1.0%": 10500, "0.5%": 9200 },
        downhillShaded: { "-1%": 7950, "-2%": 7550 },
        downhillNonShaded: { "-1%": 7600, "-2%": 7550 }
    },
    {
        baseFieldLength: 8400,
        uphill: { "2.0%": null, "1.5%": 12850, "1.0%": 10750, "0.5%": 9400 },
        downhillShaded: { "-1%": 8100, "-2%": 7650 },
        downhillNonShaded: { "-1%": 7750, "-2%": 7600 }
    },
    {
        baseFieldLength: 8600,
        uphill: { "2.0%": null, "1.5%": 13200, "1.0%": 11000, "0.5%": 9650 },
        downhillShaded: { "-1%": 8250, "-2%": 7800 },
        downhillNonShaded: { "-1%": 7850, "-2%": 7650 }
    },
    {
        baseFieldLength: 8800,
        uphill: { "2.0%": null, "1.5%": 13550, "1.0%": 11300, "0.5%": 9850 },
        downhillShaded: { "-1%": 8450, "-2%": 7950 },
        downhillNonShaded: { "-1%": 8050, "-2%": 7700 }
    },
    {
        baseFieldLength: 9000,
        uphill: { "2.0%": null, "1.5%": 14000, "1.0%": 11650, "0.5%": 10150 },
        downhillShaded: { "-1%": 8650, "-2%": 8150 },
        downhillNonShaded: { "-1%": 8200, "-2%": 7800 }
    },
    {
        baseFieldLength: 9500,
        uphill: { "2.0%": null, "1.5%": 14950, "1.0%": 12400, "0.5%": 10750 },
        downhillShaded: { "-1%": 9050, "-2%": 8500 },
        downhillNonShaded: { "-1%": 8600, "-2%": 8050 }
    },
    {
        baseFieldLength: 10000,
        uphill: { "2.0%": null, "1.5%": 16000, "1.0%": 13150, "0.5%": 11350 },
        downhillShaded: { "-1%": 9450, "-2%": 8900 },
        downhillNonShaded: { "-1%": 9050, "-2%": 8350 }
    },
    {
        baseFieldLength: 10500,
        uphill: { "2.0%": null, "1.5%": null, "1.0%": 14000, "0.5%": 12000 },
        downhillShaded: { "-1%": 9900, "-2%": 9250 },
        downhillNonShaded: { "-1%": 9450, "-2%": 8650 }
    },
    {
        baseFieldLength: 11000,
        uphill: { "2.0%": null, "1.5%": null, "1.0%": 14900, "0.5%": 12600 },
        downhillShaded: { "-1%": 10300, "-2%": 9600 },
        downhillNonShaded: { "-1%": 9900, "-2%": 9000 }
    },
    {
        baseFieldLength: 12000,
        uphill: { "2.0%": null, "1.5%": null, "1.0%": 16250, "0.5%": 13750 },
        downhillShaded: { "-1%": 11150, "-2%": 10300 },
        downhillNonShaded: { "-1%": 10650, "-2%": 9700 }
    },
    {
        baseFieldLength: 13000,
        uphill: { "2.0%": null, "1.5%": null, "1.0%": null, "0.5%": 14900 },
        downhillShaded: { "-1%": 11950, "-2%": 11000 },
        downhillNonShaded: { "-1%": 11400, "-2%": 10400 }
    },
    {
        baseFieldLength: 14000,
        uphill: { "2.0%": null, "1.5%": null, "1.0%": null, "0.5%": 16000 },
        downhillShaded: { "-1%": 12900, "-2%": 11700 },
        downhillNonShaded: { "-1%": 12350, "-2%": 11200 }
    },
    {
        baseFieldLength: 15000,
        uphill: { "2.0%": null, "1.5%": null, "1.0%": null, "0.5%": null },
        downhillShaded: { "-1%": 13800, "-2%": 12400 },
        downhillNonShaded: { "-1%": 13200, "-2%": 12000 }
    }
];

//AFM 4-74
const v1Adjustments_AntiIceOn = {
    uphill: { "2.0%": "V1 + 2", "1.5%": "V1 + 2", "1.0%": "V1 + 0", "0.5%": "V1 + 0" },
    downhillShaded: { "-1%": "V1 - 3", "-2%": "V1 - 5" },
    downhillNonShaded: { "-1%": "V1 + 1", "-2%": "V1 + 1" }
};
// hör ihop med ovan, v1Adjustments_AntiIceOn
const takeoffFieldLengthGradient_Dry_Flaps7_AntiIceOn = [
    {
        baseFieldLength: 1600,
        uphill: { "2.0%": 1750, "1.5%": 1700, "1.0%": 1700, "0.5%": 1700 },
        downhillShaded: { "-1%": 1600, "-2%": 1550 },
        downhillNonShaded: { "-1%": 1700, "-2%": 1700 }
    },
    {
        baseFieldLength: 1800,
        uphill: { "2.0%": 1950, "1.5%": 1950, "1.0%": 1900, "0.5%": 1900 },
        downhillShaded: { "-1%": 1800, "-2%": 1750 },
        downhillNonShaded: { "-1%": 1900, "-2%": 1950 }
    },
    {
        baseFieldLength: 2000,
        uphill: { "2.0%": 2250, "1.5%": 2150, "1.0%": 2200, "0.5%": 2150 },
        downhillShaded: { "-1%": 2050, "-2%": 2000 },
        downhillNonShaded: { "-1%": 2150, "-2%": 2150 }
    },
    {
        baseFieldLength: 2200,
        uphill: { "2.0%": 2500, "1.5%": 2400, "1.0%": 2400, "0.5%": 2350 },
        downhillShaded: { "-1%": 2200, "-2%": 2200 },
        downhillNonShaded: { "-1%": 2350, "-2%": 2350 }
    },
    {
        baseFieldLength: 2400,
        uphill: { "2.0%": 2700, "1.5%": 2600, "1.0%": 2600, "0.5%": 2550 },
        downhillShaded: { "-1%": 2450, "-2%": 2400 },
        downhillNonShaded: { "-1%": 2550, "-2%": 2550 }
    },
    {
        baseFieldLength: 2600,
        uphill: { "2.0%": 2950, "1.5%": 2850, "1.0%": 2850, "0.5%": 2750 },
        downhillShaded: { "-1%": 2650, "-2%": 2600 },
        downhillNonShaded: { "-1%": 2750, "-2%": 2800 }
    },
    {
        baseFieldLength: 2800,
        uphill: { "2.0%": 3250, "1.5%": 3100, "1.0%": 3050, "0.5%": 2950 },
        downhillShaded: { "-1%": 2850, "-2%": 2800 },
        downhillNonShaded: { "-1%": 2950, "-2%": 3000 }
    },
    {
        baseFieldLength: 3000,
        uphill: { "2.0%": 3600, "1.5%": 3450, "1.0%": 3300, "0.5%": 3200 },
        downhillShaded: { "-1%": 3050, "-2%": 3000 },
        downhillNonShaded: { "-1%": 3150, "-2%": 3200 }
    },
    {
        baseFieldLength: 3200,
        uphill: { "2.0%": 3850, "1.5%": 3700, "1.0%": 3550, "0.5%": 3400 },
        downhillShaded: { "-1%": 3250, "-2%": 3150 },
        downhillNonShaded: { "-1%": 3350, "-2%": 3400 }
    },
    {
        baseFieldLength: 3400,
        uphill: { "2.0%": 4100, "1.5%": 3900, "1.0%": 3750, "0.5%": 3600 },
        downhillShaded: { "-1%": 3400, "-2%": 3350 },
        downhillNonShaded: { "-1%": 3550, "-2%": 3600 }
    },
    {
        baseFieldLength: 3600,
        uphill: { "2.0%": 4400, "1.5%": 4150, "1.0%": 4000, "0.5%": 3800 },
        downhillShaded: { "-1%": 3650, "-2%": 3550 },
        downhillNonShaded: { "-1%": 3750, "-2%": 3800 }
    },
    {
        baseFieldLength: 3800,
        uphill: { "2.0%": 4650, "1.5%": 4400, "1.0%": 4200, "0.5%": 4000 },
        downhillShaded: { "-1%": 3850, "-2%": 3700 },
        downhillNonShaded: { "-1%": 3950, "-2%": 3950 }
    },
    {
        baseFieldLength: 4000,
        uphill: { "2.0%": 4950, "1.5%": 4700, "1.0%": 4450, "0.5%": 4250 },
        downhillShaded: { "-1%": 4000, "-2%": 3900 },
        downhillNonShaded: { "-1%": 4200, "-2%": 4200 }
    },
    {
        baseFieldLength: 4200,
        uphill: { "2.0%": 5250, "1.5%": 4950, "1.0%": 4700, "0.5%": 4450 },
        downhillShaded: { "-1%": 4200, "-2%": 4100 },
        downhillNonShaded: { "-1%": 4350, "-2%": 4400 }
    },
    {
        baseFieldLength: 4400,
        uphill: { "2.0%": 5550, "1.5%": 5200, "1.0%": 4950, "0.5%": 4700 },
        downhillShaded: { "-1%": 4400, "-2%": 4250 },
        downhillNonShaded: { "-1%": 4600, "-2%": 4600 }
    },
    {
        baseFieldLength: 4600,
        uphill: { "2.0%": 5900, "1.5%": 5500, "1.0%": 5200, "0.5%": 4900 },
        downhillShaded: { "-1%": 4600, "-2%": 4450 },
        downhillNonShaded: { "-1%": 4800, "-2%": 4800 }
    },
    {
        baseFieldLength: 4800,
        uphill: { "2.0%": 6200, "1.5%": 5800, "1.0%": 5450, "0.5%": 5150 },
        downhillShaded: { "-1%": 4800, "-2%": 4650 },
        downhillNonShaded: { "-1%": 5000, "-2%": 5000 }
    },
    {
        baseFieldLength: 5000,
        uphill: { "2.0%": 6550, "1.5%": 6050, "1.0%": 5700, "0.5%": 5350 },
        downhillShaded: { "-1%": 5000, "-2%": 4800 },
        downhillNonShaded: { "-1%": 5200, "-2%": 5200 }
    },
    {
        baseFieldLength: 5200,
        uphill: { "2.0%": 6900, "1.5%": 6350, "1.0%": 5900, "0.5%": 5550 },
        downhillShaded: { "-1%": 5150, "-2%": 5000 },
        downhillNonShaded: { "-1%": 5400, "-2%": 5400 }
    },
    {
        baseFieldLength: 5400,
        uphill: { "2.0%": 7250, "1.5%": 6650, "1.0%": 6200, "0.5%": 5800 },
        downhillShaded: { "-1%": 5350, "-2%": 5150 },
        downhillNonShaded: { "-1%": 5600, "-2%": 5600 }
    },
    {
        baseFieldLength: 5600,
        uphill: { "2.0%": 7600, "1.5%": 6950, "1.0%": 6450, "0.5%": 6000 },
        downhillShaded: { "-1%": 5550, "-2%": 5350 },
        downhillNonShaded: { "-1%": 5750, "-2%": 5800 }
    },
    {
        baseFieldLength: 5800,
        uphill: { "2.0%": 8000, "1.5%": 7300, "1.0%": 6700, "0.5%": 6250 },
        downhillShaded: { "-1%": 5750, "-2%": 5500 },
        downhillNonShaded: { "-1%": 5950, "-2%": 6000 }
    },
    {
        baseFieldLength: 6000,
        uphill: { "2.0%": 8350, "1.5%": 7600, "1.0%": 6950, "0.5%": 6450 },
        downhillShaded: { "-1%": 5950, "-2%": 5700 },
        downhillNonShaded: { "-1%": 6150, "-2%": 6150 }
    },
    {
        baseFieldLength: 6200,
        uphill: { "2.0%": 8750, "1.5%": 7900, "1.0%": 7250, "0.5%": 6700 },
        downhillShaded: { "-1%": 6100, "-2%": 5850 },
        downhillNonShaded: { "-1%": 6300, "-2%": 6300 }
    },
    {
        baseFieldLength: 6400,
        uphill: { "2.0%": 9200, "1.5%": 8250, "1.0%": 7500, "0.5%": 6950 },
        downhillShaded: { "-1%": 6300, "-2%": 6050 },
        downhillNonShaded: { "-1%": 6400, "-2%": 6450 }
    },
    {
        baseFieldLength: 6600,
        uphill: { "2.0%": 9650, "1.5%": 8600, "1.0%": 7800, "0.5%": 7150 },
        downhillShaded: { "-1%": 6500, "-2%": 6200 },
        downhillNonShaded: { "-1%": 6550, "-2%": 6550 }
    },
    {
        baseFieldLength: 6800,
        uphill: { "2.0%": 10100, "1.5%": 8950, "1.0%": 8050, "0.5%": 7400 },
        downhillShaded: { "-1%": 6650, "-2%": 6400 },
        downhillNonShaded: { "-1%": 6700, "-2%": 6700 }
    },
    {
        baseFieldLength: 7000,
        uphill: { "2.0%": 10550, "1.5%": 9300, "1.0%": 8350, "0.5%": 7650 },
        downhillShaded: { "-1%": 6850, "-2%": 6550 },
        downhillNonShaded: { "-1%": 6800, "-2%": 6850 }
    },
    {
        baseFieldLength: 7200,
        uphill: { "2.0%": 11050, "1.5%": 9600, "1.0%": 8650, "0.5%": 7850 },
        downhillShaded: { "-1%": 7050, "-2%": 6750 },
        downhillNonShaded: { "-1%": 6950, "-2%": 7000 }
    },
    {
        baseFieldLength: 7400,
        uphill: { "2.0%": 11550, "1.5%": 10000, "1.0%": 8900, "0.5%": 8100 },
        downhillShaded: { "-1%": 7200, "-2%": 6900 },
        downhillNonShaded: { "-1%": 7100, "-2%": 7100 }
    },
    {
        baseFieldLength: 7600,
        uphill: { "2.0%": 12150, "1.5%": 10400, "1.0%": 9200, "0.5%": 8350 },
        downhillShaded: { "-1%": 7400, "-2%": 7050 },
        downhillNonShaded: { "-1%": 7250, "-2%": 7200 }
    },
    {
        baseFieldLength: 7800,
        uphill: { "2.0%": 12700, "1.5%": 10800, "1.0%": 9500, "0.5%": 8600 },
        downhillShaded: { "-1%": 7550, "-2%": 7200 },
        downhillNonShaded: { "-1%": 7350, "-2%": 7300 }
    },
    {
        baseFieldLength: 8000,
        uphill: { "2.0%": 13250, "1.5%": 11200, "1.0%": 9800, "0.5%": 8850 },
        downhillShaded: { "-1%": 7750, "-2%": 7400 },
        downhillNonShaded: { "-1%": 7500, "-2%": 7400 }
    },
    {
        baseFieldLength: 8200,
        uphill: { "2.0%": 13950, "1.5%": 11650, "1.0%": 10150, "0.5%": 9100 },
        downhillShaded: { "-1%": 7900, "-2%": 7550 },
        downhillNonShaded: { "-1%": 7600, "-2%": 7500 }
    },
    {
        baseFieldLength: 8400,
        uphill: { "2.0%": 14600, "1.5%": 12050, "1.0%": 10450, "0.5%": 9300 },
        downhillShaded: { "-1%": 8100, "-2%": 7650 },
        downhillNonShaded: { "-1%": 7750, "-2%": 7550 }
    },
    {
        baseFieldLength: 8600,
        uphill: { "2.0%": 15100, "1.5%": 12400, "1.0%": 10700, "0.5%": 9550 },
        downhillShaded: { "-1%": 8250, "-2%": 7800 },
        downhillNonShaded: { "-1%": 7900, "-2%": 7600 }
    },
    {
        baseFieldLength: 8800,
        uphill: { "2.0%": null, "1.5%": 12750, "1.0%": 11000, "0.5%": 9750 },
        downhillShaded: { "-1%": 8400, "-2%": 7950 },
        downhillNonShaded: { "-1%": 8050, "-2%": 7650 }
    },
    {
        baseFieldLength: 9000,
        uphill: { "2.0%": null, "1.5%": 13100, "1.0%": 11250, "0.5%": 10000 },
        downhillShaded: { "-1%": 8600, "-2%": 8100 },
        downhillNonShaded: { "-1%": 8200, "-2%": 7750 }
    },
    {
        baseFieldLength: 9500,
        uphill: { "2.0%": null, "1.5%": 14050, "1.0%": 11950, "0.5%": 10600 },
        downhillShaded: { "-1%": 9000, "-2%": 8450 },
        downhillNonShaded: { "-1%": 8600, "-2%": 7950 }
    },
    {
        baseFieldLength: 10000,
        uphill: { "2.0%": null, "1.5%": 14850, "1.0%": 12650, "0.5%": 11150 },
        downhillShaded: { "-1%": 9450, "-2%": 8850 },
        downhillNonShaded: { "-1%": 9000, "-2%": 8250 }
    },
    {
        baseFieldLength: 10500,
        uphill: { "2.0%": null, "1.5%": 15650, "1.0%": 13250, "0.5%": 11700 },
        downhillShaded: { "-1%": 9850, "-2%": 9250 },
        downhillNonShaded: { "-1%": 9400, "-2%": 8600 }
    },
    {
        baseFieldLength: 11000,
        uphill: { "2.0%": null, "1.5%": null, "1.0%": 13900, "0.5%": 12250 },
        downhillShaded: { "-1%": 10350, "-2%": 9650 },
        downhillNonShaded: { "-1%": 9850, "-2%": 9000 }
    },
    {
        baseFieldLength: 12000,
        uphill: { "2.0%": null, "1.5%": null, "1.0%": 15500, "0.5%": 13550 },
        downhillShaded: { "-1%": 11150, "-2%": 10300 },
        downhillNonShaded: { "-1%": 10600, "-2%": 9650 }
    },
    {
        baseFieldLength: 13000,
        uphill: { "2.0%": null, "1.5%": null, "1.0%": null, "0.5%": 14700 },
        downhillShaded: { "-1%": 11900, "-2%": 10950 },
        downhillNonShaded: { "-1%": 11400, "-2%": 10300 }
    },
    {
        baseFieldLength: 14000,
        uphill: { "2.0%": null, "1.5%": null, "1.0%": null, "0.5%": 16000 },
        downhillShaded: { "-1%": 12750, "-2%": 11700 },
        downhillNonShaded: { "-1%": 12200, "-2%": 11000 }
    },
    {
        baseFieldLength: 15000,
        uphill: { "2.0%": null, "1.5%": null, "1.0%": null, "0.5%": null },
        downhillShaded: { "-1%": 13550, "-2%": 12400 },
        downhillNonShaded: { "-1%": 13000, "-2%": 11750 }
    }
];

const v1Adjustments_Dry_Flaps15_AntiIceOn = {
    uphill: { "2.0%": "V1 + 4", "1.5%": "V1 + 2", "1.0%": "V1 + 1", "0.5%": "V1 + 0" },
    downhillShaded: { "-1%": "V1 - 3", "-2%": "V1 - 5" },
    downhillNonShaded: { "-1%": "V1 + 1", "-2%": "V1 + 1" }
};

const takeoffFieldLengthGradient_Dry_Flaps15_AntiIceOn = [
    { baseFieldLength: 1600, uphill: { "2.0%": 1800, "1.5%": 1750, "1.0%": 1700, "0.5%": 1700 }, downhillShaded: { "-1%": 1600, "-2%": 1550 }, downhillNonShaded: { "-1%": 1650, "-2%": 1750 } },
    { baseFieldLength: 1800, uphill: { "2.0%": 2000, "1.5%": 1950, "1.0%": 1900, "0.5%": 1900 }, downhillShaded: { "-1%": 1800, "-2%": 1750 }, downhillNonShaded: { "-1%": 1900, "-2%": 1950 } },
    { baseFieldLength: 2000, uphill: { "2.0%": 2250, "1.5%": 2200, "1.0%": 2150, "0.5%": 2150 }, downhillShaded: { "-1%": 2050, "-2%": 1950 }, downhillNonShaded: { "-1%": 2150, "-2%": 2150 } },
    { baseFieldLength: 2200, uphill: { "2.0%": 2450, "1.5%": 2450, "1.0%": 2400, "0.5%": 2350 }, downhillShaded: { "-1%": 2200, "-2%": 2150 }, downhillNonShaded: { "-1%": 2350, "-2%": 2400 } },
    { baseFieldLength: 2400, uphill: { "2.0%": 2700, "1.5%": 2650, "1.0%": 2600, "0.5%": 2550 }, downhillShaded: { "-1%": 2400, "-2%": 2350 }, downhillNonShaded: { "-1%": 2550, "-2%": 2600 } },
    { baseFieldLength: 2600, uphill: { "2.0%": 2900, "1.5%": 2900, "1.0%": 2800, "0.5%": 2750 }, downhillShaded: { "-1%": 2600, "-2%": 2550 }, downhillNonShaded: { "-1%": 2750, "-2%": 2800 } },
    { baseFieldLength: 2800, uphill: { "2.0%": 3150, "1.5%": 3150, "1.0%": 3050, "0.5%": 2950 }, downhillShaded: { "-1%": 2800, "-2%": 2700 }, downhillNonShaded: { "-1%": 2950, "-2%": 2950 } },
    { baseFieldLength: 3000, uphill: { "2.0%": 3400, "1.5%": 3350, "1.0%": 3250, "0.5%": 3200 }, downhillShaded: { "-1%": 3000, "-2%": 2900 }, downhillNonShaded: { "-1%": 3150, "-2%": 3200 } },
    { baseFieldLength: 3200, uphill: { "2.0%": 3650, "1.5%": 3600, "1.0%": 3500, "0.5%": 3400 }, downhillShaded: { "-1%": 3200, "-2%": 3100 }, downhillNonShaded: { "-1%": 3350, "-2%": 3400 } },
    { baseFieldLength: 3400, uphill: { "2.0%": 3950, "1.5%": 3850, "1.0%": 3700, "0.5%": 3600 }, downhillShaded: { "-1%": 3400, "-2%": 3300 }, downhillNonShaded: { "-1%": 3600, "-2%": 3600 } },
    { baseFieldLength: 3600, uphill: { "2.0%": 4300, "1.5%": 4100, "1.0%": 3950, "0.5%": 3850 }, downhillShaded: { "-1%": 3600, "-2%": 3450 }, downhillNonShaded: { "-1%": 3800, "-2%": 3850 } },
    { baseFieldLength: 3800, uphill: { "2.0%": 4650, "1.5%": 4400, "1.0%": 4200, "0.5%": 4050 }, downhillShaded: { "-1%": 3750, "-2%": 3650 }, downhillNonShaded: { "-1%": 4000, "-2%": 4050 } },
    { baseFieldLength: 4000, uphill: { "2.0%": 5100, "1.5%": 4750, "1.0%": 4500, "0.5%": 4250 }, downhillShaded: { "-1%": 3950, "-2%": 3800 }, downhillNonShaded: { "-1%": 4200, "-2%": 4250 } },
    { baseFieldLength: 4200, uphill: { "2.0%": 5400, "1.5%": 5050, "1.0%": 4750, "0.5%": 4500 }, downhillShaded: { "-1%": 4100, "-2%": 4000 }, downhillNonShaded: { "-1%": 4400, "-2%": 4450 } },
    { baseFieldLength: 4400, uphill: { "2.0%": 5800, "1.5%": 5350, "1.0%": 5000, "0.5%": 4700 }, downhillShaded: { "-1%": 4350, "-2%": 4200 }, downhillNonShaded: { "-1%": 4600, "-2%": 4650 } },
    { baseFieldLength: 4600, uphill: { "2.0%": 6200, "1.5%": 5650, "1.0%": 5250, "0.5%": 4950 }, downhillShaded: { "-1%": 4550, "-2%": 4350 }, downhillNonShaded: { "-1%": 4800, "-2%": 4800 } },
    { baseFieldLength: 4800, uphill: { "2.0%": 6550, "1.5%": 6000, "1.0%": 5550, "0.5%": 5150 }, downhillShaded: { "-1%": 4700, "-2%": 4550 }, downhillNonShaded: { "-1%": 5000, "-2%": 5000 } },
    { baseFieldLength: 5000, uphill: { "2.0%": 6900, "1.5%": 6300, "1.0%": 5800, "0.5%": 5400 }, downhillShaded: { "-1%": 4900, "-2%": 4700 }, downhillNonShaded: { "-1%": 5200, "-2%": 5200 } },
    { baseFieldLength: 5200, uphill: { "2.0%": 7350, "1.5%": 6600, "1.0%": 6050, "0.5%": 5600 }, downhillShaded: { "-1%": 5100, "-2%": 4900 }, downhillNonShaded: { "-1%": 5400, "-2%": 5400 } },
    { baseFieldLength: 5400, uphill: { "2.0%": 7750, "1.5%": 6900, "1.0%": 6300, "0.5%": 5850 }, downhillShaded: { "-1%": 5250, "-2%": 5050 }, downhillNonShaded: { "-1%": 5550, "-2%": 5600 } },
    { baseFieldLength: 5600, uphill: { "2.0%": 8150, "1.5%": 7250, "1.0%": 6600, "0.5%": 6050 }, downhillShaded: { "-1%": 5450, "-2%": 5250 }, downhillNonShaded: { "-1%": 5800, "-2%": 5800 } },
    { baseFieldLength: 5800, uphill: { "2.0%": 8550, "1.5%": 7550, "1.0%": 6900, "0.5%": 6300 }, downhillShaded: { "-1%": 5600, "-2%": 5400 }, downhillNonShaded: { "-1%": 6000, "-2%": 6000 } },
    { baseFieldLength: 6000, uphill: { "2.0%": 8900, "1.5%": 7800, "1.0%": 7050, "0.5%": 6450 }, downhillShaded: { "-1%": 5850, "-2%": 5600 }, downhillNonShaded: { "-1%": 6200, "-2%": 6200 } },
    { baseFieldLength: 6200, uphill: { "2.0%": 9300, "1.5%": 8100, "1.0%": 7350, "0.5%": 6700 }, downhillShaded: { "-1%": 6000, "-2%": 5750 }, downhillNonShaded: { "-1%": 6400, "-2%": 6400 } },
    { baseFieldLength: 6400, uphill: { "2.0%": 9750, "1.5%": 8450, "1.0%": 7600, "0.5%": 6950 }, downhillShaded: { "-1%": 6250, "-2%": 5950 }, downhillNonShaded: { "-1%": 6600, "-2%": 6600 } },
    { baseFieldLength: 6600, uphill: { "2.0%": 10300, "1.5%": 8850, "1.0%": 7900, "0.5%": 7200 }, downhillShaded: { "-1%": 6400, "-2%": 6100 }, downhillNonShaded: { "-1%": 6800, "-2%": 6800 } },
    { baseFieldLength: 6800, uphill: { "2.0%": 11050, "1.5%": 9350, "1.0%": 8250, "0.5%": 7450 }, downhillShaded: { "-1%": 6600, "-2%": 6250 }, downhillNonShaded: { "-1%": 7000, "-2%": 7000 } },
    { baseFieldLength: 7000, uphill: { "2.0%": 11450, "1.5%": 9650, "1.0%": 8500, "0.5%": 7650 }, downhillShaded: { "-1%": 6750, "-2%": 6450 }, downhillNonShaded: { "-1%": 7200, "-2%": 7200 } },
    { baseFieldLength: 7200, uphill: { "2.0%": 11850, "1.5%": 9950, "1.0%": 8750, "0.5%": 7900 }, downhillShaded: { "-1%": 6950, "-2%": 6600 }, downhillNonShaded: { "-1%": 7400, "-2%": 7400 } },
    { baseFieldLength: 7400, uphill: { "2.0%": 12250, "1.5%": 10250, "1.0%": 9000, "0.5%": 8100 }, downhillShaded: { "-1%": 7100, "-2%": 6800 }, downhillNonShaded: { "-1%": 7600, "-2%": 7600 } },
    { baseFieldLength: 7600, uphill: { "2.0%": 12700, "1.5%": 10550, "1.0%": 9250, "0.5%": 8300 }, downhillShaded: { "-1%": 7300, "-2%": 6950 }, downhillNonShaded: { "-1%": 7750, "-2%": 7750 } },
    { baseFieldLength: 7800, uphill: { "2.0%": 13150, "1.5%": 10850, "1.0%": 9500, "0.5%": 8550 }, downhillShaded: { "-1%": 7450, "-2%": 7050 }, downhillNonShaded: { "-1%": 7850, "-2%": 7900 } },
    { baseFieldLength: 8000, uphill: { "2.0%": 13600, "1.5%": 11150, "1.0%": 9750, "0.5%": 8750 }, downhillShaded: { "-1%": 7650, "-2%": 7200 }, downhillNonShaded: { "-1%": 7950, "-2%": 8000 } },
    { baseFieldLength: 8200, uphill: { "2.0%": 13950, "1.5%": 11400, "1.0%": 10000, "0.5%": 8950 }, downhillShaded: { "-1%": 7800, "-2%": 7350 }, downhillNonShaded: { "-1%": 8050, "-2%": 8100 } },
    { baseFieldLength: 8400, uphill: { "2.0%": 14200, "1.5%": 11600, "1.0%": 10200, "0.5%": 9200 }, downhillShaded: { "-1%": 8000, "-2%": 7500 }, downhillNonShaded: { "-1%": 8150, "-2%": 8150 } },
    { baseFieldLength: 8600, uphill: { "2.0%": 14500, "1.5%": 11900, "1.0%": 10450, "0.5%": 9400 }, downhillShaded: { "-1%": 8150, "-2%": 7650 }, downhillNonShaded: { "-1%": 8200, "-2%": 8250 } },
    { baseFieldLength: 8800, uphill: { "2.0%": 14800, "1.5%": 12150, "1.0%": 10700, "0.5%": 9650 }, downhillShaded: { "-1%": 8300, "-2%": 7700 }, downhillNonShaded: { "-1%": 8250, "-2%": 8350 } },
    { baseFieldLength: 9000, uphill: { "2.0%": 15050, "1.5%": 12450, "1.0%": 10950, "0.5%": 9900 }, downhillShaded: { "-1%": 8450, "-2%": 7900 }, downhillNonShaded: { "-1%": 8350, "-2%": 8400 } },
    { baseFieldLength: 9500, uphill: { "2.0%": null, "1.5%": 13400, "1.0%": 11600, "0.5%": 10450 }, downhillShaded: { "-1%": 8900, "-2%": 8250 }, downhillNonShaded: { "-1%": 8550, "-2%": 8550 } },
    { baseFieldLength: 10000, uphill: { "2.0%": null, "1.5%": 14500, "1.0%": 12400, "0.5%": 11000 }, downhillShaded: { "-1%": 9300, "-2%": 8600 }, downhillNonShaded: { "-1%": 8850, "-2%": 8650 } },
    { baseFieldLength: 10500, uphill: { "2.0%": null, "1.5%": 15800, "1.0%": 13250, "0.5%": 11700 }, downhillShaded: { "-1%": 9700, "-2%": 8950 }, downhillNonShaded: { "-1%": 9250, "-2%": 8750 } },
    { baseFieldLength: 11000, uphill: { "2.0%": null, "1.5%": null, "1.0%": 14200, "0.5%": 12250 }, downhillShaded: { "-1%": 10050, "-2%": 9250 }, downhillNonShaded: { "-1%": 9650, "-2%": 8950 } },
    { baseFieldLength: 12000, uphill: { "2.0%": null, "1.5%": null, "1.0%": 15850, "0.5%": 13400 }, downhillShaded: { "-1%": 10900, "-2%": 9900 }, downhillNonShaded: { "-1%": 10350, "-2%": 9650 } },
    { baseFieldLength: 13000, uphill: { "2.0%": null, "1.5%": null, "1.0%": null, "0.5%": 14600 }, downhillShaded: { "-1%": 11700, "-2%": 10600 }, downhillNonShaded: { "-1%": 11000, "-2%": 10500 } },
    { baseFieldLength: 14000, uphill: { "2.0%": null, "1.5%": null, "1.0%": null, "0.5%": 15750 }, downhillShaded: { "-1%": 12500, "-2%": 11250 }, downhillNonShaded: { "-1%": 11700, "-2%": 11500 } },
    { baseFieldLength: 15000, uphill: { "2.0%": null, "1.5%": null, "1.0%": null, "0.5%": null }, downhillShaded: { "-1%": 13250, "-2%": 11900 }, downhillNonShaded: { "-1%": 12400, "-2%": 12500 } }
];

// Takeoff field length and V1 adjustment for Flaps 15, anti-ice OFF.
const v1Adjustments_Dry_Flaps15_AntiIceOff = {
    uphill: { "2.0%": "V1 + 2", "1.5%": "V1 + 0", "1.0%": "V1 + 0", "0.5%": "V1 + 0" },
    downhillShaded: { "-1%": "V1 - 3", "-2%": "V1 - 5" },
    downhillNonShaded: { "-1%": "V1 + 1", "-2%": "V1 + 1" }
};

const takeoffFieldLengthGradient_Dry_Flaps15_AntiIceOff = [
    { baseFieldLength: 1600, uphill: { "2.0%": 1750, "1.5%": 1750, "1.0%": 1650, "0.5%": 1650 }, downhillShaded: { "-1%": 1600, "-2%": 1550 }, downhillNonShaded: { "-1%": 1700, "-2%": 1700 } },
    { baseFieldLength: 1800, uphill: { "2.0%": 2000, "1.5%": 2000, "1.0%": 1950, "0.5%": 1900 }, downhillShaded: { "-1%": 1800, "-2%": 1750 }, downhillNonShaded: { "-1%": 1900, "-2%": 1950 } },
    { baseFieldLength: 2000, uphill: { "2.0%": 2300, "1.5%": 2300, "1.0%": 2250, "0.5%": 2150 }, downhillShaded: { "-1%": 2050, "-2%": 1950 }, downhillNonShaded: { "-1%": 2150, "-2%": 2150 } },
    { baseFieldLength: 2200, uphill: { "2.0%": 2550, "1.5%": 2500, "1.0%": 2450, "0.5%": 2350 }, downhillShaded: { "-1%": 2250, "-2%": 2150 }, downhillNonShaded: { "-1%": 2350, "-2%": 2400 } },
    { baseFieldLength: 2400, uphill: { "2.0%": 2800, "1.5%": 2750, "1.0%": 2650, "0.5%": 2550 }, downhillShaded: { "-1%": 2400, "-2%": 2350 }, downhillNonShaded: { "-1%": 2550, "-2%": 2600 } },
    { baseFieldLength: 2600, uphill: { "2.0%": 3100, "1.5%": 3050, "1.0%": 2900, "0.5%": 2750 }, downhillShaded: { "-1%": 2600, "-2%": 2550 }, downhillNonShaded: { "-1%": 2800, "-2%": 2800 } },
    { baseFieldLength: 2800, uphill: { "2.0%": 3400, "1.5%": 3300, "1.0%": 3150, "0.5%": 3000 }, downhillShaded: { "-1%": 2800, "-2%": 2750 }, downhillNonShaded: { "-1%": 3000, "-2%": 3000 } },
    { baseFieldLength: 3000, uphill: { "2.0%": 3750, "1.5%": 3600, "1.0%": 3400, "0.5%": 3200 }, downhillShaded: { "-1%": 3000, "-2%": 2900 }, downhillNonShaded: { "-1%": 3200, "-2%": 3200 } },
    { baseFieldLength: 3200, uphill: { "2.0%": 4150, "1.5%": 3900, "1.0%": 3650, "0.5%": 3450 }, downhillShaded: { "-1%": 3200, "-2%": 3100 }, downhillNonShaded: { "-1%": 3400, "-2%": 3450 } },
    { baseFieldLength: 3400, uphill: { "2.0%": 4550, "1.5%": 4200, "1.0%": 3900, "0.5%": 3650 }, downhillShaded: { "-1%": 3400, "-2%": 3300 }, downhillNonShaded: { "-1%": 3600, "-2%": 3650 } },
    { baseFieldLength: 3600, uphill: { "2.0%": 4850, "1.5%": 4450, "1.0%": 4150, "0.5%": 3850 }, downhillShaded: { "-1%": 3600, "-2%": 3450 }, downhillNonShaded: { "-1%": 3800, "-2%": 3850 } },
    { baseFieldLength: 3800, uphill: { "2.0%": 5250, "1.5%": 4750, "1.0%": 4400, "0.5%": 4100 }, downhillShaded: { "-1%": 3750, "-2%": 3650 }, downhillNonShaded: { "-1%": 4000, "-2%": 4050 } },
    { baseFieldLength: 4000, uphill: { "2.0%": 5650, "1.5%": 5100, "1.0%": 4650, "0.5%": 4350 }, downhillShaded: { "-1%": 3950, "-2%": 3800 }, downhillNonShaded: { "-1%": 4200, "-2%": 4250 } },
    { baseFieldLength: 4200, uphill: { "2.0%": 6100, "1.5%": 5450, "1.0%": 4950, "0.5%": 4600 }, downhillShaded: { "-1%": 4150, "-2%": 4000 }, downhillNonShaded: { "-1%": 4400, "-2%": 4450 } },
    { baseFieldLength: 4400, uphill: { "2.0%": 6550, "1.5%": 5750, "1.0%": 5200, "0.5%": 4800 }, downhillShaded: { "-1%": 4350, "-2%": 4200 }, downhillNonShaded: { "-1%": 4600, "-2%": 4650 } },
    { baseFieldLength: 4600, uphill: { "2.0%": 6950, "1.5%": 6100, "1.0%": 5500, "0.5%": 5050 }, downhillShaded: { "-1%": 4550, "-2%": 4350 }, downhillNonShaded: { "-1%": 4800, "-2%": 4850 } },
    { baseFieldLength: 4800, uphill: { "2.0%": 7300, "1.5%": 6400, "1.0%": 5750, "0.5%": 5250 }, downhillShaded: { "-1%": 4700, "-2%": 4550 }, downhillNonShaded: { "-1%": 5000, "-2%": 5050 } },
    { baseFieldLength: 5000, uphill: { "2.0%": 7650, "1.5%": 6650, "1.0%": 6000, "0.5%": 5450 }, downhillShaded: { "-1%": 4900, "-2%": 4750 }, downhillNonShaded: { "-1%": 5200, "-2%": 5250 } },
    { baseFieldLength: 5200, uphill: { "2.0%": 8050, "1.5%": 6950, "1.0%": 6250, "0.5%": 5700 }, downhillShaded: { "-1%": 5100, "-2%": 4900 }, downhillNonShaded: { "-1%": 5400, "-2%": 5450 } },
    { baseFieldLength: 5400, uphill: { "2.0%": 8450, "1.5%": 7300, "1.0%": 6500, "0.5%": 5900 }, downhillShaded: { "-1%": 5300, "-2%": 5050 }, downhillNonShaded: { "-1%": 5600, "-2%": 5600 } },
    { baseFieldLength: 5600, uphill: { "2.0%": 8850, "1.5%": 7600, "1.0%": 6750, "0.5%": 6150 }, downhillShaded: { "-1%": 5500, "-2%": 5250 }, downhillNonShaded: { "-1%": 5800, "-2%": 5800 } },
    { baseFieldLength: 5800, uphill: { "2.0%": 9400, "1.5%": 7950, "1.0%": 7050, "0.5%": 6400 }, downhillShaded: { "-1%": 5650, "-2%": 5400 }, downhillNonShaded: { "-1%": 6000, "-2%": 6000 } },
    { baseFieldLength: 6000, uphill: { "2.0%": 9800, "1.5%": 8250, "1.0%": 7300, "0.5%": 6600 }, downhillShaded: { "-1%": 5850, "-2%": 5600 }, downhillNonShaded: { "-1%": 6200, "-2%": 6200 } },
    { baseFieldLength: 6200, uphill: { "2.0%": 10200, "1.5%": 8550, "1.0%": 7550, "0.5%": 6800 }, downhillShaded: { "-1%": 6050, "-2%": 5750 }, downhillNonShaded: { "-1%": 6400, "-2%": 6400 } },
    { baseFieldLength: 6400, uphill: { "2.0%": 10600, "1.5%": 8850, "1.0%": 7750, "0.5%": 7000 }, downhillShaded: { "-1%": 6200, "-2%": 5900 }, downhillNonShaded: { "-1%": 6600, "-2%": 6600 } },
    { baseFieldLength: 6600, uphill: { "2.0%": 10950, "1.5%": 9150, "1.0%": 8000, "0.5%": 7250 }, downhillShaded: { "-1%": 6400, "-2%": 6100 }, downhillNonShaded: { "-1%": 6800, "-2%": 6800 } },
    { baseFieldLength: 6800, uphill: { "2.0%": 11400, "1.5%": 9500, "1.0%": 8300, "0.5%": 7450 }, downhillShaded: { "-1%": 6600, "-2%": 6250 }, downhillNonShaded: { "-1%": 7000, "-2%": 7000 } },
    { baseFieldLength: 7000, uphill: { "2.0%": 11900, "1.5%": 9850, "1.0%": 8600, "0.5%": 7700 }, downhillShaded: { "-1%": 6750, "-2%": 6450 }, downhillNonShaded: { "-1%": 7200, "-2%": 7200 } },
    { baseFieldLength: 7200, uphill: { "2.0%": 12600, "1.5%": 10250, "1.0%": 8900, "0.5%": 7950 }, downhillShaded: { "-1%": 6950, "-2%": 6600 }, downhillNonShaded: { "-1%": 7400, "-2%": 7400 } },
    { baseFieldLength: 7400, uphill: { "2.0%": 13150, "1.5%": 10650, "1.0%": 9200, "0.5%": 8200 }, downhillShaded: { "-1%": 7100, "-2%": 6800 }, downhillNonShaded: { "-1%": 7600, "-2%": 7600 } },
    { baseFieldLength: 7600, uphill: { "2.0%": 13550, "1.5%": 10900, "1.0%": 9400, "0.5%": 8400 }, downhillShaded: { "-1%": 7300, "-2%": 6950 }, downhillNonShaded: { "-1%": 7750, "-2%": 7800 } },
    { baseFieldLength: 7800, uphill: { "2.0%": 13900, "1.5%": 11200, "1.0%": 9650, "0.5%": 8600 }, downhillShaded: { "-1%": 7450, "-2%": 7150 }, downhillNonShaded: { "-1%": 7900, "-2%": 7950 } },
    { baseFieldLength: 8000, uphill: { "2.0%": 14400, "1.5%": 11550, "1.0%": 9950, "0.5%": 8800 }, downhillShaded: { "-1%": 7650, "-2%": 7300 }, downhillNonShaded: { "-1%": 8000, "-2%": 8050 } },
    { baseFieldLength: 8200, uphill: { "2.0%": 14900, "1.5%": 11900, "1.0%": 10250, "0.5%": 9050 }, downhillShaded: { "-1%": 7800, "-2%": 7450 }, downhillNonShaded: { "-1%": 8100, "-2%": 8150 } },
    { baseFieldLength: 8400, uphill: { "2.0%": 15450, "1.5%": 12350, "1.0%": 10550, "0.5%": 9350 }, downhillShaded: { "-1%": 7950, "-2%": 7550 }, downhillNonShaded: { "-1%": 8200, "-2%": 8200 } },
    { baseFieldLength: 8600, uphill: { "2.0%": null, "1.5%": 12800, "1.0%": 10850, "0.5%": 9600 }, downhillShaded: { "-1%": 8150, "-2%": 7700 }, downhillNonShaded: { "-1%": 8250, "-2%": 8250 } },
    { baseFieldLength: 8800, uphill: { "2.0%": null, "1.5%": 13250, "1.0%": 11200, "0.5%": 9850 }, downhillShaded: { "-1%": 8300, "-2%": 7850 }, downhillNonShaded: { "-1%": 8350, "-2%": 8300 } },
    { baseFieldLength: 9000, uphill: { "2.0%": null, "1.5%": 13550, "1.0%": 11450, "0.5%": 10050 }, downhillShaded: { "-1%": 8500, "-2%": 8000 }, downhillNonShaded: { "-1%": 8400, "-2%": 8350 } },
    { baseFieldLength: 9500, uphill: { "2.0%": null, "1.5%": 14250, "1.0%": 12050, "0.5%": 10600 }, downhillShaded: { "-1%": 8900, "-2%": 8300 }, downhillNonShaded: { "-1%": 8600, "-2%": 8500 } },
    { baseFieldLength: 10000, uphill: { "2.0%": null, "1.5%": 15000, "1.0%": 12650, "0.5%": 11150 }, downhillShaded: { "-1%": 9300, "-2%": 8650 }, downhillNonShaded: { "-1%": 8950, "-2%": 8650 } },
    { baseFieldLength: 10500, uphill: { "2.0%": null, "1.5%": null, "1.0%": 13250, "0.5%": 11700 }, downhillShaded: { "-1%": 9700, "-2%": 9000 }, downhillNonShaded: { "-1%": 9300, "-2%": 8800 } },
    { baseFieldLength: 11000, uphill: { "2.0%": null, "1.5%": null, "1.0%": 13950, "0.5%": 12200 }, downhillShaded: { "-1%": 10100, "-2%": 9350 }, downhillNonShaded: { "-1%": 9750, "-2%": 9000 } },
    { baseFieldLength: 12000, uphill: { "2.0%": null, "1.5%": null, "1.0%": 15050, "0.5%": 13400 }, downhillShaded: { "-1%": 11100, "-2%": 10100 }, downhillNonShaded: { "-1%": 10600, "-2%": 9550 } },
    { baseFieldLength: 13000, uphill: { "2.0%": null, "1.5%": null, "1.0%": null, "0.5%": 14500 }, downhillShaded: { "-1%": 11950, "-2%": 10850 }, downhillNonShaded: { "-1%": 11450, "-2%": 10200 } },
    { baseFieldLength: 14000, uphill: { "2.0%": null, "1.5%": null, "1.0%": null, "0.5%": 15650 }, downhillShaded: { "-1%": 12800, "-2%": 11550 }, downhillNonShaded: { "-1%": 12350, "-2%": 11000 } },
    { baseFieldLength: 15000, uphill: { "2.0%": null, "1.5%": null, "1.0%": null, "0.5%": null }, downhillShaded: { "-1%": 13650, "-2%": 12300 }, downhillNonShaded: { "-1%": 13250, "-2%": 12000 } }
];

