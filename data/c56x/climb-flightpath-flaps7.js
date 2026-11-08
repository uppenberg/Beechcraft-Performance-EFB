/* Not used
const singleEngineFlightPath_Flaps7 = [
    {
        height: 50,
        gradients: { 15: 280, 14: 300, 13: 330, 12: 360, 11: 410, 10: 460, 9: 520, 8: 610, 7: 740, 6: 940, 5: 1270, 4: 1970, 3: 3410 }
    },
    {
        height: 100,
        gradients: { 15: 680, 14: 730, 13: 800, 12: 880, 11: 980, 10: 1110, 9: 1270, 8: 1490, 7: 1800, 6: 2280, 5: 3070, 4: 3820, 3: 5080 }
    },
    {
        height: 150,
        gradients: { 15: 1070, 14: 1170, 13: 1270, 12: 1400, 11: 1560, 10: 1760, 9: 2020, 8: 2370, 7: 2860, 6: 3400, 5: 4070, 4: 5070, 3: 6740 }
    },
    {
        height: 200,
        gradients: { 15: 1470, 14: 1600, 13: 1750, 12: 1920, 11: 2140, 10: 2420, 9: 2770, 8: 3190, 7: 3640, 6: 4230, 5: 5070, 4: 6320, 3: 8410 }
    },
    {
        height: 250,
        gradients: { 15: 1870, 14: 2030, 13: 2220, 12: 2440, 11: 2720, 10: 3060, 9: 3400, 8: 3810, 7: 4350, 6: 5070, 5: 6070, 4: 7570, 3: 10080 }
    },
    {
        height: 300,
        gradients: { 15: 2270, 14: 2460, 13: 2690, 12: 2960, 11: 3240, 10: 3560, 9: 3950, 8: 4440, 7: 5070, 6: 5900, 5: 7070, 4: 8820, 3: 11740 }
    },
    {
        height: 350,
        gradients: { 15: 2670, 14: 2890, 13: 3140, 12: 3390, 11: 3700, 10: 4060, 9: 4510, 8: 5060, 7: 5780, 6: 6730, 5: 8070, 4: 10070, 3: 13410 }
    },
    {
        height: 400,
        gradients: { 15: 3060, 14: 3270, 13: 3520, 12: 3810, 11: 4150, 10: 4560, 9: 5060, 8: 5690, 7: 6490, 6: 7570, 5: 9070, 4: 11320, 3: 15080 }
    },
    {
        height: 450,
        gradients: { 15: 3390, 14: 3630, 13: 3910, 12: 4230, 11: 4610, 10: 5060, 9: 5620, 8: 6310, 7: 7210, 6: 8400, 5: 10070, 4: 12570, 3: 16740 }
    },
    {
        height: 500,
        gradients: { 15: 3730, 14: 3990, 13: 4290, 12: 4640, 11: 5060, 10: 5560, 9: 6170, 8: 6940, 7: 7920, 6: 9230, 5: 11070, 4: 13820, 3: 18410 }
    },
    {
        height: 550,
        gradients: { 15: 4060, 14: 4350, 13: 4680, 12: 5060, 11: 5520, 10: 6060, 9: 6730, 8: 7560, 7: 8640, 6: 10070, 5: 12070, 4: 15070, 3: 20080 }
    },
    {
        height: 600,
        gradients: { 15: 4390, 14: 4700, 13: 5060, 12: 5480, 11: 5970, 10: 6560, 9: 7290, 8: 8190, 7: 9350, 6: 10900, 5: 13070, 4: 16320, 3: 21740 }
    },
    {
        height: 650,
        gradients: { 15: 4730, 14: 5060, 13: 5440, 12: 5890, 11: 6430, 10: 7060, 9: 7840, 8: 8810, 7: 10070, 6: 11730, 5: 14070, 4: 17570, 3: 23410 }
    },
    {
        height: 700,
        gradients: { 15: 5060, 14: 5420, 13: 5830, 12: 6310, 11: 6880, 10: 7560, 9: 8400, 8: 9440, 7: 10780, 6: 12570, 5: 15070, 4: 18820, 3: 25080 }
    },
    {
        height: 750,
        gradients: { 15: 5390, 14: 5770, 13: 6210, 12: 6730, 11: 7330, 10: 8060, 9: 8950, 8: 10060, 7: 11490, 6: 13400, 5: 16070, 4: 20070, 3: 26740 }
    },
    {
        height: 800,
        gradients: { 15: 5730, 14: 6130, 13: 6600, 12: 7140, 11: 7790, 10: 8560, 9: 9510, 8: 10690, 7: 12210, 6: 14230, 5: 17070, 4: 21320, 3: 28410 }
    },
    {
        height: 850,
        gradients: { 15: 6060, 14: 6490, 13: 6980, 12: 7560, 11: 8240, 10: 9060, 9: 10060, 8: 11310, 7: 12920, 6: 15070, 5: 18070, 4: 22570, 3: 30080 }
    },
    {
        height: 900,
        gradients: { 15: 6390, 14: 6850, 13: 7370, 12: 7980, 11: 8700, 10: 9560, 9: 10620, 8: 11940, 7: 13640, 6: 15900, 5: 19070, 4: 23820, 3: 31740 }
    },
    {
        height: 950,
        gradients: { 15: 6730, 14: 7200, 13: 7750, 12: 8390, 11: 9150, 10: 10060, 9: 11170, 8: 12560, 7: 14350, 6: 16730, 5: 20070, 4: 25070, 3: 33410 }
    },
    {
        height: 1000,
        gradients: { 15: 7060, 14: 7560, 13: 8140, 12: 8810, 11: 9610, 10: 10560, 9: 11730, 8: 13190, 7: 15070, 6: 17570, 5: 21070, 4: 26320, 3: 35080 }
    },
    {
        height: 1050,
        gradients: { 15: 7390, 14: 7920, 13: 8520, 12: 9230, 11: 10060, 10: 11060, 9: 12290, 8: 13810, 7: 15780, 6: 18400, 5: 22070, 4: 27570, 3: 36740 }
    },
    {
        height: 1100,
        gradients: { 15: 7730, 14: 8270, 13: 8910, 12: 9640, 11: 10520, 10: 11560, 9: 12840, 8: 14440, 7: 16490, 6: 19230, 5: 23070, 4: 28820, 3: 38410 }
    },
    {
        height: 1150,
        gradients: { 15: 8060, 14: 8630, 13: 9290, 12: 10060, 11: 10970, 10: 12060, 9: 13400, 8: 15060, 7: 17210, 6: 20070, 5: 24070, 4: 30070, 3: 40080 }
    },
    {
        height: 1200,
        gradients: { 15: 8390, 14: 8990, 13: 9680, 12: 10480, 11: 11430, 10: 12560, 9: 13950, 8: 15690, 7: 17920, 6: 20900, 5: 25070, 4: 31320, 3: 41740 }
    },
    {
        height: 1250,
        gradients: { 15: 8730, 14: 9350, 13: 10060, 12: 10890, 11: 11880, 10: 13060, 9: 14510, 8: 16310, 7: 18640, 6: 21730, 5: 26070, 4: 32570, 3: 43410 }
    },
    {
        height: 1300,
        gradients: { 15: 9060, 14: 9700, 13: 10440, 12: 11310, 11: 12330, 10: 13560, 9: 15060, 8: 16940, 7: 19350, 6: 22570, 5: 27070, 4: 33820, 3: 45080 }
    },
    {
        height: 1350,
        gradients: { 15: 9390, 14: 10060, 13: 10830, 12: 11730, 11: 12790, 10: 14060, 9: 15620, 8: 17560, 7: 20070, 6: 23400, 5: 28070, 4: 35070, 3: 46740 }
    },
    {
        height: 1400,
        gradients: { 15: 9730, 14: 10420, 13: 11210, 12: 12140, 11: 13240, 10: 14560, 9: 16170, 8: 18190, 7: 20780, 6: 24230, 5: 29070, 4: 36320, 3: 48410 }
    },
    {
        height: 1450,
        gradients: { 15: 10060, 14: 10770, 13: 11600, 12: 12560, 11: 13700, 10: 15060, 9: 16730, 8: 18810, 7: 21490, 6: 25070, 5: 30070, 4: 37570, 3: 50080 }
    },
    {
        height: 1500,
        gradients: { 15: 10390, 14: 11130, 13: 11980, 12: 12980, 11: 14150, 10: 15560, 9: 17290, 8: 19440, 7: 22210, 6: 25900, 5: 31070, 4: 38820, 3: 51740 }
    }
];

const singleEngineFlightPathDistances_SeaLevel_anti_ice_on = [
    {
        weight: 20000,
        data: [
            { temp: -54, tailwind10: { first: 2315, second: 28098, third: 35259, tci: 2270 }, zeroWind: { first: 2037, second: 24316, third: 29970, tci: 2230 }, headwind10: { first: 1944, second: 23085, third: 28315, tci: 2220 }, headwind30: { first: 1758, second: 20566, third: 25097, tci: 2200 } },
            { temp: -35, tailwind10: { first: 2401, second: 27792, third: 35471, tci: 2090 }, zeroWind: { first: 2123, second: 24188, third: 30304, tci: 2050 }, headwind10: { first: 2030, second: 23013, third: 28687, tci: 2040 }, headwind30: { first: 1845, second: 20703, third: 25430, tci: 2020 } },
            { temp: -30, tailwind10: { first: 2423, second: 27711, third: 35454, tci: 2040 }, zeroWind: { first: 2145, second: 24151, third: 30321, tci: 2010 }, headwind10: { first: 2052, second: 22990, third: 28717, tci: 2000 }, headwind30: { first: 1867, second: 20706, third: 25596, tci: 1980 } },
            { temp: -25, tailwind10: { first: 2445, second: 27636, third: 35585, tci: 2000 }, zeroWind: { first: 2167, second: 24118, third: 30473, tci: 1970 }, headwind10: { first: 2074, second: 22971, third: 28751, tci: 1960 }, headwind30: { first: 1889, second: 20713, third: 25650, tci: 1940 } },
            { temp: -20, tailwind10: { first: 2467, second: 27573, third: 35585, tci: 1960 }, zeroWind: { first: 2189, second: 24094, third: 30504, tci: 1930 }, headwind10: { first: 2096, second: 22959, third: 28917, tci: 1920 }, headwind30: { first: 1910, second: 20725, third: 25710, tci: 1900 } },
            { temp: -15, tailwind10: { first: 2489, second: 27512, third: 35586, tci: 1920 }, zeroWind: { first: 2210, second: 24070, third: 30536, tci: 1890 }, headwind10: { first: 2118, second: 22948, third: 28958, tci: 1880 }, headwind30: { first: 1932, second: 20737, third: 25888, tci: 1860 } },
            { temp: -10, tailwind10: { first: 2510, second: 27443, third: 35724, tci: 1880 }, zeroWind: { first: 2232, second: 24039, third: 30692, tci: 1850 }, headwind10: { first: 2139, second: 22929, third: 29120, tci: 1840 }, headwind30: { first: 1953, second: 20742, third: 25940, tci: 1830 } },
            { temp: -5,  tailwind10: { first: 2531, second: 27372, third: 35717, tci: 1850 }, zeroWind: { first: 2253, second: 24006, third: 30713, tci: 1820 }, headwind10: { first: 2160, second: 22907, third: 29151, tci: 1810 }, headwind30: { first: 1974, second: 20744, third: 26110, tci: 1790 } },
            { temp: 0,   tailwind10: { first: 2552, second: 27312, third: 35718, tci: 1810 }, zeroWind: { first: 2274, second: 23981, third: 30876, tci: 1790 }, headwind10: { first: 2181, second: 22894, third: 29189, tci: 1780 }, headwind30: { first: 1995, second: 20752, third: 26166, tci: 1760 } },
            { temp: 5,   tailwind10: { first: 2573, second: 27274, third: 35889, tci: 1780 }, zeroWind: { first: 2294, second: 23974, third: 30926, tci: 1750 }, headwind10: { first: 2201, second: 22897, third: 29376, tci: 1740 }, headwind30: { first: 2016, second: 20775, third: 26236, tci: 1730 } },
            { temp: 10,  tailwind10: { first: 2593, second: 27446, third: 36398, tci: 1750 }, zeroWind: { first: 2315, second: 24143, third: 31401, tci: 1720 }, headwind10: { first: 2222, second: 23065, third: 29842, tci: 1710 }, headwind30: { first: 2036, second: 20942, third: 26680, tci: 1700 } }
        ]
    },
    {
        weight: 19500,
        data: [
            { temp: -54, tailwind10: { first: 2293, second: 26285, third: 33298, tci: 2250 }, zeroWind: { first: 2015, second: 22738, third: 28258, tci: 2220 }, headwind10: { first: 1922, second: 21582, third: 26683, tci: 2200 }, headwind30: { first: 1736, second: 19308, third: 23519, tci: 2180 } },
            { temp: -35, tailwind10: { first: 2377, second: 26006, third: 33531, tci: 2070 }, zeroWind: { first: 2098, second: 22624, third: 28600, tci: 2040 }, headwind10: { first: 2006, second: 21521, third: 27059, tci: 2030 }, headwind30: { first: 1820, second: 19348, third: 23949, tci: 2010 } },
            { temp: -30, tailwind10: { first: 2399, second: 25932, third: 33519, tci: 2030 }, zeroWind: { first: 2120, second: 22591, third: 28620, tci: 1990 }, headwind10: { first: 2028, second: 21500, third: 27090, tci: 1980 }, headwind30: { first: 1842, second: 19352, third: 24115, tci: 1960 } },
            { temp: -25, tailwind10: { first: 2420, second: 25864, third: 33512, tci: 1980 }, zeroWind: { first: 2142, second: 22562, third: 28773, tci: 1950 }, headwind10: { first: 2049, second: 21483, third: 27125, tci: 1940 }, headwind30: { first: 1864, second: 19360, third: 24159, tci: 1920 } },
            { temp: -20, tailwind10: { first: 2441, second: 25806, third: 33558, tci: 1940 }, zeroWind: { first: 2163, second: 22540, third: 28806, tci: 1910 }, headwind10: { first: 2070, second: 21474, third: 27292, tci: 1900 }, headwind30: { first: 1885, second: 19373, third: 24228, tci: 1890 } },
            { temp: -15, tailwind10: { first: 2463, second: 25751, third: 33564, tci: 1910 }, zeroWind: { first: 2185, second: 22520, third: 28839, tci: 1880 }, headwind10: { first: 2092, second: 21465, third: 27334, tci: 1870 }, headwind30: { first: 1906, second: 19386, third: 24404, tci: 1850 } },
            { temp: -10, tailwind10: { first: 2484, second: 25688, third: 33661, tci: 1870 }, zeroWind: { first: 2206, second: 22492, third: 28997, tci: 1840 }, headwind10: { first: 2113, second: 21448, third: 27497, tci: 1830 }, headwind30: { first: 1927, second: 19391, third: 24456, tci: 1810 } },
            { temp: -5,  tailwind10: { first: 2505, second: 25624, third: 33834, tci: 1830 }, zeroWind: { first: 2227, second: 22463, third: 29021, tci: 1810 }, headwind10: { first: 2134, second: 21430, third: 27530, tci: 1800 }, headwind30: { first: 1948, second: 19395, third: 24627, tci: 1780 } },
            { temp: 0,   tailwind10: { first: 2526, second: 25570, third: 33810, tci: 1800 }, zeroWind: { first: 2247, second: 22442, third: 29053, tci: 1770 }, headwind10: { first: 2155, second: 21419, third: 27569, tci: 1760 }, headwind30: { first: 1969, second: 19404, third: 24682, tci: 1750 } },
            { temp: 5,   tailwind10: { first: 2546, second: 25534, third: 33834, tci: 1770 }, zeroWind: { first: 2268, second: 22436, third: 29235, tci: 1740 }, headwind10: { first: 2175, second: 21423, third: 27754, tci: 1730 }, headwind30: { first: 1989, second: 19426, third: 24750, tci: 1720 } },
            { temp: 10,  tailwind10: { first: 2566, second: 25880, third: 34464, tci: 1740 }, zeroWind: { first: 2288, second: 22652, third: 29686, tci: 1710 }, headwind10: { first: 2195, second: 21569, third: 28197, tci: 1700 }, headwind30: { first: 2010, second: 19573, third: 25173, tci: 1690 } }
        ]
    },
    {
        weight: 19000,
        data: [
            { temp: -54, tailwind10: { first: 2269, second: 24614, third: 31479, tci: 2240 }, zeroWind: { first: 1990, second: 21261, third: 26668, tci: 2200 }, headwind10: { first: 1898, second: 20193, third: 25166, tci: 2190 }, headwind30: { first: 1712, second: 18051, third: 22245, tci: 2170 } },
            { temp: -35, tailwind10: { first: 2352, second: 24359, third: 31591, tci: 2050 }, zeroWind: { first: 2074, second: 21180, third: 27016, tci: 2020 }, headwind10: { first: 1981, second: 20141, third: 25545, tci: 2010 }, headwind30: { first: 1795, second: 18094, third: 22570, tci: 1990 } },
            { temp: -30, tailwind10: { first: 2374, second: 24291, third: 31722, tci: 2010 }, zeroWind: { first: 2095, second: 21150, third: 27036, tci: 1980 }, headwind10: { first: 2002, second: 20123, third: 25578, tci: 1970 }, headwind30: { first: 1817, second: 18100, third: 22736, tci: 1950 } },
            { temp: -25, tailwind10: { first: 2395, second: 24229, third: 31720, tci: 1970 }, zeroWind: { first: 2117, second: 21124, third: 27054, tci: 1940 }, headwind10: { first: 2024, second: 20109, third: 25613, tci: 1930 }, headwind30: { first: 1838, second: 18108, third: 22789, tci: 1910 } },
            { temp: -20, tailwind10: { first: 2416, second: 24176, third: 31727, tci: 1930 }, zeroWind: { first: 2138, second: 21105, third: 27227, tci: 1900 }, headwind10: { first: 2045, second: 20101, third: 25780, tci: 1890 }, headwind30: { first: 1859, second: 18122, third: 22847, tci: 1870 } },
            { temp: -15, tailwind10: { first: 2437, second: 24125, third: 31878, tci: 1890 }, zeroWind: { first: 2159, second: 21087, third: 27261, tci: 1860 }, headwind10: { first: 2066, second: 20093, third: 25822, tci: 1860 }, headwind30: { first: 1880, second: 18135, third: 23023, tci: 1840 } },
            { temp: -10, tailwind10: { first: 2458, second: 24068, third: 31880, tci: 1850 }, zeroWind: { first: 2180, second: 21053, third: 27420, tci: 1830 }, headwind10: { first: 2087, second: 20080, third: 25858, tci: 1820 }, headwind30: { first: 1901, second: 18141, third: 23075, tci: 1800 } },
            { temp: -5,  tailwind10: { first: 2479, second: 24010, third: 31880, tci: 1820 }, zeroWind: { first: 2200, second: 21037, third: 27446, tci: 1790 }, headwind10: { first: 2107, second: 20064, third: 26021, tci: 1790 }, headwind30: { first: 1922, second: 18146, third: 23245, tci: 1770 } },
            { temp: 0,   tailwind10: { first: 2499, second: 23960, third: 32037, tci: 1790 }, zeroWind: { first: 2221, second: 21018, third: 27479, tci: 1760 }, headwind10: { first: 2128, second: 20055, third: 26060, tci: 1750 }, headwind30: { first: 1942, second: 18156, third: 23300, tci: 1740 } },
            { temp: 5,   tailwind10: { first: 2519, second: 23928, third: 32062, tci: 1750 }, zeroWind: { first: 2241, second: 21013, third: 27660, tci: 1730 }, headwind10: { first: 2148, second: 20059, third: 26244, tci: 1720 }, headwind30: { first: 1962, second: 18177, third: 23365, tci: 1700 } },
            { temp: 10,  tailwind10: { first: 2539, second: 24052, third: 32519, tci: 1720 }, zeroWind: { first: 2261, second: 21139, third: 28092, tci: 1700 }, headwind10: { first: 2168, second: 20186, third: 26534, tci: 1690 }, headwind30: { first: 1983, second: 18306, third: 23769, tci: 1680 } }
        ]
    },
{
        weight: 17000,
        data: [
            { temp: -54, tailwind10: { first: 2168, second: 19062, third: 25209, tci: 2180 }, zeroWind: { first: 1889, second: 16422, third: 21283, tci: 2150 }, headwind10: { first: 1797, second: 15557, third: 20024, tci: 2140 }, headwind30: { first: 1611, second: 13851, third: 17577, tci: 2120 } },
            { temp: -35, tailwind10: { first: 2248, second: 18876, third: 25362, tci: 2000 }, zeroWind: { first: 1970, second: 16357, third: 21519, tci: 1980 }, headwind10: { first: 1877, second: 15531, third: 20284, tci: 1970 }, headwind30: { first: 1691, second: 13899, third: 17885, tci: 1950 } },
            { temp: -30, tailwind10: { first: 2269, second: 18827, third: 25506, tci: 1960 }, zeroWind: { first: 1990, second: 16337, third: 21672, tci: 1930 }, headwind10: { first: 1897, second: 15521, third: 20440, tci: 1930 }, headwind30: { first: 1712, second: 13907, third: 18047, tci: 1910 } },
            { temp: -25, tailwind10: { first: 2289, second: 18782, third: 25514, tci: 1920 }, zeroWind: { first: 2011, second: 16320, third: 21701, tci: 1900 }, headwind10: { first: 1918, second: 15513, third: 20476, tci: 1890 }, headwind30: { first: 1732, second: 13917, third: 18096, tci: 1870 } },
            { temp: -20, tailwind10: { first: 2308, second: 18744, third: 25528, tci: 1880 }, zeroWind: { first: 2030, second: 16309, third: 21734, tci: 1860 }, headwind10: { first: 1937, second: 15510, third: 20516, tci: 1850 }, headwind30: { first: 1752, second: 13930, third: 18266, tci: 1840 } },
            { temp: -15, tailwind10: { first: 2329, second: 18708, third: 25587, tci: 1840 }, zeroWind: { first: 2051, second: 16298, third: 21899, tci: 1620 }, headwind10: { first: 1958, second: 15507, third: 20683, tci: 1810 }, headwind30: { first: 1772, second: 13944, third: 18318, tci: 1800 } },
            { temp: -10, tailwind10: { first: 2349, second: 18668, third: 25698, tci: 1810 }, zeroWind: { first: 2070, second: 16253, third: 21930, tci: 1790 }, headwind10: { first: 1978, second: 15500, third: 20720, tci: 1780 }, headwind30: { first: 1792, second: 13953, third: 18367, tci: 1770 } },
            { temp: -5,  tailwind10: { first: 2368, second: 18627, third: 25709, tci: 1770 }, zeroWind: { first: 2090, second: 16257, third: 22093, tci: 1750 }, headwind10: { first: 1997, second: 15492, third: 20884, tci: 1750 }, headwind30: { first: 1811, second: 13961, third: 18534, tci: 1730 } },
            { temp: 0,   tailwind10: { first: 2388, second: 18592, third: 25873, tci: 1740 }, zeroWind: { first: 2109, second: 16256, third: 22127, tci: 1720 }, headwind10: { first: 2016, second: 15489, third: 20924, tci: 1710 }, headwind30: { first: 1831, second: 13972, third: 18585, tci: 1700 } },
            { temp: 5,   tailwind10: { first: 2407, second: 18568, third: 25898, tci: 1710 }, zeroWind: { first: 2128, second: 16253, third: 22169, tci: 1690 }, headwind10: { first: 2036, second: 15493, third: 20971, tci: 1680 }, headwind30: { first: 1850, second: 13989, third: 18641, tci: 1670 } },
            { temp: 10,  tailwind10: { first: 2427, second: 18532, third: 26293, tci: 1680 }, zeroWind: { first: 2148, second: 16325, third: 22542, tci: 1660 }, headwind10: { first: 2055, second: 15567, third: 21336, tci: 1650 }, headwind30: { first: 1870, second: 14069, third: 18992, tci: 1640 } }
        ]
    },
    {
        weight: 16500,
        data: [
            { temp: -54, tailwind10: { first: 2142, second: 17896, third: 23901, tci: 2170 }, zeroWind: { first: 1863, second: 15402, third: 20135, tci: 2140 }, headwind10: { first: 1771, second: 14584, third: 18926, tci: 2130 }, headwind30: { first: 1585, second: 12968, third: 16579, tci: 2110 } },
            { temp: -35, tailwind10: { first: 2221, second: 17727, third: 24065, tci: 1990 }, zeroWind: { first: 1942, second: 15344, third: 20370, tci: 1970 }, headwind10: { first: 1850, second: 14562, third: 19185, tci: 1950 }, headwind30: { first: 1664, second: 13016, third: 16882, tci: 1940 } },
            { temp: -30, tailwind10: { first: 2239, second: 17681, third: 24070, tci: 1950 }, zeroWind: { first: 1961, second: 15326, third: 20524, tci: 1930 }, headwind10: { first: 1869, second: 14553, third: 19341, tci: 1920 }, headwind30: { first: 1683, second: 13024, third: 17042, tci: 1900 } },
            { temp: -25, tailwind10: { first: 2261, second: 17640, third: 24220, tci: 1910 }, zeroWind: { first: 1983, second: 15311, third: 20554, tci: 1890 }, headwind10: { first: 1890, second: 14546, third: 19377, tci: 1880 }, headwind30: { first: 1704, second: 13034, third: 17091, tci: 1860 } },
            { temp: -20, tailwind10: { first: 2281, second: 17605, third: 24236, tci: 1870 }, zeroWind: { first: 2003, second: 15301, third: 20587, tci: 1650 }, headwind10: { first: 1910, second: 14544, third: 19417, tci: 1840 }, headwind30: { first: 1724, second: 13048, third: 17259, tci: 1830 } },
            { temp: -15, tailwind10: { first: 2301, second: 17572, third: 24396, tci: 1830 }, zeroWind: { first: 2022, second: 15291, third: 20752, tci: 1810 }, headwind10: { first: 1929, second: 14542, third: 19583, tci: 1810 }, headwind30: { first: 1744, second: 13061, third: 17310, tci: 1790 } },
            { temp: -10, tailwind10: { first: 2320, second: 17534, third: 24408, tci: 1800 }, zeroWind: { first: 2042, second: 15278, third: 20783, tci: 1780 }, headwind10: { first: 1949, second: 14537, third: 19618, tci: 1770 }, headwind30: { first: 1763, second: 13070, third: 17356, tci: 1760 } },
            { temp: -5,  tailwind10: { first: 2339, second: 17497, third: 24421, tci: 1760 }, zeroWind: { first: 2061, second: 15264, third: 20813, tci: 1740 }, headwind10: { first: 1968, second: 14530, third: 19653, tci: 1740 }, headwind30: { first: 1783, second: 13079, third: 17523, tci: 1730 } },
            { temp: 0,   tailwind10: { first: 2359, second: 17465, third: 24586, tci: 1730 }, zeroWind: { first: 2080, second: 15254, third: 20981, tci: 1710 }, headwind10: { first: 1987, second: 14527, third: 19822, tci: 1710 }, headwind30: { first: 1802, second: 13090, third: 17572, tci: 1690 } },
            { temp: 5,   tailwind10: { first: 2377, second: 17442, third: 24612, tci: 1700 }, zeroWind: { first: 2099, second: 15251, third: 21021, tci: 1680 }, headwind10: { first: 2006, second: 14531, third: 19867, tci: 1670 }, headwind30: { first: 1821, second: 13106, third: 17625, tci: 1660 } },
            { temp: 10,  tailwind10: { first: 2396, second: 17496, third: 24847, tci: 1670 }, zeroWind: { first: 2118, second: 15314, third: 21247, tci: 1650 }, headwind10: { first: 2025, second: 14596, third: 20091, tci: 1650 }, headwind30: { first: 1840, second: 13177, third: 17968, tci: 1630 } }
        ]
    },
    {
        weight: 16000,
        data: [
            { temp: -54, tailwind10: { first: 2115, second: 16807, third: 22570, tci: 2150 }, zeroWind: { first: 1837, second: 14446, third: 19051, tci: 2130 }, headwind10: { first: 1744, second: 13653, third: 17890, tci: 2120 }, headwind30: { first: 1558, second: 12139, third: 15637, tci: 2100 } },
            { temp: -35, tailwind10: { first: 2193, second: 16650, third: 22840, tci: 1980 }, zeroWind: { first: 1915, second: 14394, third: 19287, tci: 1960 }, headwind10: { first: 1822, second: 13653, third: 18147, tci: 1950 }, headwind30: { first: 1636, second: 12187, third: 15933, tci: 1940 } },
            { temp: -30, tailwind10: { first: 2213, second: 16508, third: 22847, tci: 1940 }, zeroWind: { first: 1935, second: 14378, third: 19313, tci: 1920 }, headwind10: { first: 1842, second: 13645, third: 18303, tci: 1910 }, headwind30: { first: 1656, second: 12196, third: 16093, tci: 1900 } },
            { temp: -25, tailwind10: { first: 2234, second: 16570, third: 22998, tci: 1900 }, zeroWind: { first: 1955, second: 14364, third: 19471, tci: 1880 }, headwind10: { first: 1863, second: 13640, third: 18338, tci: 1870 }, headwind30: { first: 1677, second: 12206, third: 16140, tci: 1840 } },
            { temp: -20, tailwind10: { first: 2252, second: 16537, third: 23014, tci: 1860 }, zeroWind: { first: 1974, second: 14355, third: 19504, tci: 1840 }, headwind10: { first: 1881, second: 13638, third: 18377, tci: 1830 }, headwind30: { first: 1696, second: 12219, third: 16306, tci: 1820 } },
            { temp: -15, tailwind10: { first: 2272, second: 16506, third: 23032, tci: 1820 }, zeroWind: { first: 1993, second: 14347, third: 19669, tci: 1800 }, headwind10: { first: 1901, second: 13637, third: 18542, tci: 1800 }, headwind30: { first: 1715, second: 12232, third: 16356, tci: 1790 } },
            { temp: -10, tailwind10: { first: 2291, second: 16472, third: 23191, tci: 1790 }, zeroWind: { first: 2013, second: 14335, third: 19699, tci: 1770 }, headwind10: { first: 1920, second: 13632, third: 18578, tci: 1760 }, headwind30: { first: 1734, second: 12242, third: 16402, tci: 1750 } },
            { temp: -5,  tailwind10: { first: 2310, second: 16437, third: 23205, tci: 1750 }, zeroWind: { first: 2032, second: 14322, third: 19729, tci: 1740 }, headwind10: { first: 1939, second: 13627, third: 18613, tci: 1730 }, headwind30: { first: 1753, second: 12250, third: 16567, tci: 1720 } },
            { temp: 0,   tailwind10: { first: 2329, second: 16408, third: 23223, tci: 1720 }, zeroWind: { first: 2050, second: 14313, third: 19896, tci: 1700 }, headwind10: { first: 1958, second: 13625, third: 18781, tci: 1700 }, headwind30: { first: 1772, second: 12261, third: 16615, tci: 1690 } },
            { temp: 5,   tailwind10: { first: 2347, second: 16386, third: 23397, tci: 1690 }, zeroWind: { first: 2069, second: 14311, third: 19936, tci: 1670 }, headwind10: { first: 1976, second: 13629, third: 18825, tci: 1670 }, headwind30: { first: 1791, second: 12278, third: 16657, tci: 1660 } },
            { temp: 10,  tailwind10: { first: 2366, second: 16432, third: 23623, tci: 1660 }, zeroWind: { first: 2088, second: 14365, third: 20153, tci: 1640 }, headwind10: { first: 1995, second: 13686, third: 19040, tci: 1640 }, headwind30: { first: 1809, second: 12340, third: 17001, tci: 1630 } }
        ]
    },
    {
        weight: 15500,
        data: [
            { temp: -54, tailwind10: { first: 2088, second: 15784, third: 21372, tci: 2140 }, zeroWind: { first: 1810, second: 13548, third: 18026, tci: 2120 }, headwind10: { first: 1717, second: 12813, third: 16910, tci: 2110 }, headwind30: { first: 1531, second: 11360, third: 14745, tci: 2100 } },
            { temp: -35, tailwind10: { first: 2165, second: 15639, third: 21681, tci: 1970 }, zeroWind: { first: 1886, second: 13501, third: 18262, tci: 1950 }, headwind10: { first: 1794, second: 12799, third: 17165, tci: 1940 }, headwind30: { first: 1608, second: 11408, third: 15036, tci: 1930 } },
            { temp: -30, tailwind10: { first: 2184, second: 15599, third: 21690, tci: 1930 }, zeroWind: { first: 1906, second: 13486, third: 18288, tci: 1910 }, headwind10: { first: 1813, second: 12792, third: 17320, tci: 1900 }, headwind30: { first: 1628, second: 11417, third: 15194, tci: 1890 } },
            { temp: -25, tailwind10: { first: 2204, second: 15564, third: 21701, tci: 1890 }, zeroWind: { first: 1926, second: 13474, third: 18444, tci: 1870 }, headwind10: { first: 1833, second: 12787, third: 17355, tci: 1860 }, headwind30: { first: 1647, second: 11424, third: 15237, tci: 1850 } },
            { temp: -20, tailwind10: { first: 2224, second: 15534, third: 21860, tci: 1850 }, zeroWind: { first: 1946, second: 13466, third: 18477, tci: 1830 }, headwind10: { first: 1853, second: 12786, third: 17393, tci: 1830 }, headwind30: { first: 1667, second: 11440, third: 15405, tci: 1810 } },
            { temp: -15, tailwind10: { first: 2242, second: 15505, third: 21878, tci: 1810 }, zeroWind: { first: 1964, second: 13458, third: 18510, tci: 1800 }, headwind10: { first: 1871, second: 12785, third: 17558, tci: 1790 }, headwind30: { first: 1686, second: 11452, third: 15453, tci: 1780 } },
            { temp: -10, tailwind10: { first: 2261, second: 15473, third: 21893, tci: 1780 }, zeroWind: { first: 1983, second: 13448, third: 18672, tci: 1760 }, headwind10: { first: 1890, second: 12782, third: 17593, tci: 1760 }, headwind30: { first: 1705, second: 11462, third: 15497, tci: 1740 } },
            { temp: -5,  tailwind10: { first: 2280, second: 15441, third: 22054, tci: 1750 }, zeroWind: { first: 2002, second: 13437, third: 18702, tci: 1730 }, headwind10: { first: 1909, second: 12777, third: 17627, tci: 1720 }, headwind30: { first: 1723, second: 11471, third: 15661, tci: 1710 } },
            { temp: 0,   tailwind10: { first: 2299, second: 15414, third: 22073, tci: 1710 }, zeroWind: { first: 2020, second: 13429, third: 18734, tci: 1700 }, headwind10: { first: 1927, second: 12776, third: 17795, tci: 1690 }, headwind30: { first: 1742, second: 11482, third: 15707, tci: 1680 } },
            { temp: 5,   tailwind10: { first: 2318, second: 15394, third: 22098, tci: 1680 }, zeroWind: { first: 2039, second: 13427, third: 18908, tci: 1670 }, headwind10: { first: 1947, second: 12780, third: 17837, tci: 1660 }, headwind30: { first: 1761, second: 11498, third: 15757, tci: 1650 } },
            { temp: 10,  tailwind10: { first: 2335, second: 15432, third: 22463, tci: 1650 }, zeroWind: { first: 2057, second: 13474, third: 19117, tci: 1640 }, headwind10: { first: 1964, second: 12829, third: 18043, tci: 1630 }, headwind30: { first: 1778, second: 11553, third: 15958, tci: 1620 } }
        ]
    },
    {
        weight: 14500,
        data: [
            { temp: -54, tailwind10: { first: 2032, second: 13914, third: 19223, tci: 2120 }, zeroWind: { first: 1754, second: 11905, third: 16131, tci: 2100 }, headwind10: { first: 1661, second: 11243, third: 15098, tci: 2100 }, headwind30: { first: 1475, second: 9934, third: 13096, tci: 2080 } },
            { temp: -35, tailwind10: { first: 2106, second: 13788, third: 19401, tci: 1950 }, zeroWind: { first: 1828, second: 11866, third: 16385, tci: 1930 }, headwind10: { first: 1735, second: 11234, third: 15348, tci: 1930 }, headwind30: { first: 1550, second: 9981, third: 13489, tci: 1910 } },
            { temp: -30, tailwind10: { first: 2125, second: 13754, third: 19551, tci: 1910 }, zeroWind: { first: 1847, second: 11854, third: 16391, tci: 1890 }, headwind10: { first: 1754, second: 11229, third: 15379, tci: 1890 }, headwind30: { first: 1569, second: 9990, third: 13531, tci: 1870 } },
            { temp: -25, tailwind10: { first: 2144, second: 13723, third: 19565, tci: 1870 }, zeroWind: { first: 1866, second: 11844, third: 16419, tci: 1850 }, headwind10: { first: 1773, second: 11225, third: 15536, tci: 1850 }, headwind30: { first: 1588, second: 9999, third: 13573, tci: 1840 } },
            { temp: -20, tailwind10: { first: 2163, second: 13697, third: 19582, tci: 1830 }, zeroWind: { first: 1885, second: 11838, third: 16579, tci: 1620 }, headwind10: { first: 1792, second: 11225, third: 15572, tci: 1810 }, headwind30: { first: 1606, second: 10012, third: 13735, tci: 1800 } },
            { temp: -15, tailwind10: { first: 2181, second: 13672, third: 19744, tci: 1800 }, zeroWind: { first: 1903, second: 11832, third: 16611, tci: 1780 }, headwind10: { first: 1810, second: 11226, third: 15608, tci: 1780 }, headwind30: { first: 1625, second: 10024, third: 13780, tci: 1780 } },
            { temp: -10, tailwind10: { first: 2200, second: 13645, third: 19761, tci: 1760 }, zeroWind: { first: 1921, second: 11823, third: 16772, tci: 1750 }, headwind10: { first: 1829, second: 11223, third: 15769, tci: 1740 }, headwind30: { first: 1643, second: 10034, third: 13822, tci: 1730 } },
            { temp: -5,  tailwind10: { first: 2218, second: 13618, third: 19777, tci: 1730 }, zeroWind: { first: 1940, second: 11815, third: 16802, tci: 1710 }, headwind10: { first: 1847, second: 11221, third: 15802, tci: 1710 }, headwind30: { first: 1661, second: 10043, third: 13983, tci: 1700 } },
            { temp: 0,   tailwind10: { first: 2236, second: 13594, third: 19944, tci: 1700 }, zeroWind: { first: 1958, second: 11808, third: 16833, tci: 1680 }, headwind10: { first: 1865, second: 11220, third: 15837, tci: 1680 }, headwind30: { first: 1679, second: 10054, third: 14026, tci: 1670 } },
            { temp: 5,   tailwind10: { first: 2254, second: 13576, third: 19969, tci: 1670 }, zeroWind: { first: 1975, second: 11807, third: 17005, tci: 1650 }, headwind10: { first: 1883, second: 11224, third: 16008, tci: 1650 }, headwind30: { first: 1697, second: 10068, third: 14072, tci: 1640 } },
            { temp: 10,  tailwind10: { first: 2271, second: 13602, third: 20172, tci: 1640 }, zeroWind: { first: 1993, second: 11842, third: 17201, tci: 1620 }, headwind10: { first: 1900, second: 11262, third: 16200, tci: 1620 }, headwind30: { first: 1715, second: 10112, third: 14251, tci: 1610 } }
        ]
    },
    {
        weight: 13500,
        data: [
            { temp: -54, tailwind10: { first: 1973, second: 12246, third: 17281, tci: 2110 }, zeroWind: { first: 1695, second: 10437, third: 14296, tci: 2090 }, headwind10: { first: 1602, second: 9842, third: 13459, tci: 2080 }, headwind30: { first: 1417, second: 8661, third: 11604, tci: 2070 } },
            { temp: -35, tailwind10: { first: 2045, second: 12136, third: 17466, tci: 1940 }, zeroWind: { first: 1767, second: 10406, third: 14648, tci: 1920 }, headwind10: { first: 1674, second: 9836, third: 13702, tci: 1910 }, headwind30: { first: 1488, second: 8706, third: 11986, tci: 1900 } },
            { temp: -30, tailwind10: { first: 2064, second: 12107, third: 17477, tci: 1890 }, zeroWind: { first: 1785, second: 10396, third: 14674, tci: 1880 }, headwind10: { first: 1692, second: 9832, third: 13732, tci: 1870 }, headwind30: { first: 1507, second: 8714, third: 12024, tci: 1860 } },
            { temp: -25, tailwind10: { first: 2082, second: 12080, third: 17490, tci: 1860 }, zeroWind: { first: 1803, second: 10388, third: 14701, tci: 1840 }, headwind10: { first: 1711, second: 9830, third: 13888, tci: 1840 }, headwind30: { first: 1525, second: 8724, third: 12064, tci: 1820 } },
            { temp: -20, tailwind10: { first: 2100, second: 12057, third: 17550, tci: 1820 }, zeroWind: { first: 1822, second: 10383, third: 14859, tci: 1800 }, headwind10: { first: 1729, second: 9831, third: 13922, tci: 1800 }, headwind30: { first: 1543, second: 8736, third: 12223, tci: 1790 } },
            { temp: -15, tailwind10: { first: 2118, second: 12035, third: 17668, tci: 1790 }, zeroWind: { first: 1839, second: 10378, third: 14890, tci: 1770 }, headwind10: { first: 1747, second: 9832, third: 13955, tci: 1760 }, headwind30: { first: 1561, second: 8748, third: 12263, tci: 1750 } },
            { temp: -10, tailwind10: { first: 2135, second: 12012, third: 17685, tci: 1750 }, zeroWind: { first: 1857, second: 10371, third: 14918, tci: 1730 }, headwind10: { first: 1764, second: 9830, third: 14116, tci: 1730 }, headwind30: { first: 1579, second: 8757, third: 12303, tci: 1720 } },
            { temp: -5,  tailwind10: { first: 2153, second: 11989, third: 17847, tci: 1720 }, zeroWind: { first: 1875, second: 10364, third: 15079, tci: 1700 }, headwind10: { first: 1782, second: 9829, third: 14147, tci: 1700 }, headwind30: { first: 1596, second: 8766, third: 12462, tci: 1690 } },
            { temp: 0,   tailwind10: { first: 2170, second: 11968, third: 17867, tci: 1680 }, zeroWind: { first: 1892, second: 10360, third: 15109, tci: 1670 }, headwind10: { first: 1799, second: 9829, third: 14181, tci: 1670 }, headwind30: { first: 1614, second: 8777, third: 12502, tci: 1660 } },
            { temp: 5,   tailwind10: { first: 2188, second: 11952, third: 17891, tci: 1650 }, zeroWind: { first: 1909, second: 10359, third: 15142, tci: 1640 }, headwind10: { first: 1816, second: 9833, third: 14217, tci: 1640 }, headwind30: { first: 1631, second: 8790, third: 12545, tci: 1630 } },
            { temp: 10,  tailwind10: { first: 2205, second: 11969, third: 18082, tci: 1620 }, zeroWind: { first: 1926, second: 10384, third: 15327, tci: 1610 }, headwind10: { first: 1834, second: 9862, third: 14397, tci: 1610 }, headwind30: { first: 1648, second: 8825, third: 12722, tci: 1600 } }
        ]
    }
];

const singleEngineFlightPathDistances_1000ft_anti_ice_on = [
    {
        weight: 20000,
        data: [
            { temp: -54, tailwind10: { first: 2351, second: 28952, third: 36599, tci: 2270 }, zeroWind: { first: 2073, second: 25101, third: 31193, tci: 2230 }, headwind10: { first: 1980, second: 23848, third: 29500, tci: 2210 }, headwind30: { first: 1795, second: 21386, third: 26098, tci: 2190 } },
            { temp: -35, tailwind10: { first: 2439, second: 28627, third: 36813, tci: 2080 }, zeroWind: { first: 2161, second: 24958, third: 31533, tci: 2050 }, headwind10: { first: 2068, second: 23763, third: 29755, tci: 2030 }, headwind30: { first: 1883, second: 21413, third: 26550, tci: 2010 } },
            { temp: -30, tailwind10: { first: 2462, second: 28537, third: 36792, tci: 2040 }, zeroWind: { first: 2184, second: 24914, third: 31549, tci: 2000 }, headwind10: { first: 2091, second: 23734, third: 29908, tci: 1990 }, headwind30: { first: 1905, second: 21412, third: 26600, tci: 1970 } },
            { temp: -25, tailwind10: { first: 2484, second: 28465, third: 36931, tci: 1990 }, zeroWind: { first: 2206, second: 24884, third: 31577, tci: 1960 }, headwind10: { first: 2113, second: 23717, third: 29948, tci: 1950 }, headwind30: { first: 1928, second: 21420, third: 26660, tci: 1930 } },
            { temp: -20, tailwind10: { first: 2506, second: 28399, third: 36934, tci: 1950 }, zeroWind: { first: 2228, second: 24858, third: 31743, tci: 1920 }, headwind10: { first: 2135, second: 23704, third: 30120, tci: 1910 }, headwind30: { first: 1950, second: 21432, third: 26842, tci: 1890 } },
            { temp: -15, tailwind10: { first: 2528, second: 28334, third: 36931, tci: 1910 }, zeroWind: { first: 2250, second: 24833, third: 31775, tci: 1880 }, headwind10: { first: 2157, second: 23690, third: 30163, tci: 1870 }, headwind30: { first: 1972, second: 21442, third: 26902, tci: 1850 } },
            { temp: -10, tailwind10: { first: 2550, second: 28261, third: 37076, tci: 1880 }, zeroWind: { first: 2272, second: 24798, third: 31935, tci: 1850 }, headwind10: { first: 2179, second: 23668, third: 30198, tci: 1840 }, headwind30: { first: 1993, second: 21445, third: 27078, tci: 1820 } },
            { temp: -5,  tailwind10: { first: 2571, second: 28190, third: 37072, tci: 1840 }, zeroWind: { first: 2293, second: 24765, third: 31961, tci: 1810 }, headwind10: { first: 2200, second: 23647, third: 30364, tci: 1800 }, headwind30: { first: 2015, second: 21447, third: 27132, tci: 1780 } },
            { temp: 0,   tailwind10: { first: 2593, second: 28123, third: 37072, tci: 1810 }, zeroWind: { first: 2314, second: 24735, third: 31989, tci: 1780 }, headwind10: { first: 2222, second: 23629, third: 30402, tci: 1770 }, headwind30: { first: 2036, second: 21451, third: 27311, tci: 1750 } },
            { temp: 5,   tailwind10: { first: 2614, second: 28089, third: 37252, tci: 1770 }, zeroWind: { first: 2335, second: 24732, third: 32162, tci: 1750 }, headwind10: { first: 2243, second: 23636, third: 30597, tci: 1740 }, headwind30: { first: 2057, second: 21478, third: 27388, tci: 1720 } },
            { temp: 10,  tailwind10: { first: 2635, second: 29501, third: 39563, tci: 1750 }, zeroWind: { first: 2356, second: 25974, third: 34107, tci: 1730 }, headwind10: { first: 2263, second: 24823, third: 32449, tci: 1720 }, headwind30: { first: 2078, second: 22561, third: 29094, tci: 1700 } }
        ]
    },
    {
        weight: 19500,
        data: [
            { temp: -54, tailwind10: { first: 2328, second: 27050, third: 34546, tci: 2250 }, zeroWind: { first: 2049, second: 23444, third: 29399, tci: 2210 }, headwind10: { first: 1956, second: 22269, third: 27670, tci: 2200 }, headwind30: { first: 1771, second: 19958, third: 24547, tci: 2170 } },
            { temp: -35, tailwind10: { first: 2415, second: 26754, third: 34643, tci: 2060 }, zeroWind: { first: 2136, second: 23317, third: 29620, tci: 2030 }, headwind10: { first: 2043, second: 22196, third: 28051, tci: 2020 }, headwind30: { first: 1858, second: 19989, third: 24998, tci: 2000 } },
            { temp: -30, tailwind10: { first: 2437, second: 26572, third: 34769, tci: 2020 }, zeroWind: { first: 2158, second: 23278, third: 29758, tci: 1990 }, headwind10: { first: 2066, second: 22170, third: 28080, tci: 1980 }, headwind30: { first: 1880, second: 19989, third: 25048, tci: 1960 } },
            { temp: -25, tailwind10: { first: 2459, second: 26806, third: 34768, tci: 1980 }, zeroWind: { first: 2161, second: 23250, third: 29799, tci: 1950 }, headwind10: { first: 2088, second: 22155, third: 28246, tci: 1940 }, headwind30: { first: 1902, second: 19999, third: 25107, tci: 1920 } },
            { temp: -20, tailwind10: { first: 2481, second: 26546, third: 34919, tci: 1940 }, zeroWind: { first: 2202, second: 23228, third: 29955, tci: 1910 }, headwind10: { first: 2110, second: 22145, third: 28290, tci: 1900 }, headwind30: { first: 1924, second: 20011, third: 25288, tci: 1880 } },
            { temp: -15, tailwind10: { first: 2502, second: 26487, third: 34924, tci: 1900 }, zeroWind: { first: 2224, second: 23205, third: 29999, tci: 1870 }, headwind10: { first: 2131, second: 22133, third: 28462, tci: 1860 }, headwind30: { first: 1946, second: 20022, third: 25348, tci: 1840 } },
            { temp: -10, tailwind10: { first: 2524, second: 26421, third: 34923, tci: 1860 }, zeroWind: { first: 2245, second: 23175, third: 30026, tci: 1830 }, headwind10: { first: 2153, second: 22115, third: 28498, tci: 1820 }, headwind30: { first: 1967, second: 20021, third: 25518, tci: 1810 } },
            { temp: -5,  tailwind10: { first: 2545, second: 26356, third: 35072, tci: 1830 }, zeroWind: { first: 2267, second: 23146, third: 30190, tci: 1800 }, headwind10: { first: 2174, second: 22097, third: 28535, tci: 1790 }, headwind30: { first: 1988, second: 20030, third: 25577, tci: 1770 } },
            { temp: 0,   tailwind10: { first: 2566, second: 26296, third: 35076, tci: 1790 }, zeroWind: { first: 2288, second: 23119, third: 30220, tci: 1770 }, headwind10: { first: 2195, second: 22081, third: 28706, tci: 1760 }, headwind30: { first: 2009, second: 20035, third: 25631, tci: 1740 } },
            { temp: 5,   tailwind10: { first: 2587, second: 26265, third: 35108, tci: 1760 }, zeroWind: { first: 2309, second: 23117, third: 30412, tci: 1730 }, headwind10: { first: 2216, second: 22088, third: 28766, tci: 1730 }, headwind30: { first: 2030, second: 20061, third: 25831, tci: 1710 } },
            { temp: 10,  tailwind10: { first: 2607, second: 27501, third: 37241, tci: 1740 }, zeroWind: { first: 2329, second: 24207, third: 32187, tci: 1710 }, headwind10: { first: 2236, second: 23131, third: 30472, tci: 1700 }, headwind30: { first: 2051, second: 21014, third: 27280, tci: 1690 } }
        ]
    },
    {
        weight: 19000,
        data: [
            { temp: -54, tailwind10: { first: 2303, second: 25300, third: 32509, tci: 2230 }, zeroWind: { first: 2025, second: 21916, third: 27736, tci: 2190 }, headwind10: { first: 1932, second: 20812, third: 26083, tci: 2180 }, headwind30: { first: 1747, second: 18539, third: 23108, tci: 2160 } },
            { temp: -35, tailwind10: { first: 2389, second: 25030, third: 32762, tci: 2050 }, zeroWind: { first: 2111, second: 21804, third: 27965, tci: 2010 }, headwind10: { first: 2018, second: 20750, third: 26469, tci: 2000 }, headwind30: { first: 1832, second: 18574, third: 23440, tci: 1980 } },
            { temp: -30, tailwind10: { first: 2411, second: 24956, third: 32752, tci: 2000 }, zeroWind: { first: 2133, second: 21769, third: 27986, tci: 1970 }, headwind10: { first: 2040, second: 20728, third: 26499, tci: 1960 }, headwind30: { first: 1855, second: 18676, third: 23607, tci: 1940 } },
            { temp: -25, tailwind10: { first: 2433, second: 24895, third: 32899, tci: 1960 }, zeroWind: { first: 2155, second: 21745, third: 28148, tci: 1930 }, headwind10: { first: 2062, second: 20715, third: 26666, tci: 1920 }, headwind30: { first: 1876, second: 18586, third: 23565, tci: 1900 } },
            { temp: -20, tailwind10: { first: 2455, second: 24841, third: 32906, tci: 1920 }, zeroWind: { first: 2176, second: 21725, third: 28183, tci: 1890 }, headwind10: { first: 2083, second: 20706, third: 26710, tci: 1880 }, headwind30: { first: 1898, second: 18699, third: 23845, tci: 1870 } },
            { temp: -15, tailwind10: { first: 2474, second: 24786, third: 33061, tci: 1880 }, zeroWind: { first: 2196, second: 21704, third: 28350, tci: 1860 }, headwind10: { first: 2103, second: 20696, third: 26882, tci: 1850 }, headwind30: { first: 1918, second: 18710, third: 23903, tci: 1830 } },
            { temp: -10, tailwind10: { first: 2497, second: 24726, third: 33065, tci: 1850 }, zeroWind: { first: 2219, second: 21678, third: 28380, tci: 1820 }, headwind10: { first: 2126, second: 20681, third: 26920, tci: 1810 }, headwind30: { first: 1940, second: 18716, third: 24079, tci: 1800 } },
            { temp: -5,  tailwind10: { first: 2518, second: 24668, third: 33069, tci: 1810 }, zeroWind: { first: 2240, second: 21652, third: 28545, tci: 1790 }, headwind10: { first: 2147, second: 20666, third: 26958, tci: 1780 }, headwind30: { first: 1961, second: 18721, third: 24132, tci: 1760 } },
            { temp: 0,   tailwind10: { first: 2539, second: 24613, third: 33226, tci: 1780 }, zeroWind: { first: 2261, second: 21629, third: 28577, tci: 1750 }, headwind10: { first: 2168, second: 20653, third: 27130, tci: 1750 }, headwind30: { first: 1982, second: 18728, third: 24186, tci: 1730 } },
            { temp: 5,   tailwind10: { first: 2560, second: 24585, third: 33259, tci: 1750 }, zeroWind: { first: 2282, second: 21628, third: 28630, tci: 1720 }, headwind10: { first: 2189, second: 20660, third: 27189, tci: 1710 }, headwind30: { first: 2003, second: 18752, third: 24383, tci: 1700 } },
            { temp: 10,  tailwind10: { first: 2580, second: 25669, third: 35090, tci: 1720 }, zeroWind: { first: 2301, second: 22586, third: 30273, tci: 1700 }, headwind10: { first: 2209, second: 21578, third: 28770, tci: 1690 }, headwind30: { first: 2023, second: 19592, third: 25720, tci: 1670 } }
        ]
    },
    {
        weight: 18500,
        data: [
            { temp: -54, tailwind10: { first: 2279, second: 23685, third: 30745, tci: 2210 }, zeroWind: { first: 2000, second: 20505, third: 26066, tci: 2180 }, headwind10: { first: 1907, second: 19466, third: 24607, tci: 2170 }, headwind30: { first: 1722, second: 17420, third: 21768, tci: 2150 } },
            { temp: -35, tailwind10: { first: 2363, second: 23438, third: 31015, tci: 2030 }, zeroWind: { first: 2085, second: 20405, third: 26425, tci: 2000 }, headwind10: { first: 1992, second: 19413, third: 24995, tci: 1990 }, headwind30: { first: 1807, second: 17457, third: 22097, tci: 1970 } },
            { temp: -30, tailwind10: { first: 2385, second: 23370, third: 31010, tci: 1990 }, zeroWind: { first: 2107, second: 20373, third: 26449, tci: 1960 }, headwind10: { first: 2014, second: 19393, third: 25027, tci: 1950 }, headwind30: { first: 1828, second: 17458, third: 22261, tci: 1930 } },
            { temp: -25, tailwind10: { first: 2407, second: 23315, third: 31016, tci: 1950 }, zeroWind: { first: 2128, second: 20352, third: 26612, tci: 1920 }, headwind10: { first: 2036, second: 19383, third: 25195, tci: 1910 }, headwind30: { first: 1850, second: 17471, third: 22320, tci: 1890 } },
            { temp: -20, tailwind10: { first: 2428, second: 23265, third: 31172, tci: 1910 }, zeroWind: { first: 2150, second: 20334, third: 26647, tci: 1880 }, headwind10: { first: 2057, second: 19376, third: 25239, tci: 1870 }, headwind30: { first: 1871, second: 17484, third: 22498, tci: 1860 } },
            { temp: -15, tailwind10: { first: 2449, second: 23215, third: 31182, tci: 1870 }, zeroWind: { first: 2171, second: 20316, third: 26815, tci: 1840 }, headwind10: { first: 2078, second: 19367, third: 25282, tci: 1840 }, headwind30: { first: 1892, second: 17496, third: 22556, tci: 1820 } },
            { temp: -10, tailwind10: { first: 2470, second: 23161, third: 31188, tci: 1830 }, zeroWind: { first: 2192, second: 20293, third: 26846, tci: 1810 }, headwind10: { first: 2099, second: 19355, third: 25450, tci: 1800 }, headwind30: { first: 1913, second: 17502, third: 22509, tci: 1780 } },
            { temp: -5,  tailwind10: { first: 2491, second: 23108, third: 31344, tci: 1800 }, zeroWind: { first: 2212, second: 20271, third: 26876, tci: 1770 }, headwind10: { first: 2120, second: 19342, third: 25489, tci: 1770 }, headwind30: { first: 1934, second: 17509, third: 22785, tci: 1750 } },
            { temp: 0,   tailwind10: { first: 2511, second: 23058, third: 31355, tci: 1770 }, zeroWind: { first: 2233, second: 20250, third: 27047, tci: 1740 }, headwind10: { first: 2140, second: 19331, third: 25661, tci: 1730 }, headwind30: { first: 1955, second: 17516, third: 22838, tci: 1720 } },
            { temp: 5,   tailwind10: { first: 2532, second: 23031, third: 31538, tci: 1730 }, zeroWind: { first: 2253, second: 20249, third: 27096, tci: 1710 }, headwind10: { first: 2161, second: 19338, third: 25719, tci: 1700 }, headwind30: { first: 1975, second: 17539, third: 23032, tci: 1690 } },
            { temp: 10,  tailwind10: { first: 2552, second: 23986, third: 33240, tci: 1710 }, zeroWind: { first: 2273, second: 21094, third: 28629, tci: 1690 }, headwind10: { first: 2181, second: 20148, third: 27058, tci: 1680 }, headwind30: { first: 1995, second: 18282, third: 24271, tci: 1660 } }
        ]
    },
    {
        weight: 18000,
        data: [
            { temp: -54, tailwind10: { first: 2253, second: 22191, third: 29103, tci: 2200 }, zeroWind: { first: 1975, second: 19197, third: 24625, tci: 2160 }, headwind10: { first: 1882, second: 18218, third: 23230, tci: 2150 }, headwind30: { first: 1697, second: 16288, third: 20517, tci: 2130 } },
            { temp: -35, tailwind10: { first: 2337, second: 21964, third: 29246, tci: 2020 }, zeroWind: { first: 2059, second: 19108, third: 24989, tci: 1990 }, headwind10: { first: 1966, second: 18172, third: 23619, tci: 1980 }, headwind30: { first: 1781, second: 16328, third: 20841, tci: 1960 } },
            { temp: -30, tailwind10: { first: 2359, second: 21902, third: 29386, tci: 1970 }, zeroWind: { first: 2080, second: 19079, third: 25013, tci: 1950 }, headwind10: { first: 1988, second: 18155, third: 23653, tci: 1940 }, headwind30: { first: 1802, second: 16332, third: 21007, tci: 1920 } },
            { temp: -25, tailwind10: { first: 2380, second: 21851, third: 29395, tci: 1930 }, zeroWind: { first: 2102, second: 19060, third: 25176, tci: 1910 }, headwind10: { first: 2009, second: 18146, third: 23693, tci: 1900 }, headwind30: { first: 1823, second: 16343, third: 21063, tci: 1880 } },
            { temp: -20, tailwind10: { first: 2401, second: 21805, third: 29408, tci: 1890 }, zeroWind: { first: 2123, second: 19045, third: 25213, tci: 1870 }, headwind10: { first: 2030, second: 18141, third: 23864, tci: 1860 }, headwind30: { first: 1844, second: 16356, third: 21240, tci: 1850 } },
            { temp: -15, tailwind10: { first: 2422, second: 21760, third: 29566, tci: 1860 }, zeroWind: { first: 2144, second: 19029, third: 25246, tci: 1630 }, headwind10: { first: 2051, second: 16134, third: 23907, tci: 1820 }, headwind30: { first: 1865, second: 16368, third: 21297, tci: 1810 } },
            { temp: -10, tailwind10: { first: 2443, second: 21710, third: 29575, tci: 1820 }, zeroWind: { first: 2164, second: 19008, third: 25414, tci: 1800 }, headwind10: { first: 2071, second: 18123, third: 24076, tci: 1790 }, headwind30: { first: 1886, second: 16375, third: 21349, tci: 1770 } },
            { temp: -5,  tailwind10: { first: 2463, second: 21662, third: 29586, tci: 1790 }, zeroWind: { first: 2185, second: 18989, third: 25446, tci: 1760 }, headwind10: { first: 2092, second: 18113, third: 24115, tci: 1760 }, headwind30: { first: 1906, second: 16383, third: 21524, tci: 1740 } },
            { temp: 0,   tailwind10: { first: 2483, second: 21616, third: 29748, tci: 1750 }, zeroWind: { first: 2205, second: 18971, third: 25480, tci: 1730 }, headwind10: { first: 2112, second: 18103, third: 24155, tci: 1720 }, headwind30: { first: 1927, second: 16390, third: 21577, tci: 1710 } },
            { temp: 5,   tailwind10: { first: 2503, second: 21591, third: 29780, tci: 1720 }, zeroWind: { first: 2225, second: 18970, third: 25667, tci: 1700 }, headwind10: { first: 2132, second: 18110, third: 24343, tci: 1690 }, headwind30: { first: 1947, second: 16418, third: 21774, tci: 1680 } },
            { temp: 10,  tailwind10: { first: 2523, second: 22433, third: 31368, tci: 1700 }, zeroWind: { first: 2245, second: 19714, third: 26958, tci: 1680 }, headwind10: { first: 2152, second: 18826, third: 25590, tci: 1670 }, headwind30: { first: 1966, second: 17070, third: 22796, tci: 1650 } }
        ]
    },
    {
        weight: 17500,
        data: [
            { temp: -54, tailwind10: { first: 2228, second: 20804, third: 27432, tci: 2180 }, zeroWind: { first: 1949, second: 17981, third: 23276, tci: 2150 }, headwind10: { first: 1857, second: 17057, third: 21940, tci: 2140 }, headwind30: { first: 1671, second: 15235, third: 19346, tci: 2120 } },
            { temp: -35, tailwind10: { first: 2311, second: 20595, third: 27723, tci: 2000 }, zeroWind: { first: 2032, second: 17901, third: 23643, tci: 1980 }, headwind10: { first: 1939, second: 17019, third: 22207, tci: 1970 }, headwind30: { first: 1754, second: 15276, third: 19666, tci: 1950 } },
            { temp: -30, tailwind10: { first: 2332, second: 20538, third: 27724, tci: 1960 }, zeroWind: { first: 2054, second: 17876, third: 23669, tci: 1940 }, headwind10: { first: 1961, second: 17004, third: 22366, tci: 1930 }, headwind30: { first: 1775, second: 15281, third: 19831, tci: 1910 } },
            { temp: -25, tailwind10: { first: 2353, second: 20491, third: 27878, tci: 1920 }, zeroWind: { first: 2074, second: 17859, third: 23702, tci: 1900 }, headwind10: { first: 1982, second: 16996, third: 22406, tci: 1890 }, headwind30: { first: 1796, second: 15292, third: 19886, tci: 1870 } },
            { temp: -20, tailwind10: { first: 2374, second: 20449, third: 27892, tci: 1880 }, zeroWind: { first: 2095, second: 17845, third: 23870, tci: 1860 }, headwind10: { first: 2002, second: 16992, third: 22577, tci: 1850 }, headwind30: { first: 1817, second: 15306, third: 20061, tci: 1840 } },
            { temp: -15, tailwind10: { first: 2396, second: 20407, third: 27908, tci: 1850 }, zeroWind: { first: 2117, second: 17831, third: 23906, tci: 1820 }, headwind10: { first: 2025, second: 16986, third: 22620, tci: 1810 }, headwind30: { first: 1839, second: 15318, third: 20117, tci: 1800 } },
            { temp: -10, tailwind10: { first: 2415, second: 20362, third: 28066, tci: 1810 }, zeroWind: { first: 2136, second: 17813, third: 23938, tci: 1790 }, headwind10: { first: 2043, second: 16977, third: 22658, tci: 1790 }, headwind30: { first: 1858, second: 15326, third: 20168, tci: 1770 } },
            { temp: -5,  tailwind10: { first: 2435, second: 20318, third: 28079, tci: 1780 }, zeroWind: { first: 2156, second: 17795, third: 24105, tci: 1750 }, headwind10: { first: 2064, second: 16968, third: 22827, tci: 1750 }, headwind30: { first: 1878, second: 15334, third: 20342, tci: 1730 } },
            { temp: 0,   tailwind10: { first: 2455, second: 20276, third: 28243, tci: 1740 }, zeroWind: { first: 2176, second: 17779, third: 24139, tci: 1720 }, headwind10: { first: 2084, second: 16960, third: 22867, tci: 1710 }, headwind30: { first: 1898, second: 15342, third: 20393, tci: 1700 } },
            { temp: 5,   tailwind10: { first: 2475, second: 20253, third: 28276, tci: 1710 }, zeroWind: { first: 2196, second: 17779, third: 24326, tci: 1690 }, headwind10: { first: 2103, second: 16967, third: 23054, tci: 1680 }, headwind30: { first: 1918, second: 15363, third: 20582, tci: 1670 } },
            { temp: 10,  tailwind10: { first: 2494, second: 20995, third: 29514, tci: 1690 }, zeroWind: { first: 2216, second: 18439, third: 25533, tci: 1670 }, headwind10: { first: 2123, second: 17601, third: 24219, tci: 1660 }, headwind30: { first: 1937, second: 15946, third: 21536, tci: 1650 } }
        ]
    },
{
        weight: 17000,
        data: [
            { temp: -54, tailwind10: { first: 2202, second: 19512, third: 25994, tci: 2170 }, zeroWind: { first: 1923, second: 16848, third: 22011, tci: 2140 }, headwind10: { first: 1831, second: 15976, third: 20732, tci: 2130 }, headwind30: { first: 1645, second: 14252, third: 18245, tci: 2110 } },
            { temp: -35, tailwind10: { first: 2283, second: 19320, third: 26296, tci: 1990 }, zeroWind: { first: 2005, second: 16777, third: 22252, tci: 1970 }, headwind10: { first: 1912, second: 15943, third: 20998, tci: 1960 }, headwind30: { first: 1727, second: 14295, third: 18561, tci: 1940 } },
            { temp: -30, tailwind10: { first: 2304, second: 19268, third: 26300, tci: 1950 }, zeroWind: { first: 2026, second: 16754, third: 22407, tci: 1930 }, headwind10: { first: 1933, second: 15930, third: 21157, tci: 1920 }, headwind30: { first: 1748, second: 14301, third: 18726, tci: 1900 } },
            { temp: -25, tailwind10: { first: 2325, second: 19224, third: 26311, tci: 1910 }, zeroWind: { first: 2047, second: 16739, third: 22441, tci: 1890 }, headwind10: { first: 1954, second: 15923, third: 21197, tci: 1880 }, headwind30: { first: 1768, second: 14312, third: 18779, tci: 1860 } },
            { temp: -20, tailwind10: { first: 2346, second: 19185, third: 26472, tci: 1870 }, zeroWind: { first: 2067, second: 16726, third: 22609, tci: 1850 }, headwind10: { first: 1974, second: 15920, third: 21367, tci: 1840 }, headwind30: { first: 1789, second: 14325, third: 18934, tci: 1830 } },
            { temp: -15, tailwind10: { first: 2366, second: 19146, third: 26488, tci: 1830 }, zeroWind: { first: 2086, second: 16714, third: 22645, tci: 1810 }, headwind10: { first: 1995, second: 15915, third: 21409, tci: 1810 }, headwind30: { first: 1809, second: 14337, third: 19006, tci: 1790 } },
            { temp: -10, tailwind10: { first: 2386, second: 19105, third: 26502, tci: 1800 }, zeroWind: { first: 2108, second: 16698, third: 22677, tci: 1780 }, headwind10: { first: 2015, second: 15908, third: 21447, tci: 1770 }, headwind30: { first: 1829, second: 14346, third: 19057, tci: 1760 } },
            { temp: -5,  tailwind10: { first: 2406, second: 19065, third: 26565, tci: 1760 }, zeroWind: { first: 2128, second: 16582, third: 22846, tci: 1740 }, headwind10: { first: 2035, second: 15901, third: 21618, tci: 1740 }, headwind30: { first: 1849, second: 14354, third: 19230, tci: 1730 } },
            { temp: 0,   tailwind10: { first: 2426, second: 19026, third: 26681, tci: 1730 }, zeroWind: { first: 2147, second: 16668, third: 22880, tci: 1710 }, headwind10: { first: 2055, second: 15894, third: 21657, tci: 1710 }, headwind30: { first: 1869, second: 14363, third: 19281, tci: 1690 } },
            { temp: 5,   tailwind10: { first: 2445, second: 19005, third: 26864, tci: 1700 }, zeroWind: { first: 2167, second: 16668, third: 22927, tci: 1680 }, headwind10: { first: 2074, second: 15901, third: 21709, tci: 1670 }, headwind30: { first: 1888, second: 14383, third: 19341, tci: 1660 } },
            { temp: 10,  tailwind10: { first: 2465, second: 19661, third: 28117, tci: 1680 }, zeroWind: { first: 2186, second: 17253, third: 24056, tci: 1650 }, headwind10: { first: 2094, second: 16463, third: 22800, tci: 1650 }, headwind30: { first: 1908, second: 14901, third: 20355, tci: 1640 } }
        ]
    },
    {
        weight: 16500,
        data: [
            { temp: -54, tailwind10: { first: 2175, second: 18307, third: 24644, tci: 2160 }, zeroWind: { first: 1897, second: 15790, third: 20821, tci: 2130 }, headwind10: { first: 1804, second: 14965, third: 19595, tci: 2120 }, headwind30: { first: 1619, second: 13334, third: 17210, tci: 2100 } },
            { temp: -35, tailwind10: { first: 2256, second: 18130, third: 24812, tci: 1980 }, zeroWind: { first: 1977, second: 15726, third: 21054, tci: 1960 }, headwind10: { first: 1885, second: 14937, third: 19860, tci: 1950 }, headwind30: { first: 1699, second: 13378, third: 17521, tci: 1930 } },
            { temp: -30, tailwind10: { first: 2276, second: 18081, third: 24960, tci: 1940 }, zeroWind: { first: 1998, second: 15705, third: 21221, tci: 1920 }, headwind10: { first: 1905, second: 14926, third: 20019, tci: 1910 }, headwind30: { first: 1720, second: 13384, third: 17684, tci: 1890 } },
            { temp: -25, tailwind10: { first: 2297, second: 18041, third: 24974, tci: 1900 }, zeroWind: { first: 2019, second: 15692, third: 21254, tci: 1880 }, headwind10: { first: 1926, second: 14920, third: 20059, tci: 1870 }, headwind30: { first: 1740, second: 13395, third: 17736, tci: 1860 } },
            { temp: -20, tailwind10: { first: 2317, second: 18005, third: 24991, tci: 1860 }, zeroWind: { first: 2039, second: 15681, third: 21259, tci: 1840 }, headwind10: { first: 1946, second: 14917, third: 20059, tci: 1830 }, headwind30: { first: 1760, second: 13408, third: 17789, tci: 1820 } },
            { temp: -15, tailwind10: { first: 2337, second: 17969, third: 25154, tci: 1820 }, zeroWind: { first: 2059, second: 15669, third: 21458, tci: 1800 }, headwind10: { first: 1966, second: 14914, third: 20270, tci: 1800 }, headwind30: { first: 1780, second: 13420, third: 17961, tci: 1780 } },
            { temp: -10, tailwind10: { first: 2359, second: 17931, third: 25170, tci: 1790 }, zeroWind: { first: 2080, second: 15656, third: 21491, tci: 1770 }, headwind10: { first: 1988, second: 14908, third: 20309, tci: 1760 }, headwind30: { first: 1802, second: 13430, third: 18011, tci: 1750 } },
            { temp: -5,  tailwind10: { first: 2377, second: 17894, third: 25185, tci: 1750 }, zeroWind: { first: 2098, second: 15642, third: 21522, tci: 1740 }, headwind10: { first: 2005, second: 14902, third: 20346, tci: 1730 }, headwind30: { first: 1820, second: 13438, third: 18183, tci: 1720 } },
            { temp: 0,   tailwind10: { first: 2396, second: 17859, third: 25352, tci: 1720 }, zeroWind: { first: 2118, second: 15829, third: 21693, tci: 1700 }, headwind10: { first: 2025, second: 14897, third: 20518, tci: 1700 }, headwind30: { first: 1839, second: 13447, third: 18232, tci: 1680 } },
            { temp: 5,   tailwind10: { first: 2415, second: 17839, third: 25384, tci: 1690 }, zeroWind: { first: 2137, second: 15629, third: 21736, tci: 1670 }, headwind10: { first: 2044, second: 14903, third: 20568, tci: 1670 }, headwind30: { first: 1859, second: 13466, third: 18291, tci: 1650 } },
            { temp: 10,  tailwind10: { first: 2434, second: 18420, third: 26561, tci: 1670 }, zeroWind: { first: 2156, second: 16148, third: 22805, tci: 1650 }, headwind10: { first: 2063, second: 15402, third: 21596, tci: 1640 }, headwind30: { first: 1878, second: 13926, third: 19247, tci: 1630 } }
        ]
    },
    {
        weight: 16000,
        data: [
            { temp: -54, tailwind10: { first: 2149, second: 17180, third: 23372, tci: 2140 }, zeroWind: { first: 1870, second: 14799, third: 19701, tci: 2120 }, headwind10: { first: 1778, second: 14018, third: 18522, tci: 2110 }, headwind30: { first: 1592, second: 12474, third: 16234, tci: 2090 } },
            { temp: -35, tailwind10: { first: 2228, second: 17015, third: 23548, tci: 1970 }, zeroWind: { first: 1949, second: 14742, third: 19944, tci: 1950 }, headwind10: { first: 1856, second: 13992, third: 18784, tci: 1940 }, headwind30: { first: 1671, second: 12518, third: 16540, tci: 1930 } },
            { temp: -30, tailwind10: { first: 2248, second: 16970, third: 23555, tci: 1930 }, zeroWind: { first: 1970, second: 14723, third: 19971, tci: 1910 }, headwind10: { first: 1877, second: 13985, third: 18820, tci: 1900 }, headwind30: { first: 1691, second: 12525, third: 16702, tci: 1890 } },
            { temp: -25, tailwind10: { first: 2268, second: 16933, third: 23713, tci: 1890 }, zeroWind: { first: 1990, second: 14711, third: 20134, tci: 1870 }, headwind10: { first: 1897, second: 13981, third: 18985, tci: 1860 }, headwind30: { first: 1711, second: 12536, third: 16753, tci: 1850 } },
            { temp: -20, tailwind10: { first: 2287, second: 16900, third: 23731, tci: 1850 }, zeroWind: { first: 2009, second: 14701, third: 20169, tci: 1830 }, headwind10: { first: 1916, second: 13978, third: 20025, tci: 1820 }, headwind30: { first: 1731, second: 12548, third: 16804, tci: 1810 } },
            { temp: -15, tailwind10: { first: 2308, second: 16867, third: 23750, tci: 1810 }, zeroWind: { first: 2029, second: 14691, third: 20337, tci: 1790 }, headwind10: { first: 1937, second: 13976, third: 19195, tci: 1790 }, headwind30: { first: 1751, second: 12560, third: 16975, tci: 1780 } },
            { temp: -10, tailwind10: { first: 2327, second: 16832, third: 23913, tci: 1780 }, zeroWind: { first: 2049, second: 14578, third: 20370, tci: 1760 }, headwind10: { first: 1956, second: 13971, third: 19233, tci: 1750 }, headwind30: { first: 1771, second: 12570, third: 17023, tci: 1740 } },
            { temp: -5,  tailwind10: { first: 2347, second: 16798, third: 23930, tci: 1740 }, zeroWind: { first: 2068, second: 14666, third: 20403, tci: 1730 }, headwind10: { first: 1976, second: 13966, third: 19271, tci: 1720 }, headwind30: { first: 1790, second: 12579, third: 17071, tci: 1710 } },
            { temp: 0,   tailwind10: { first: 2366, second: 16765, third: 23949, tci: 1710 }, zeroWind: { first: 2087, second: 14655, third: 20573, tci: 1690 }, headwind10: { first: 1995, second: 13962, third: 19442, tci: 1690 }, headwind30: { first: 1809, second: 12588, third: 17241, tci: 1680 } },
            { temp: 5,   tailwind10: { first: 2385, second: 16746, third: 24130, tci: 1680 }, zeroWind: { first: 2106, second: 14655, third: 20618, tci: 1660 }, headwind10: { first: 2014, second: 13968, third: 19489, tci: 1660 }, headwind30: { first: 1828, second: 12506, third: 17297, tci: 1650 } },
            { temp: 10,  tailwind10: { first: 2404, second: 17261, third: 25241, tci: 1660 }, zeroWind: { first: 2125, second: 15116, third: 21485, tci: 1640 }, headwind10: { first: 2033, second: 14411, third: 20328, tci: 1630 }, headwind30: { first: 1847, second: 13015, third: 18077, tci: 1620 } }
        ]
    },
    {
        weight: 15500,
        data: [
            { temp: -54, tailwind10: { first: 2121, second: 16122, third: 22035, tci: 2130 }, zeroWind: { first: 1842, second: 13870, third: 18519, tci: 2110 }, headwind10: { first: 1750, second: 13130, third: 17510, tci: 2100 }, headwind30: { first: 1564, second: 11666, third: 15312, tci: 2090 } },
            { temp: -35, tailwind10: { first: 2199, second: 15970, third: 22354, tci: 1960 }, zeroWind: { first: 1921, second: 13818, third: 18885, tci: 1940 }, headwind10: { first: 1828, second: 13110, third: 17773, tci: 1930 }, headwind30: { first: 1642, second: 11710, third: 15612, tci: 1920 } },
            { temp: -30, tailwind10: { first: 2219, second: 15928, third: 22363, tci: 1920 }, zeroWind: { first: 1941, second: 13801, third: 18912, tci: 1900 }, headwind10: { first: 1848, second: 13102, third: 17806, tci: 1890 }, headwind30: { first: 1662, second: 11717, third: 15773, tci: 1880 } },
            { temp: -25, tailwind10: { first: 2239, second: 15894, third: 22379, tci: 1880 }, zeroWind: { first: 1960, second: 13790, third: 19075, tci: 1860 }, headwind10: { first: 1868, second: 13098, third: 17970, tci: 1850 }, headwind30: { first: 1682, second: 11729, third: 15821, tci: 1840 } },
            { temp: -20, tailwind10: { first: 2258, second: 15863, third: 22542, tci: 1840 }, zeroWind: { first: 1980, second: 13781, third: 19110, tci: 1820 }, headwind10: { first: 1887, second: 13096, third: 18009, tci: 1820 }, headwind30: { first: 1702, second: 11741, third: 15871, tci: 1800 } },
            { temp: -15, tailwind10: { first: 2277, second: 15832, third: 22561, tci: 1800 }, zeroWind: { first: 1999, second: 13772, third: 19144, tci: 1790 }, headwind10: { first: 1906, second: 13094, third: 18048, tci: 1780 }, headwind30: { first: 1721, second: 11753, third: 16040, tci: 1770 } },
            { temp: -10, tailwind10: { first: 2297, second: 15800, third: 22577, tci: 1770 }, zeroWind: { first: 2019, second: 13761, third: 19311, tci: 1750 }, headwind10: { first: 1926, second: 13090, third: 18215, tci: 1750 }, headwind30: { first: 1740, second: 11762, third: 16087, tci: 1730 } },
            { temp: -5,  tailwind10: { first: 2316, second: 15769, third: 22743, tci: 1740 }, zeroWind: { first: 2038, second: 13750, third: 19344, tci: 1720 }, headwind10: { first: 1945, second: 13087, third: 18253, tci: 1710 }, headwind30: { first: 1759, second: 11772, third: 16134, tci: 1700 } },
            { temp: 0,   tailwind10: { first: 2335, second: 15739, third: 22762, tci: 1700 }, zeroWind: { first: 2057, second: 13741, third: 19377, tci: 1690 }, headwind10: { first: 1964, second: 13083, third: 18423, tci: 1680 }, headwind30: { first: 1778, second: 11781, third: 16304, tci: 1670 } },
            { temp: 5,   tailwind10: { first: 2354, second: 15721, third: 22944, tci: 1670 }, zeroWind: { first: 2075, second: 13741, third: 19557, tci: 1660 }, headwind10: { first: 1983, second: 13089, third: 18470, tci: 1650 }, headwind30: { first: 1797, second: 11799, third: 16358, tci: 1640 } },
            { temp: 10,  tailwind10: { first: 2372, second: 16177, third: 23845, tci: 1650 }, zeroWind: { first: 2094, second: 14150, third: 20373, tci: 1630 }, headwind10: { first: 2001, second: 13483, third: 19259, tci: 1630 }, headwind30: { first: 1816, second: 12162, third: 17092, tci: 1610 } }
        ]
    },
    {
        weight: 14500,
        data: [
            { temp: -54, tailwind10: { first: 2064, second: 14193, third: 19823, tci: 2110 }, zeroWind: { first: 1785, second: 12170, third: 16564, tci: 2090 }, headwind10: { first: 1693, second: 11507, third: 15522, tci: 2080 }, headwind30: { first: 1507, second: 10191, third: 13609, tci: 2070 } },
            { temp: -35, tailwind10: { first: 2139, second: 14062, third: 20010, tci: 1940 }, zeroWind: { first: 1861, second: 12130, third: 16931, tci: 1920 }, headwind10: { first: 1768, second: 11494, third: 15900, tci: 1920 }, headwind30: { first: 1583, second: 10234, third: 13898, tci: 1900 } },
            { temp: -30, tailwind10: { first: 2159, second: 14026, third: 20021, tci: 1900 }, zeroWind: { first: 1881, second: 12116, third: 16959, tci: 1880 }, headwind10: { first: 1788, second: 11487, third: 15931, tci: 1880 }, headwind30: { first: 1602, second: 10242, third: 13940, tci: 1860 } },
            { temp: -25, tailwind10: { first: 2178, second: 13997, third: 20181, tci: 1860 }, zeroWind: { first: 1900, second: 12107, third: 16990, tci: 1840 }, headwind10: { first: 1807, second: 11485, third: 15968, tci: 1840 }, headwind30: { first: 1621, second: 10253, third: 14102, tci: 1830 } },
            { temp: -20, tailwind10: { first: 2197, second: 13970, third: 20200, tci: 1820 }, zeroWind: { first: 1919, second: 12100, third: 17155, tci: 1810 }, headwind10: { first: 1826, second: 11485, third: 16133, tci: 1800 }, headwind30: { first: 1640, second: 10265, third: 14149, tci: 1790 } },
            { temp: -15, tailwind10: { first: 2216, second: 13943, third: 20219, tci: 1790 }, zeroWind: { first: 1938, second: 12093, third: 17188, tci: 1770 }, headwind10: { first: 1845, second: 11484, third: 16169, tci: 1770 }, headwind30: { first: 1659, second: 10276, third: 14315, tci: 1760 } },
            { temp: -10, tailwind10: { first: 2235, second: 13916, third: 20385, tci: 1750 }, zeroWind: { first: 1956, second: 12084, third: 17219, tci: 1740 }, headwind10: { first: 1863, second: 11481, third: 16336, tci: 1730 }, headwind30: { first: 1678, second: 10286, third: 14359, tci: 1720 } },
            { temp: -5,  tailwind10: { first: 2253, second: 13889, third: 20404, tci: 1720 }, zeroWind: { first: 1975, second: 12076, third: 17387, tci: 1700 }, headwind10: { first: 1882, second: 11479, third: 16372, tci: 1700 }, headwind30: { first: 1696, second: 10295, third: 14403, tci: 1690 } },
            { temp: 0,   tailwind10: { first: 2271, second: 13863, third: 20424, tci: 1690 }, zeroWind: { first: 1993, second: 12068, third: 17419, tci: 1670 }, headwind10: { first: 1900, second: 11477, third: 16408, tci: 1670 }, headwind30: { first: 1715, second: 10305, third: 14471, tci: 1660 } },
            { temp: 5,   tailwind10: { first: 2290, second: 13846, third: 20602, tci: 1660 }, zeroWind: { first: 2011, second: 12069, third: 17459, tci: 1640 }, headwind10: { first: 1918, second: 11483, third: 16585, tci: 1640 }, headwind30: { first: 1733, second: 10321, third: 14621, tci: 1630 } },
            { temp: 10,  tailwind10: { first: 2308, second: 14206, third: 21406, tci: 1630 }, zeroWind: { first: 2029, second: 12391, third: 18188, tci: 1620 }, headwind10: { first: 1936, second: 11794, third: 17156, tci: 1610 }, headwind30: { first: 1751, second: 10509, third: 15281, tci: 1600 } }
        ]
    },
    {
        weight: 13500,
        data: [
            { temp: -54, tailwind10: { first: 2004, second: 12477, third: 17692, tci: 2090 }, zeroWind: { first: 1726, second: 10600, third: 14804, tci: 2070 }, headwind10: { first: 1633, second: 10062, third: 13836, tci: 2070 }, headwind30: { first: 1447, second: 8977, third: 12073, tci: 2060 } },
            { temp: -35, tailwind10: { first: 2077, second: 12363, third: 17882, tci: 1920 }, zeroWind: { first: 1799, second: 10528, third: 15040, tci: 1910 }, headwind10: { first: 1706, second: 10054, third: 14084, tci: 1900 }, headwind30: { first: 1521, second: 8919, third: 12349, tci: 1890 } },
            { temp: -30, tailwind10: { first: 2096, second: 12332, third: 18036, tci: 1880 }, zeroWind: { first: 1818, second: 10615, third: 15194, tci: 1860 }, headwind10: { first: 1725, second: 10049, third: 14239, tci: 1860 }, headwind30: { first: 1539, second: 8927, third: 12388, tci: 1850 } },
            { temp: -25, tailwind10: { first: 2115, second: 12306, third: 18053, tci: 1850 }, zeroWind: { first: 1836, second: 10607, third: 15224, tci: 1630 }, headwind10: { first: 1743, second: 10048, third: 14273, tci: 1820 }, headwind30: { first: 1558, second: 8937, third: 12548, tci: 1810 } },
            { temp: -20, tailwind10: { first: 2133, second: 12283, third: 18072, tci: 1810 }, zeroWind: { first: 1855, second: 10602, third: 15255, tci: 1790 }, headwind10: { first: 1762, second: 10048, third: 14308, tci: 1790 }, headwind30: { first: 1576, second: 8948, third: 12591, tci: 1780 } },
            { temp: -15, tailwind10: { first: 2151, second: 12260, third: 18237, tci: 1770 }, zeroWind: { first: 1873, second: 10596, third: 15419, tci: 1760 }, headwind10: { first: 1780, second: 10047, third: 14471, tci: 1750 }, headwind30: { first: 1594, second: 8959, third: 12633, tci: 1740 } },
            { temp: -10, tailwind10: { first: 2169, second: 12236, third: 18256, tci: 1740 }, zeroWind: { first: 1891, second: 10589, third: 15450, tci: 1720 }, headwind10: { first: 1798, second: 10046, third: 14505, tci: 1720 }, headwind30: { first: 1612, second: 8969, third: 12796, tci: 1710 } },
            { temp: -5,  tailwind10: { first: 2187, second: 12213, third: 18275, tci: 1710 }, zeroWind: { first: 1909, second: 10583, third: 15481, tci: 1690 }, headwind10: { first: 1816, second: 10045, third: 14538, tci: 1690 }, headwind30: { first: 1630, second: 8978, third: 12837, tci: 1680 } },
            { temp: 0,   tailwind10: { first: 2205, second: 12191, third: 18445, tci: 1670 }, zeroWind: { first: 1926, second: 10577, third: 15648, tci: 1660 }, headwind10: { first: 1834, second: 10044, third: 14705, tci: 1660 }, headwind30: { first: 1648, second: 8988, third: 12878, tci: 1650 } },
            { temp: 5,   tailwind10: { first: 2222, second: 12177, third: 18472, tci: 1640 }, zeroWind: { first: 1944, second: 10577, third: 15685, tci: 1630 }, headwind10: { first: 1851, second: 10049, third: 14744, tci: 1630 }, headwind30: { first: 1666, second: 9002, third: 13049, tci: 1620 } },
            { temp: 10,  tailwind10: { first: 2240, second: 12458, third: 19197, tci: 1620 }, zeroWind: { first: 1961, second: 10831, third: 16208, tci: 1600 }, headwind10: { first: 1869, second: 10295, third: 15386, tci: 1600 }, headwind30: { first: 1683, second: 9230, third: 13521, tci: 1590 } }
        ]
    }
];

const singleEngineFlightPathDistances_2000ft_anti_ice_on = [
    {
        weight: 20000,
        data: [
            { temp: -54, tailwind10: { first: 2389, second: 29899, third: 38043, tci: 2260 }, zeroWind: { first: 2111, second: 25968, third: 32508, tci: 2220 }, headwind10: { first: 2018, second: 24689, third: 30653, tci: 2210 }, headwind30: { first: 1832, second: 22178, third: 27291, tci: 2180 } },
            { temp: -35, tailwind10: { first: 2478, second: 29555, third: 38261, tci: 2080 }, zeroWind: { first: 2200, second: 25812, third: 32857, tci: 2040 }, headwind10: { first: 2107, second: 24593, third: 31039, tci: 2030 }, headwind30: { first: 1922, second: 22197, third: 27637, tci: 2000 } },
            { temp: -30, tailwind10: { first: 2501, second: 29465, third: 38244, tci: 2030 }, zeroWind: { first: 2223, second: 25769, third: 32878, tci: 2000 }, headwind10: { first: 2130, second: 24564, third: 31198, tci: 1990 }, headwind30: { first: 1945, second: 22196, third: 27811, tci: 1960 } },
            { temp: -25, tailwind10: { first: 2524, second: 29394, third: 38391, tci: 1990 }, zeroWind: { first: 2246, second: 25740, third: 32913, tci: 1960 }, headwind10: { first: 2153, second: 24549, third: 31244, tci: 1940 }, headwind30: { first: 1967, second: 22207, third: 27877, tci: 1920 } },
            { temp: -20, tailwind10: { first: 2547, second: 29325, third: 38395, tci: 1950 }, zeroWind: { first: 2268, second: 25712, third: 33082, tci: 1920 }, headwind10: { first: 2176, second: 24535, third: 31290, tci: 1910 }, headwind30: { first: 1990, second: 22218, third: 28064, tci: 1890 } },
            { temp: -15, tailwind10: { first: 2569, second: 29251, third: 38541, tci: 1910 }, zeroWind: { first: 2291, second: 25687, third: 33112, tci: 1880 }, headwind10: { first: 2198, second: 24514, third: 31461, tci: 1870 }, headwind30: { first: 2012, second: 22223, third: 28124, tci: 1850 } },
            { temp: -10, tailwind10: { first: 2591, second: 29173, third: 38534, tci: 1870 }, zeroWind: { first: 2313, second: 25641, third: 33274, tci: 1840 }, headwind10: { first: 2220, second: 24489, third: 31496, tci: 1830 }, headwind30: { first: 2034, second: 22222, third: 28303, tci: 1810 } },
            { temp: -5,  tailwind10: { first: 2513, second: 29101, third: 38534, tci: 1840 }, zeroWind: { first: 2335, second: 25608, third: 33304, tci: 1810 }, headwind10: { first: 2242, second: 24468, third: 31670, tci: 1800 }, headwind30: { first: 2056, second: 22222, third: 28350, tci: 1780 } },
            { temp: 0,   tailwind10: { first: 2535, second: 29045, third: 38699, tci: 1800 }, zeroWind: { first: 2356, second: 25587, third: 33496, tci: 1770 }, headwind10: { first: 2263, second: 24459, third: 31721, tci: 1760 }, headwind30: { first: 2078, second: 22238, third: 28427, tci: 1750 } },
            { temp: 5,   tailwind10: { first: 2556, second: 29370, third: 39231, tci: 1770 }, zeroWind: { first: 2378, second: 25895, third: 33981, tci: 1740 }, headwind10: { first: 2285, second: 24762, third: 32341, tci: 1740 }, headwind30: { first: 2099, second: 22531, third: 29017, tci: 1720 } },
            { temp: 10,  tailwind10: { first: 2576, second: 32586, third: 44068, tci: 1740 }, zeroWind: { first: 2398, second: 28702, third: 38138, tci: 1740 }, headwind10: { first: 2305, second: 27438, third: 36191, tci: 1730 }, headwind30: { first: 2119, second: 24954, third: 32415, tci: 1710 } }
        ]
    },
    {
        weight: 19500,
        data: [
            { temp: -54, tailwind10: { first: 2366, second: 27902, third: 35893, tci: 2240 }, zeroWind: { first: 2086, second: 24227, third: 30629, tci: 2200 }, headwind10: { first: 1993, second: 23030, third: 28860, tci: 2190 }, headwind30: { first: 1808, second: 20576, third: 25551, tci: 2160 } },
            { temp: -35, tailwind10: { first: 2453, second: 27591, third: 35994, tci: 2060 }, zeroWind: { first: 2175, second: 24059, third: 30858, tci: 2020 }, headwind10: { first: 2082, second: 22947, third: 29253, tci: 2010 }, headwind30: { first: 1896, second: 20700, third: 26010, tci: 1990 } },
            { temp: -30, tailwind10: { first: 2476, second: 27510, third: 36128, tci: 2010 }, zeroWind: { first: 2197, second: 24051, third: 31014, tci: 1980 }, headwind10: { first: 2105, second: 22923, third: 29288, tci: 1970 }, headwind30: { first: 1919, second: 20702, third: 26185, tci: 1950 } },
            { temp: -25, tailwind10: { first: 2498, second: 27445, third: 36132, tci: 1970 }, zeroWind: { first: 2219, second: 24025, third: 31050, tci: 1940 }, headwind10: { first: 2127, second: 22910, third: 29462, tci: 1930 }, headwind30: { first: 1941, second: 20714, third: 26250, tci: 1910 } },
            { temp: -20, tailwind10: { first: 2521, second: 27382, third: 36287, tci: 1930 }, zeroWind: { first: 2242, second: 24001, third: 31087, tci: 1900 }, headwind10: { first: 2149, second: 22898, third: 29508, tci: 1890 }, headwind30: { first: 1964, second: 20725, third: 26314, tci: 1870 } },
            { temp: -15, tailwind10: { first: 2543, second: 27315, third: 36289, tci: 1890 }, zeroWind: { first: 2264, second: 23971, third: 31254, tci: 1860 }, headwind10: { first: 2171, second: 22880, third: 29681, tci: 1850 }, headwind30: { first: 1986, second: 20731, third: 26495, tci: 1840 } },
            { temp: -10, tailwind10: { first: 2564, second: 27244, third: 36287, tci: 1860 }, zeroWind: { first: 2286, second: 23938, third: 31280, tci: 1830 }, headwind10: { first: 2193, second: 22856, third: 29718, tci: 1820 }, headwind30: { first: 2008, second: 20732, third: 26550, tci: 1800 } },
            { temp: -5,  tailwind10: { first: 2586, second: 27179, third: 36442, tci: 1820 }, zeroWind: { first: 2308, second: 23909, third: 31450, tci: 1790 }, headwind10: { first: 2215, second: 22841, third: 29758, tci: 1780 }, headwind30: { first: 2029, second: 20736, third: 26732, tci: 1770 } },
            { temp: 0,   tailwind10: { first: 2607, second: 27128, third: 36460, tci: 1790 }, zeroWind: { first: 2329, second: 23891, third: 31493, tci: 1760 }, headwind10: { first: 2236, second: 22833, third: 29944, tci: 1750 }, headwind30: { first: 2051, second: 20750, third: 26797, tci: 1730 } },
            { temp: 5,   tailwind10: { first: 2628, second: 27413, third: 37102, tci: 1760 }, zeroWind: { first: 2350, second: 24163, third: 31951, tci: 1730 }, headwind10: { first: 2257, second: 23101, third: 30392, tci: 1720 }, headwind30: { first: 2072, second: 21010, third: 27225, tci: 1700 } },
            { temp: 10,  tailwind10: { first: 2648, second: 30223, third: 41383, tci: 1750 }, zeroWind: { first: 2370, second: 26619, third: 35759, tci: 1720 }, headwind10: { first: 2277, second: 25445, third: 33910, tci: 1710 }, headwind30: { first: 2092, second: 23134, third: 30325, tci: 1690 } }
        ]
    },
    {
        weight: 19000,
        data: [
            { temp: -54, tailwind10: { first: 2340, second: 26066, third: 33766, tci: 2220 }, zeroWind: { first: 2061, second: 22623, third: 28762, tci: 2180 }, headwind10: { first: 1969, second: 21500, third: 27197, tci: 2170 }, headwind30: { first: 1783, second: 19290, third: 24042, tci: 2150 } },
            { temp: -35, tailwind10: { first: 2427, second: 25782, third: 34027, tci: 2040 }, zeroWind: { first: 2149, second: 22500, third: 29125, tci: 2010 }, headwind10: { first: 2056, second: 21429, third: 27468, tci: 2000 }, headwind30: { first: 1871, second: 19318, third: 24498, tci: 1980 } },
            { temp: -30, tailwind10: { first: 2450, second: 25708, third: 34022, tci: 2000 }, zeroWind: { first: 2171, second: 22466, third: 29151, tci: 1970 }, headwind10: { first: 2079, second: 21407, third: 27632, tci: 1960 }, headwind30: { first: 1893, second: 19321, third: 24553, tci: 1940 } },
            { temp: -25, tailwind10: { first: 2472, second: 25649, third: 34176, tci: 1950 }, zeroWind: { first: 2194, second: 22444, third: 29321, tci: 1930 }, headwind10: { first: 2101, second: 21397, third: 27677, tci: 1920 }, headwind30: { first: 1915, second: 19333, third: 24737, tci: 1900 } },
            { temp: -20, tailwind10: { first: 2494, second: 25587, third: 34181, tci: 1910 }, zeroWind: { first: 2216, second: 22422, third: 29359, tci: 1890 }, headwind10: { first: 2123, second: 21386, third: 27852, tci: 1880 }, headwind30: { first: 1937, second: 19345, third: 24800, tci: 1860 } },
            { temp: -15, tailwind10: { first: 2516, second: 25531, third: 34340, tci: 1880 }, zeroWind: { first: 2237, second: 22395, third: 29391, tci: 1850 }, headwind10: { first: 2145, second: 21371, third: 27894, tci: 1840 }, headwind30: { first: 1959, second: 19352, third: 24981, tci: 1820 } },
            { temp: -10, tailwind10: { first: 2537, second: 25466, third: 34343, tci: 1840 }, zeroWind: { first: 2259, second: 22366, third: 29557, tci: 1810 }, headwind10: { first: 2166, second: 21352, third: 28065, tci: 1810 }, headwind30: { first: 1981, second: 19355, third: 25035, tci: 1790 } },
            { temp: -5,  tailwind10: { first: 2559, second: 25407, third: 34350, tci: 1810 }, zeroWind: { first: 2260, second: 22340, third: 29589, tci: 1780 }, headwind10: { first: 2187, second: 21337, third: 28106, tci: 1770 }, headwind30: { first: 2002, second: 19360, third: 25216, tci: 1750 } },
            { temp: 0,   tailwind10: { first: 2580, second: 25361, third: 34522, tci: 1770 }, zeroWind: { first: 2301, second: 22324, third: 29771, tci: 1750 }, headwind10: { first: 2209, second: 21331, third: 28156, tci: 1740 }, headwind30: { first: 2023, second: 19373, third: 25281, tci: 1720 } },
            { temp: 5,   tailwind10: { first: 2501, second: 25611, third: 34976, tci: 1740 }, zeroWind: { first: 2322, second: 22565, third: 30197, tci: 1720 }, headwind10: { first: 2229, second: 21569, third: 28709, tci: 1710 }, headwind30: { first: 2044, second: 19605, third: 25679, tci: 1690 } },
            { temp: 10,  tailwind10: { first: 2620, second: 28077, third: 38914, tci: 1730 }, zeroWind: { first: 2342, second: 24724, third: 33427, tci: 1700 }, headwind10: { first: 2249, second: 23630, third: 31809, tci: 1700 }, headwind30: { first: 2064, second: 21475, third: 28527, tci: 1680 } }
        ]
    },
    {
        weight: 18500,
        data: [
            { temp: -54, tailwind10: { first: 2315, second: 24373, third: 31921, tci: 2200 }, zeroWind: { first: 2036, second: 21141, third: 27143, tci: 2170 }, headwind10: { first: 1944, second: 20086, third: 25651, tci: 2160 }, headwind30: { first: 1758, second: 18007, third: 22637, tci: 2140 } },
            { temp: -35, tailwind10: { first: 2401, second: 24114, third: 32057, tci: 2020 }, zeroWind: { first: 2123, second: 21033, third: 27363, tci: 1990 }, headwind10: { first: 2030, second: 20025, third: 25927, tci: 1980 }, headwind30: { first: 1844, second: 18040, third: 23092, tci: 1960 } },
            { temp: -30, tailwind10: { first: 2423, second: 24047, third: 32201, tci: 1980 }, zeroWind: { first: 2145, second: 21002, third: 27543, tci: 1950 }, headwind10: { first: 2052, second: 20007, third: 26091, tci: 1940 }, headwind30: { first: 1867, second: 18044, third: 23146, tci: 1920 } },
            { temp: -25, tailwind10: { first: 2445, second: 23993, third: 32212, tci: 1940 }, zeroWind: { first: 2167, second: 20952, third: 27580, tci: 1910 }, headwind10: { first: 2074, second: 19998, third: 26137, tci: 1900 }, headwind30: { first: 1889, second: 18057, third: 23329, tci: 1890 } },
            { temp: -20, tailwind10: { first: 2467, second: 23940, third: 32372, tci: 1900 }, zeroWind: { first: 2189, second: 20963, third: 27752, tci: 1870 }, headwind10: { first: 2096, second: 19989, third: 26313, tci: 1860 }, headwind30: { first: 1910, second: 18068, third: 23390, tci: 1850 } },
            { temp: -15, tailwind10: { first: 2488, second: 23884, third: 32381, tci: 1860 }, zeroWind: { first: 2210, second: 20940, third: 27786, tci: 1840 }, headwind10: { first: 2117, second: 19976, third: 26355, tci: 1830 }, headwind30: { first: 1932, second: 18076, third: 23447, tci: 1810 } },
            { temp: -10, tailwind10: { first: 2509, second: 23826, third: 32387, tci: 1830 }, zeroWind: { first: 2231, second: 20913, third: 27954, tci: 1800 }, headwind10: { first: 2138, second: 19960, third: 26393, tci: 1790 }, headwind30: { first: 1953, second: 18080, third: 23624, tci: 1780 } },
            { temp: -5,  tailwind10: { first: 2531, second: 23772, third: 32548, tci: 1790 }, zeroWind: { first: 2252, second: 20891, third: 27987, tci: 1770 }, headwind10: { first: 2160, second: 19948, third: 26569, tci: 1760 }, headwind30: { first: 1974, second: 18087, third: 23679, tci: 1740 } },
            { temp: 0,   tailwind10: { first: 2552, second: 23730, third: 32570, tci: 1760 }, zeroWind: { first: 2273, second: 20877, third: 28030, tci: 1730 }, headwind10: { first: 2181, second: 19943, third: 26618, tci: 1730 }, headwind30: { first: 1995, second: 18100, third: 23869, tci: 1710 } },
            { temp: 5,   tailwind10: { first: 2572, second: 23950, third: 33146, tci: 1730 }, zeroWind: { first: 2294, second: 21091, third: 28568, tci: 1710 }, headwind10: { first: 2201, second: 20155, third: 27007, tci: 1700 }, headwind30: { first: 2016, second: 18307, third: 24241, tci: 1680 } },
            { temp: 10,  tailwind10: { first: 2592, second: 26122, third: 36483, tci: 1720 }, zeroWind: { first: 2313, second: 22994, third: 31544, tci: 1690 }, headwind10: { first: 2221, second: 21972, third: 29866, tci: 1680 }, headwind30: { first: 2035, second: 19957, third: 26741, tci: 1670 } }
        ]
    },
    {
        weight: 18000,
        data: [
            { temp: -54, tailwind10: { first: 2289, second: 22809, third: 30069, tci: 2190 }, zeroWind: { first: 2011, second: 19771, third: 25636, tci: 2160 }, headwind10: { first: 1918, second: 18778, third: 24090, tci: 2140 }, headwind30: { first: 1732, second: 16820, third: 21327, tci: 2120 } },
            { temp: -35, tailwind10: { first: 2374, second: 22572, third: 30359, tci: 2010 }, zeroWind: { first: 2096, second: 19675, third: 25883, tci: 1980 }, headwind10: { first: 2003, second: 18726, third: 24491, tci: 1970 }, headwind30: { first: 1818, second: 16856, third: 21780, tci: 1950 } },
            { temp: -30, tailwind10: { first: 2396, second: 22511, third: 30361, tci: 1970 }, zeroWind: { first: 2118, second: 19642, third: 26038, tci: 1940 }, headwind10: { first: 2025, second: 18711, third: 24528, tci: 1930 }, headwind30: { first: 1840, second: 16861, third: 21834, tci: 1910 } },
            { temp: -25, tailwind10: { first: 2418, second: 22461, third: 30521, tci: 1930 }, zeroWind: { first: 2140, second: 19630, third: 26062, tci: 1900 }, headwind10: { first: 2047, second: 18703, third: 24701, tci: 1890 }, headwind30: { first: 1861, second: 16874, third: 21894, tci: 1870 } },
            { temp: -20, tailwind10: { first: 2439, second: 22413, third: 30536, tci: 1890 }, zeroWind: { first: 2161, second: 19613, third: 26120, tci: 1860 }, headwind10: { first: 2068, second: 18696, third: 24746, tci: 1850 }, headwind30: { first: 1883, second: 16886, third: 22075, tci: 1840 } },
            { temp: -15, tailwind10: { first: 2461, second: 22362, third: 30547, tci: 1850 }, zeroWind: { first: 2162, second: 19592, third: 26290, tci: 1830 }, headwind10: { first: 2090, second: 18685, third: 24920, tci: 1820 }, headwind30: { first: 1904, second: 16894, third: 22130, tci: 1800 } },
            { temp: -10, tailwind10: { first: 2484, second: 22309, third: 30706, tci: 1810 }, zeroWind: { first: 2205, second: 19569, third: 26323, tci: 1790 }, headwind10: { first: 2112, second: 18672, third: 24960, tci: 1780 }, headwind30: { first: 1927, second: 16900, third: 22308, tci: 1770 } },
            { temp: -5,  tailwind10: { first: 2503, second: 22263, third: 30723, tci: 1780 }, zeroWind: { first: 2224, second: 19549, third: 26494, tci: 1760 }, headwind10: { first: 2131, second: 18660, third: 25001, tci: 1750 }, headwind30: { first: 1946, second: 16907, third: 22363, tci: 1730 } },
            { temp: 0,   tailwind10: { first: 2523, second: 22221, third: 30893, tci: 1750 }, zeroWind: { first: 2245, second: 19537, third: 26537, tci: 1720 }, headwind10: { first: 2152, second: 18657, third: 25184, tci: 1720 }, headwind30: { first: 1966, second: 16920, third: 22550, tci: 1700 } },
            { temp: 5,   tailwind10: { first: 2543, second: 22416, third: 31289, tci: 1720 }, zeroWind: { first: 2265, second: 19727, third: 26909, tci: 1690 }, headwind10: { first: 2172, second: 18846, third: 25549, tci: 1690 }, headwind30: { first: 1987, second: 17106, third: 22901, tci: 1670 } },
            { temp: 10,  tailwind10: { first: 2563, second: 24333, third: 34374, tci: 1700 }, zeroWind: { first: 2284, second: 21409, third: 29665, tci: 1680 }, headwind10: { first: 2192, second: 20452, third: 28061, tci: 1670 }, headwind30: { first: 2006, second: 18565, third: 25082, tci: 1650 } }
        ]
    },
    {
        weight: 17500,
        data: [
            { temp: -54, tailwind10: { first: 2263, second: 21360, third: 28470, tci: 2170 }, zeroWind: { first: 1985, second: 18500, third: 24104, tci: 2140 }, headwind10: { first: 1892, second: 17564, third: 22746, tci: 2130 }, headwind30: { first: 1706, second: 15718, third: 20105, tci: 2110 } },
            { temp: -35, tailwind10: { first: 2347, second: 21144, third: 28531, tci: 1990 }, zeroWind: { first: 2069, second: 18414, third: 24482, tci: 1960 }, headwind10: { first: 1976, second: 17521, third: 23147, tci: 1950 }, headwind30: { first: 1791, second: 15756, third: 20435, tci: 1940 } },
            { temp: -30, tailwind10: { first: 2369, second: 21088, third: 28781, tci: 1950 }, zeroWind: { first: 2091, second: 18391, third: 24512, tci: 1930 }, headwind10: { first: 1998, second: 17507, third: 23186, tci: 1920 }, headwind30: { first: 1812, second: 15762, third: 20607, tci: 1900 } },
            { temp: -25, tailwind10: { first: 2392, second: 21042, third: 28796, tci: 1910 }, zeroWind: { first: 2113, second: 18375, third: 24683, tci: 1890 }, headwind10: { first: 2020, second: 17501, third: 23360, tci: 1880 }, headwind30: { first: 1835, second: 15775, third: 20665, tci: 1860 } },
            { temp: -20, tailwind10: { first: 2412, second: 20997, third: 28960, tci: 1870 }, zeroWind: { first: 2133, second: 18359, third: 24721, tci: 1850 }, headwind10: { first: 2040, second: 17495, third: 23405, tci: 1840 }, headwind30: { first: 1855, second: 15787, third: 20844, tci: 1830 } },
            { temp: -15, tailwind10: { first: 2432, second: 20951, third: 28974, tci: 1840 }, zeroWind: { first: 2154, second: 18341, third: 24891, tci: 1810 }, headwind10: { first: 2061, second: 17486, third: 23446, tci: 1810 }, headwind30: { first: 1876, second: 15796, third: 20899, tci: 1790 } },
            { temp: -10, tailwind10: { first: 2452, second: 20902, third: 28986, tci: 1800 }, zeroWind: { first: 2174, second: 18320, third: 24924, tci: 1780 }, headwind10: { first: 2081, second: 17474, third: 23618, tci: 1770 }, headwind30: { first: 1896, second: 15802, third: 21076, tci: 1760 } },
            { temp: -5,  tailwind10: { first: 2474, second: 20857, third: 29152, tci: 1770 }, zeroWind: { first: 2195, second: 18303, third: 24959, tci: 1750 }, headwind10: { first: 2103, second: 17465, third: 23660, tci: 1740 }, headwind30: { first: 1917, second: 15810, third: 21130, tci: 1720 } },
            { temp: 0,   tailwind10: { first: 2494, second: 20822, third: 29175, tci: 1730 }, zeroWind: { first: 2216, second: 18292, third: 25141, tci: 1710 }, headwind10: { first: 2123, second: 17463, third: 23843, tci: 1710 }, headwind30: { first: 1937, second: 15823, third: 21189, tci: 1690 } },
            { temp: 5,   tailwind10: { first: 2514, second: 20995, third: 29546, tci: 1700 }, zeroWind: { first: 2236, second: 18462, third: 25491, tci: 1680 }, headwind10: { first: 2143, second: 17631, third: 24187, tci: 1680 }, headwind30: { first: 1957, second: 15990, third: 21518, tci: 1660 } },
            { temp: 10,  tailwind10: { first: 2531, second: 22689, third: 32412, tci: 1690 }, zeroWind: { first: 2253, second: 19950, third: 27915, tci: 1670 }, headwind10: { first: 2160, second: 19053, third: 26378, tci: 1660 }, headwind30: { first: 1975, second: 17283, third: 23663, tci: 1640 } }
        ]
    },
    {
        weight: 17000,
        data: [
            { temp: -54, tailwind10: { first: 2237, second: 20014, third: 26976, tci: 2160 }, zeroWind: { first: 1958, second: 17318, third: 22766, tci: 2130 }, headwind10: { first: 1866, second: 16435, third: 21488, tci: 2120 }, headwind30: { first: 1680, second: 14692, third: 18959, tci: 2100 } },
            { temp: -35, tailwind10: { first: 2320, second: 19816, third: 27148, tci: 1980 }, zeroWind: { first: 2041, second: 17242, third: 23170, tci: 1960 }, headwind10: { first: 1949, second: 16398, third: 21890, tci: 1950 }, headwind30: { first: 1763, second: 14732, third: 19284, tci: 1930 } },
            { temp: -30, tailwind10: { first: 2341, second: 19764, third: 27156, tci: 1940 }, zeroWind: { first: 2063, second: 17221, third: 23201, tci: 1920 }, headwind10: { first: 1970, second: 16387, third: 21928, tci: 1910 }, headwind30: { first: 1784, second: 14739, third: 19455, tci: 1890 } },
            { temp: -25, tailwind10: { first: 2362, second: 19722, third: 27319, tci: 1900 }, zeroWind: { first: 2084, second: 17206, third: 23238, tci: 1880 }, headwind10: { first: 1991, second: 16382, third: 21972, tci: 1870 }, headwind30: { first: 1805, second: 14751, third: 19512, tci: 1850 } },
            { temp: -20, tailwind10: { first: 2383, second: 19681, third: 27337, tci: 1860 }, zeroWind: { first: 2105, second: 17193, third: 23409, tci: 1840 }, headwind10: { first: 2012, second: 16376, third: 22147, tci: 1830 }, headwind30: { first: 1826, second: 14763, third: 19691, tci: 1820 } },
            { temp: -15, tailwind10: { first: 2404, second: 19638, third: 27501, tci: 1830 }, zeroWind: { first: 2125, second: 17177, third: 23444, tci: 1800 }, headwind10: { first: 2033, second: 16369, third: 22188, tci: 1800 }, headwind30: { first: 1847, second: 14773, third: 19745, tci: 1780 } },
            { temp: -10, tailwind10: { first: 2424, second: 19594, third: 27515, tci: 1790 }, zeroWind: { first: 2146, second: 17158, third: 23614, tci: 1770 }, headwind10: { first: 2053, second: 16359, third: 22361, tci: 1760 }, headwind30: { first: 1867, second: 14780, third: 19796, tci: 1750 } },
            { temp: -5,  tailwind10: { first: 2444, second: 19552, third: 27531, tci: 1760 }, zeroWind: { first: 2166, second: 17142, third: 23650, tci: 1740 }, headwind10: { first: 2073, second: 16359, third: 22402, tci: 1730 }, headwind30: { first: 1888, second: 14788, third: 19974, tci: 1720 } },
            { temp: 0,   tailwind10: { first: 2465, second: 19520, third: 27708, tci: 1720 }, zeroWind: { first: 2186, second: 17133, third: 23691, tci: 1700 }, headwind10: { first: 2093, second: 16350, third: 22449, tci: 1700 }, headwind30: { first: 1908, second: 14801, third: 20031, tci: 1680 } },
            { temp: 5,   tailwind10: { first: 2484, second: 19673, third: 28058, tci: 1690 }, zeroWind: { first: 2206, second: 17255, third: 24162, tci: 1670 }, headwind10: { first: 2113, second: 16501, third: 22772, tci: 1670 }, headwind30: { first: 1928, second: 14951, third: 20341, tci: 1650 } },
            { temp: 10,  tailwind10: { first: 2503, second: 21175, third: 30579, tci: 1680 }, zeroWind: { first: 2225, second: 18605, third: 26279, tci: 1650 }, headwind10: { first: 2132, second: 17763, third: 24943, tci: 1650 }, headwind30: { first: 1947, second: 16099, third: 22214, tci: 1630 } }
        ]
    },
    {
        weight: 16500,
        data: [
            { temp: -54, tailwind10: { first: 2210, second: 18761, third: 25436, tci: 2140 }, zeroWind: { first: 1931, second: 16216, third: 21554, tci: 2120 }, headwind10: { first: 1839, second: 15382, third: 20306, tci: 2110 }, headwind30: { first: 1653, second: 13734, third: 17882, tci: 2090 } },
            { temp: -35, tailwind10: { first: 2292, second: 18578, third: 25757, tci: 1970 }, zeroWind: { first: 2013, second: 16148, third: 21805, tci: 1950 }, headwind10: { first: 1921, second: 15351, third: 20582, tci: 1940 }, headwind30: { first: 1735, second: 13774, third: 18202, tci: 1920 } },
            { temp: -30, tailwind10: { first: 2313, second: 18531, third: 25768, tci: 1930 }, zeroWind: { first: 2034, second: 16129, third: 21986, tci: 1910 }, headwind10: { first: 1942, second: 15341, third: 20747, tci: 1900 }, headwind30: { first: 1756, second: 13783, third: 18374, tci: 1880 } },
            { temp: -25, tailwind10: { first: 2333, second: 18492, third: 25786, tci: 1890 }, zeroWind: { first: 2055, second: 16117, third: 22005, tci: 1870 }, headwind10: { first: 1962, second: 15337, third: 20791, tci: 1860 }, headwind30: { first: 1777, second: 13795, third: 18429, tci: 1850 } },
            { temp: -20, tailwind10: { first: 2354, second: 18454, third: 25951, tci: 1850 }, zeroWind: { first: 2076, second: 16104, third: 22177, tci: 1830 }, headwind10: { first: 1983, second: 13533, third: 20964, tci: 1820 }, headwind30: { first: 1797, second: 13807, third: 18484, tci: 1810 } },
            { temp: -15, tailwind10: { first: 2374, second: 18417, third: 25971, tci: 1810 }, zeroWind: { first: 2096, second: 16090, third: 22212, tci: 1790 }, headwind10: { first: 2003, second: 15326, third: 21006, tci: 1790 }, headwind30: { first: 1818, second: 13817, third: 18659, tci: 1770 } },
            { temp: -10, tailwind10: { first: 2395, second: 18373, third: 26133, tci: 1780 }, zeroWind: { first: 2116, second: 16074, third: 22246, tci: 1760 }, headwind10: { first: 2024, second: 15318, third: 21045, tci: 1750 }, headwind30: { first: 1838, second: 13824, third: 18709, tci: 1740 } },
            { temp: -5,  tailwind10: { first: 2416, second: 18336, third: 26152, tci: 1750 }, zeroWind: { first: 2137, second: 16060, third: 22419, tci: 1730 }, headwind10: { first: 2044, second: 15312, third: 21219, tci: 1720 }, headwind30: { first: 1859, second: 13833, third: 18885, tci: 1710 } },
            { temp: 0,   tailwind10: { first: 2434, second: 18306, third: 26177, tci: 1710 }, zeroWind: { first: 2156, second: 16052, third: 22460, tci: 1690 }, headwind10: { first: 2063, second: 15311, third: 21265, tci: 1690 }, headwind30: { first: 1878, second: 13846, third: 18940, tci: 1680 } },
            { temp: 5,   tailwind10: { first: 2455, second: 18442, third: 26509, tci: 1680 }, zeroWind: { first: 2177, second: 16187, third: 22773, tci: 1670 }, headwind10: { first: 2084, second: 15447, third: 21572, tci: 1660 }, headwind30: { first: 1898, second: 13981, third: 19236, tci: 1650 } },
            { temp: 10,  tailwind10: { first: 2473, second: 19775, third: 28862, tci: 1660 }, zeroWind: { first: 2194, second: 17360, third: 24742, tci: 1640 }, headwind10: { first: 2102, second: 16568, third: 23466, tci: 1640 }, headwind30: { first: 1916, second: 15001, third: 20983, tci: 1630 } }
        ]
    },
    {
        weight: 16000,
        data: [
            { temp: -54, tailwind10: { first: 2182, second: 17590, third: 24120, tci: 2130 }, zeroWind: { first: 1904, second: 15187, third: 20391, tci: 2110 }, headwind10: { first: 1811, second: 14398, third: 19194, tci: 2100 }, headwind30: { first: 1526, second: 12839, third: 16869, tci: 2080 } },
            { temp: -35, tailwind10: { first: 2263, second: 17422, third: 24305, tci: 1960 }, zeroWind: { first: 1985, second: 15126, third: 20644, tci: 1940 }, headwind10: { first: 1892, second: 14372, third: 19469, tci: 1930 }, headwind30: { first: 1706, second: 12880, third: 17185, tci: 1920 } },
            { temp: -30, tailwind10: { first: 2284, second: 17378, third: 24462, tci: 1920 }, zeroWind: { first: 2005, second: 15109, third: 20808, tci: 1900 }, headwind10: { first: 1913, second: 14363, third: 19635, tci: 1890 }, headwind30: { first: 1727, second: 12889, third: 17355, tci: 1880 } },
            { temp: -25, tailwind10: { first: 2304, second: 17342, third: 24480, tci: 1880 }, zeroWind: { first: 2026, second: 15097, third: 20845, tci: 1860 }, headwind10: { first: 1933, second: 14360, third: 19677, tci: 1850 }, headwind30: { first: 1748, second: 12901, third: 17407, tci: 1840 } },
            { temp: -20, tailwind10: { first: 2325, second: 17307, third: 24499, tci: 1840 }, zeroWind: { first: 2046, second: 15086, third: 20882, tci: 1620 }, headwind10: { first: 1953, second: 14356, third: 19719, tci: 1810 }, headwind30: { first: 1768, second: 12913, third: 17460, tci: 1800 } },
            { temp: -15, tailwind10: { first: 2346, second: 17270, third: 24656, tci: 1800 }, zeroWind: { first: 2067, second: 15073, third: 21052, tci: 1790 }, headwind10: { first: 1974, second: 14351, third: 19891, tci: 1780 }, headwind30: { first: 1789, second: 12923, third: 17634, tci: 1770 } },
            { temp: -10, tailwind10: { first: 2365, second: 17233, third: 24683, tci: 1770 }, zeroWind: { first: 2086, second: 15059, third: 21086, tci: 1750 }, headwind10: { first: 1993, second: 14344, third: 19930, tci: 1740 }, headwind30: { first: 1808, second: 12930, third: 17683, tci: 1730 } },
            { temp: -5,  tailwind10: { first: 2384, second: 17198, third: 24853, tci: 1740 }, zeroWind: { first: 2106, second: 15046, third: 21121, tci: 1720 }, headwind10: { first: 2013, second: 14339, third: 19969, tci: 1710 }, headwind30: { first: 1828, second: 12939, third: 17859, tci: 1700 } },
            { temp: 0,   tailwind10: { first: 2404, second: 17170, third: 24880, tci: 1700 }, zeroWind: { first: 2125, second: 15039, third: 21300, tci: 1690 }, headwind10: { first: 2033, second: 14339, third: 20149, tci: 1680 }, headwind30: { first: 1847, second: 12952, third: 17913, tci: 1670 } },
            { temp: 5,   tailwind10: { first: 2423, second: 17291, third: 25194, tci: 1670 }, zeroWind: { first: 2145, second: 15161, third: 21597, tci: 1660 }, headwind10: { first: 2052, second: 14460, third: 20441, tci: 1650 }, headwind30: { first: 1866, second: 13074, third: 18194, tci: 1640 } },
            { temp: 10,  tailwind10: { first: 2441, second: 18476, third: 27247, tci: 1650 }, zeroWind: { first: 2163, second: 16204, third: 23438, tci: 1640 }, headwind10: { first: 2070, second: 15458, third: 22076, tci: 1630 }, headwind30: { first: 1885, second: 13981, third: 19700, tci: 1620 } }
        ]
    },
    {
        weight: 15500,
        data: [
            { temp: -54, tailwind10: { first: 2154, second: 16495, third: 22740, tci: 2120 }, zeroWind: { first: 1876, second: 14222, third: 19169, tci: 2100 }, headwind10: { first: 1783, second: 13475, third: 18024, tci: 2090 }, headwind30: { first: 1597, second: 11999, third: 15799, tci: 2070 } },
            { temp: -35, tailwind10: { first: 2234, second: 16337, third: 23068, tci: 1950 }, zeroWind: { first: 1955, second: 14167, third: 19549, tci: 1930 }, headwind10: { first: 1863, second: 13454, third: 18419, tci: 1920 }, headwind30: { first: 1577, second: 12042, third: 16223, tci: 1910 } },
            { temp: -30, tailwind10: { first: 2254, second: 16298, third: 23084, tci: 1910 }, zeroWind: { first: 1976, second: 14152, third: 19581, tci: 1690 }, headwind10: { first: 1883, second: 13446, third: 18456, tci: 1880 }, headwind30: { first: 1597, second: 12050, third: 16271, tci: 1870 } },
            { temp: -25, tailwind10: { first: 2274, second: 16265, third: 23249, tci: 1870 }, zeroWind: { first: 1996, second: 14142, third: 19750, tci: 1850 }, headwind10: { first: 1903, second: 13447, third: 18630, tci: 1840 }, headwind30: { first: 1718, second: 12062, third: 16443, tci: 1830 } },
            { temp: -20, tailwind10: { first: 2294, second: 16232, third: 23270, tci: 1830 }, zeroWind: { first: 2016, second: 14132, third: 19786, tci: 1810 }, headwind10: { first: 1923, second: 13441, third: 18667, tci: 1810 }, headwind30: { first: 1738, second: 12074, third: 16495, tci: 1790 } },
            { temp: -15, tailwind10: { first: 2314, second: 16199, third: 23288, tci: 1800 }, zeroWind: { first: 2036, second: 14120, third: 19819, tci: 1780 }, headwind10: { first: 1943, second: 13437, third: 18707, tci: 1770 }, headwind30: { first: 1757, second: 12084, third: 16667, tci: 1760 } },
            { temp: -10, tailwind10: { first: 2335, second: 16164, third: 23456, tci: 1760 }, zeroWind: { first: 2056, second: 14108, third: 19990, tci: 1740 }, headwind10: { first: 1963, second: 13431, third: 18877, tci: 1740 }, headwind30: { first: 1778, second: 12092, third: 16715, tci: 1730 } },
            { temp: -5,  tailwind10: { first: 2353, second: 16132, third: 23476, tci: 1730 }, zeroWind: { first: 2075, second: 14096, third: 20024, tci: 1710 }, headwind10: { first: 1982, second: 13427, third: 18917, tci: 1700 }, headwind30: { first: 1796, second: 12101, third: 16764, tci: 1690 } },
            { temp: 0,   tailwind10: { first: 2372, second: 16106, third: 23502, tci: 1700 }, zeroWind: { first: 2094, second: 14090, third: 20203, tci: 1680 }, headwind10: { first: 2001, second: 13427, third: 19096, tci: 1670 }, headwind30: { first: 1816, second: 12113, third: 16942, tci: 1660 } },
            { temp: 5,   tailwind10: { first: 2391, second: 16213, third: 23801, tci: 1670 }, zeroWind: { first: 2113, second: 14199, third: 20487, tci: 1650 }, headwind10: { first: 2020, second: 13536, third: 19374, tci: 1640 }, headwind30: { first: 1835, second: 12223, third: 17209, tci: 1630 } },
            { temp: 10,  tailwind10: { first: 2410, second: 17268, third: 25879, tci: 1640 }, zeroWind: { first: 2131, second: 15127, third: 22074, tci: 1630 }, headwind10: { first: 2039, second: 14424, third: 20901, tci: 1620 }, headwind30: { first: 1853, second: 13032, third: 18519, tci: 1610 } }
        ]
    },
    {
        weight: 14500,
        data: [
            { temp: -54, tailwind10: { first: 2096, second: 14500, third: 20458, tci: 2100 }, zeroWind: { first: 1818, second: 12464, third: 17152, tci: 2080 }, headwind10: { first: 1725, second: 11795, third: 16094, tci: 2070 }, headwind30: { first: 1540, second: 10469, third: 14038, tci: 2060 } },
            { temp: -35, tailwind10: { first: 2173, second: 14366, third: 20657, tci: 1930 }, zeroWind: { first: 1895, second: 12420, third: 17401, tci: 1910 }, headwind10: { first: 1802, second: 11780, third: 16484, tci: 1900 }, headwind30: { first: 1617, second: 10511, third: 14451, tci: 1890 } },
            { temp: -30, tailwind10: { first: 2193, second: 14332, third: 20572, tci: 1890 }, zeroWind: { first: 1915, second: 12408, third: 17554, tci: 1870 }, headwind10: { first: 1822, second: 11775, third: 16520, tci: 1870 }, headwind30: { first: 1636, second: 10520, third: 14497, tci: 1850 } },
            { temp: -25, tailwind10: { first: 2213, second: 14303, third: 20837, tci: 1850 }, zeroWind: { first: 1934, second: 12400, third: 17596, tci: 1830 }, headwind10: { first: 1842, second: 11773, third: 16559, tci: 1830 }, headwind30: { first: 1656, second: 10532, third: 14665, tci: 1820 } },
            { temp: -20, tailwind10: { first: 2233, second: 14275, third: 20858, tci: 1810 }, zeroWind: { first: 1955, second: 12392, third: 17767, tci: 1800 }, headwind10: { first: 1862, second: 11772, third: 16729, tci: 1800 }, headwind30: { first: 1676, second: 10543, third: 14714, tci: 1780 } },
            { temp: -15, tailwind10: { first: 2251, second: 14246, third: 21025, tci: 1780 }, zeroWind: { first: 1973, second: 12382, third: 17801, tci: 1760 }, headwind10: { first: 1880, second: 11769, third: 16766, tci: 1760 }, headwind30: { first: 1695, second: 10553, third: 14760, tci: 1750 } },
            { temp: -10, tailwind10: { first: 2270, second: 14216, third: 21045, tci: 1740 }, zeroWind: { first: 1992, second: 12372, third: 17833, tci: 1730 }, headwind10: { first: 1899, second: 11765, third: 16803, tci: 1720 }, headwind30: { first: 1714, second: 10558, third: 14926, tci: 1710 } },
            { temp: -5,  tailwind10: { first: 2289, second: 14189, third: 21066, tci: 1710 }, zeroWind: { first: 2011, second: 12363, third: 18005, tci: 1700 }, headwind10: { first: 1918, second: 11762, third: 16974, tci: 1690 }, headwind30: { first: 1732, second: 10571, third: 14975, tci: 1680 } },
            { temp: 0,   tailwind10: { first: 2308, second: 14167, third: 21244, tci: 1680 }, zeroWind: { first: 2029, second: 12359, third: 18043, tci: 1660 }, headwind10: { first: 1937, second: 11763, third: 17016, tci: 1660 }, headwind30: { first: 1751, second: 10583, third: 15023, tci: 1650 } },
            { temp: 5,   tailwind10: { first: 2326, second: 14251, third: 21519, tci: 1650 }, zeroWind: { first: 2048, second: 12446, third: 18301, tci: 1630 }, headwind10: { first: 1955, second: 11851, third: 17270, tci: 1630 }, headwind30: { first: 1769, second: 10672, third: 15257, tci: 1620 } },
            { temp: 10,  tailwind10: { first: 2344, second: 15088, third: 23073, tci: 1630 }, zeroWind: { first: 2066, second: 13183, third: 19700, tci: 1610 }, headwind10: { first: 1973, second: 12556, third: 18616, tci: 1610 }, headwind30: { first: 1787, second: 11314, third: 16511, tci: 1600 } }
        ]
    },
    {
        weight: 13500,
        data: [
            { temp: -54, tailwind10: { first: 2036, second: 12730, third: 18268, tci: 2080 }, zeroWind: { first: 1757, second: 10903, third: 15338, tci: 2060 }, headwind10: { first: 1664, second: 10302, third: 14356, tci: 2050 }, headwind30: { first: 1479, second: 9109, third: 12451, tci: 2040 } },
            { temp: -35, tailwind10: { first: 2110, second: 12615, third: 18469, tci: 1910 }, zeroWind: { first: 1832, second: 10868, third: 15584, tci: 1900 }, headwind10: { first: 1739, second: 10292, third: 14614, tci: 1890 }, headwind30: { first: 1553, second: 9151, third: 12854, tci: 1880 } },
            { temp: -30, tailwind10: { first: 2129, second: 12585, third: 18530, tci: 1870 }, zeroWind: { first: 1851, second: 10858, third: 15613, tci: 1860 }, headwind10: { first: 1758, second: 10287, third: 14774, tci: 1850 }, headwind30: { first: 1573, second: 9160, third: 12897, tci: 1840 } },
            { temp: -25, tailwind10: { first: 2148, second: 12560, third: 18550, tci: 1830 }, zeroWind: { first: 1870, second: 10851, third: 15779, tci: 1620 }, headwind10: { first: 1777, second: 10288, third: 14813, tci: 1810 }, headwind30: { first: 1591, second: 9171, third: 12941, tci: 1800 } },
            { temp: -20, tailwind10: { first: 2167, second: 12535, third: 18670, tci: 1800 }, zeroWind: { first: 1889, second: 10844, third: 15812, tci: 1780 }, headwind10: { first: 1796, second: 10287, third: 14849, tci: 1780 }, headwind30: { first: 1610, second: 9182, third: 13107, tci: 1770 } },
            { temp: -15, tailwind10: { first: 2185, second: 12510, third: 18839, tci: 1760 }, zeroWind: { first: 1907, second: 10837, third: 15844, tci: 1750 }, headwind10: { first: 1814, second: 10285, third: 15017, tci: 1740 }, headwind30: { first: 1629, second: 9191, third: 13150, tci: 1730 } },
            { temp: -10, tailwind10: { first: 2204, second: 12485, third: 18859, tci: 1730 }, zeroWind: { first: 1925, second: 10829, third: 16012, tci: 1710 }, headwind10: { first: 1833, second: 10283, third: 15052, tci: 1710 }, headwind30: { first: 1647, second: 9200, third: 13192, tci: 1700 } },
            { temp: -5,  tailwind10: { first: 2222, second: 12462, third: 18880, tci: 1700 }, zeroWind: { first: 1944, second: 10822, third: 16044, tci: 1680 }, headwind10: { first: 1851, second: 10281, third: 15087, tci: 1680 }, headwind30: { first: 1665, second: 9209, third: 13380, tci: 1670 } },
            { temp: 0,   tailwind10: { first: 2240, second: 12442, third: 19057, tci: 1660 }, zeroWind: { first: 1962, second: 10818, third: 16079, tci: 1650 }, headwind10: { first: 1869, second: 10283, third: 15261, tci: 1650 }, headwind30: { first: 1683, second: 9221, third: 13405, tci: 1640 } },
            { temp: 5,   tailwind10: { first: 2258, second: 12509, third: 19309, tci: 1640 }, zeroWind: { first: 1979, second: 10889, third: 16318, tci: 1620 }, headwind10: { first: 1887, second: 10354, third: 15360, tci: 1620 }, headwind30: { first: 1701, second: 9294, third: 13631, tci: 1610 } },
            { temp: 10,  tailwind10: { first: 2275, second: 13173, third: 20541, tci: 1610 }, zeroWind: { first: 1997, second: 11474, third: 17567, tci: 1600 }, headwind10: { first: 1904, second: 10914, third: 16563, tci: 1590 }, headwind30: { first: 1719, second: 9804, third: 14617, tci: 1580 } }
        ]
    }
];

const singleEngineFlightPathDistances_3000ft_anti_ice_on = [
    {
        weight: 19000,
        data: [
            { temp: -54, tailwind10: { first: 2402, second: 28820, third: 37187, tci: 2230 }, zeroWind: { first: 2124, second: 25074, third: 31814, tci: 2190 }, headwind10: { first: 2031, second: 23854, third: 30008, tci: 2180 }, headwind30: { first: 1846, second: 21454, third: 26742, tci: 2160 } },
            { temp: -35, tailwind10: { first: 2493, second: 28513, third: 37590, tci: 2050 }, zeroWind: { first: 2214, second: 24938, third: 32185, tci: 2020 }, headwind10: { first: 2121, second: 23773, third: 30540, tci: 2010 }, headwind30: { first: 1936, second: 21479, third: 27217, tci: 1980 } },
            { temp: -30, tailwind10: { first: 2516, second: 28436, third: 37587, tci: 2010 }, zeroWind: { first: 2237, second: 24903, third: 32350, tci: 1970 }, headwind10: { first: 2145, second: 23751, third: 30582, tci: 1960 }, headwind30: { first: 1959, second: 21484, third: 27279, tci: 1940 } },
            { temp: -25, tailwind10: { first: 2539, second: 28368, third: 37741, tci: 1970 }, zeroWind: { first: 2260, second: 24875, third: 32388, tci: 1930 }, headwind10: { first: 2167, second: 23736, third: 30761, tci: 1920 }, headwind30: { first: 1982, second: 21495, third: 27470, tci: 1900 } },
            { temp: -20, tailwind10: { first: 2562, second: 28302, third: 37749, tci: 1930 }, zeroWind: { first: 2283, second: 24848, third: 32564, tci: 1900 }, headwind10: { first: 2191, second: 23722, third: 30808, tci: 1890 }, headwind30: { first: 2005, second: 21504, third: 27536, tci: 1870 } },
            { temp: -15, tailwind10: { first: 2584, second: 28228, third: 37901, tci: 1890 }, zeroWind: { first: 2305, second: 24814, third: 32595, tci: 1860 }, headwind10: { first: 2213, second: 23700, third: 30983, tci: 1850 }, headwind30: { first: 2027, second: 21506, third: 27721, tci: 1830 } },
            { temp: -10, tailwind10: { first: 2606, second: 28156, third: 37904, tci: 1850 }, zeroWind: { first: 2328, second: 24780, third: 32766, tci: 1820 }, headwind10: { first: 2235, second: 23676, third: 31025, tci: 1810 }, headwind30: { first: 2049, second: 21508, third: 27780, tci: 1790 } },
            { temp: -5,  tailwind10: { first: 2628, second: 28094, third: 37916, tci: 1820 }, zeroWind: { first: 2350, second: 24754, third: 32805, tci: 1790 }, headwind10: { first: 2257, second: 23664, third: 31072, tci: 1780 }, headwind30: { first: 2071, second: 21516, third: 27972, tci: 1760 } },
            { temp: 0,   tailwind10: { first: 2650, second: 28051, third: 38100, tci: 1780 }, zeroWind: { first: 2371, second: 24743, third: 32859, tci: 1750 }, headwind10: { first: 2279, second: 23666, third: 31275, tci: 1750 }, headwind30: { first: 2093, second: 21536, third: 28047, tci: 1730 } },
            { temp: 5,   tailwind10: { first: 2671, second: 29690, third: 40664, tci: 1760 }, zeroWind: { first: 2392, second: 26190, third: 35156, tci: 1730 }, headwind10: { first: 2299, second: 25048, third: 33343, tci: 1730 }, headwind30: { first: 2114, second: 22802, third: 29959, tci: 1710 } },
            { temp: 10,  tailwind10: { first: 2890, second: 34029, third: 47065, tci: 1770 }, zeroWind: { first: 2412, second: 29958, third: 40692, tci: 1730 }, headwind10: { first: 2319, second: 28848, third: 36510, tci: 1720 }, headwind30: { first: 2133, second: 26057, third: 34559, tci: 1700 } }
        ]
    },
    {
        weight: 18500,
        data: [
            { temp: -54, tailwind10: { first: 2352, second: 25124, third: 33041, tci: 2200 }, zeroWind: { first: 2073, second: 21638, third: 28159, tci: 2160 }, headwind10: { first: 1981, second: 20765, third: 26546, tci: 2150 }, headwind30: { first: 1795, second: 18651, third: 23572, tci: 2130 } },
            { temp: -35, tailwind10: { first: 2440, second: 24866, third: 33329, tci: 2020 }, zeroWind: { first: 2161, second: 21729, third: 28549, tci: 1990 }, headwind10: { first: 2069, second: 20702, third: 27058, tci: 1990 }, headwind30: { first: 1883, second: 18682, third: 24037, tci: 1960 } },
            { temp: -30, tailwind10: { first: 2462, second: 24802, third: 33481, tci: 1970 }, zeroWind: { first: 2184, second: 21701, third: 28718, tci: 1940 }, headwind10: { first: 2091, second: 20688, third: 27102, tci: 1940 }, headwind30: { first: 1906, second: 18590, third: 24219, tci: 1920 } },
            { temp: -25, tailwind10: { first: 2485, second: 24745, third: 33494, tci: 1930 }, zeroWind: { first: 2206, second: 21579, third: 28757, tci: 1900 }, headwind10: { first: 2114, second: 20677, third: 27281, tci: 1900 }, headwind30: { first: 1928, second: 18701, third: 24283, tci: 1880 } },
            { temp: -20, tailwind10: { first: 2507, second: 24690, third: 33657, tci: 1890 }, zeroWind: { first: 2228, second: 21558, third: 28934, tci: 1870 }, headwind10: { first: 2136, second: 20666, third: 27329, tci: 1860 }, headwind30: { first: 1950, second: 18711, third: 24471, tci: 1840 } },
            { temp: -15, tailwind10: { first: 2529, second: 24629, third: 33656, tci: 1860 }, zeroWind: { first: 2250, second: 21531, third: 28969, tci: 1830 }, headwind10: { first: 2158, second: 20650, third: 27505, tci: 1820 }, headwind30: { first: 1972, second: 18716, third: 24529, tci: 1800 } },
            { temp: -10, tailwind10: { first: 2550, second: 24570, third: 33829, tci: 1820 }, zeroWind: { first: 2272, second: 21604, third: 29003, tci: 1790 }, headwind10: { first: 2179, second: 20634, third: 27547, tci: 1790 }, headwind30: { first: 1994, second: 18721, third: 24714, tci: 1770 } },
            { temp: -5,  tailwind10: { first: 2572, second: 24518, third: 33847, tci: 1790 }, zeroWind: { first: 2293, second: 21584, third: 29184, tci: 1760 }, headwind10: { first: 2201, second: 20624, third: 27731, tci: 1750 }, headwind30: { first: 2015, second: 18730, third: 24776, tci: 1740 } },
            { temp: 0,   tailwind10: { first: 2593, second: 24482, third: 33877, tci: 1750 }, zeroWind: { first: 2315, second: 21576, third: 29236, tci: 1730 }, headwind10: { first: 2222, second: 20625, third: 27790, tci: 1720 }, headwind30: { first: 2036, second: 18748, third: 24847, tci: 1710 } },
            { temp: 5,   tailwind10: { first: 2613, second: 25752, third: 36073, tci: 1730 }, zeroWind: { first: 2335, second: 22701, third: 31057, tci: 1710 }, headwind10: { first: 2242, second: 21704, third: 29556, tci: 1700 }, headwind30: { first: 2057, second: 19737, third: 26480, tci: 1680 } },
            { temp: 10,  tailwind10: { first: 2633, second: 29073, third: 41154, tci: 1730 }, zeroWind: { first: 2354, second: 25602, third: 35447, tci: 1700 }, headwind10: { first: 2262, second: 24470, third: 33620, tci: 1690 }, headwind30: { first: 2076, second: 22242, third: 30074, tci: 1670 } }
        ]
    },
    {
        weight: 18000,
        data: [
            { temp: -54, tailwind10: { first: 2326, second: 23486, third: 31249, tci: 2180 }, zeroWind: { first: 2047, second: 20401, third: 26593, tci: 2150 }, headwind10: { first: 1955, second: 19392, third: 25141, tci: 2140 }, headwind30: { first: 1769, second: 17403, third: 22200, tci: 2120 } },
            { temp: -35, tailwind10: { first: 2413, second: 23249, third: 31552, tci: 2000 }, zeroWind: { first: 2134, second: 20302, third: 26978, tci: 1970 }, headwind10: { first: 2042, second: 19338, third: 25555, tci: 1960 }, headwind30: { first: 1856, second: 17437, third: 22662, tci: 1950 } },
            { temp: -30, tailwind10: { first: 2435, second: 23190, third: 31561, tci: 1960 }, zeroWind: { first: 2157, second: 20278, third: 27014, tci: 1930 }, headwind10: { first: 2064, second: 19325, third: 25598, tci: 1920 }, headwind30: { first: 1878, second: 17445, third: 22843, tci: 1910 } },
            { temp: -25, tailwind10: { first: 2457, second: 23138, third: 31724, tci: 1920 }, zeroWind: { first: 2179, second: 20258, third: 27188, tci: 1890 }, headwind10: { first: 2086, second: 15316, third: 25646, tci: 1880 }, headwind30: { first: 1900, second: 17457, third: 22906, tci: 1870 } },
            { temp: -20, tailwind10: { first: 2479, second: 23087, third: 31741, tci: 1880 }, zeroWind: { first: 2200, second: 20239, third: 27229, tci: 1850 }, headwind10: { first: 2108, second: 19307, third: 25825, tci: 1850 }, headwind30: { first: 1922, second: 17468, third: 22968, tci: 1830 } },
            { temp: -15, tailwind10: { first: 2500, second: 23031, third: 31903, tci: 1840 }, zeroWind: { first: 2222, second: 20215, third: 27402, tci: 1820 }, headwind10: { first: 2129, second: 19293, third: 25868, tci: 1810 }, headwind30: { first: 1944, second: 17473, third: 23150, tci: 1790 } },
            { temp: -10, tailwind10: { first: 2522, second: 22977, third: 31917, tci: 1810 }, zeroWind: { first: 2243, second: 20192, third: 27436, tci: 1780 }, headwind10: { first: 2151, second: 19279, third: 26045, tci: 1770 }, headwind30: { first: 1965, second: 17479, third: 23207, tci: 1760 } },
            { temp: -5,  tailwind10: { first: 2544, second: 22931, third: 31937, tci: 1770 }, zeroWind: { first: 2266, second: 20174, third: 27479, tci: 1750 }, headwind10: { first: 2173, second: 19271, third: 26092, tci: 1740 }, headwind30: { first: 1987, second: 17488, third: 23396, tci: 1730 } },
            { temp: 0,   tailwind10: { first: 2564, second: 22897, third: 32123, tci: 1740 }, zeroWind: { first: 2286, second: 20167, third: 27671, tci: 1720 }, headwind10: { first: 2193, second: 19272, third: 26287, tci: 1710 }, headwind30: { first: 2007, second: 17506, third: 23453, tci: 1690 } },
            { temp: 5,   tailwind10: { first: 2584, second: 24021, third: 34018, tci: 1720 }, zeroWind: { first: 2306, second: 21164, third: 29233, tci: 1690 }, headwind10: { first: 2213, second: 20229, third: 27792, tci: 1690 }, headwind30: { first: 2027, second: 18383, third: 24855, tci: 1670 } },
            { temp: 10,  tailwind10: { first: 2503, second: 26944, third: 38549, tci: 1710 }, zeroWind: { first: 2325, second: 23720, third: 33271, tci: 1680 }, headwind10: { first: 2232, second: 22967, third: 31532, tci: 1680 }, headwind30: { first: 2047, second: 20593, third: 28159, tci: 1660 } }
        ]
    },
    {
        weight: 17500,
        data: [
            { temp: -54, tailwind10: { first: 2299, second: 21971, third: 29441, tci: 2160 }, zeroWind: { first: 2021, second: 19069, third: 25124, tci: 2130 }, headwind10: { first: 1928, second: 18120, third: 23611, tci: 2120 }, headwind30: { first: 1743, second: 16247, third: 20920, tci: 2100 } },
            { temp: -35, tailwind10: { first: 2385, second: 21753, third: 29751, tci: 1990 }, zeroWind: { first: 2107, second: 18981, third: 25514, tci: 1960 }, headwind10: { first: 2014, second: 18074, third: 24022, tci: 1950 }, headwind30: { first: 1828, second: 16283, third: 21378, tci: 1930 } },
            { temp: -30, tailwind10: { first: 2407, second: 21706, third: 29917, tci: 1950 }, zeroWind: { first: 2129, second: 18960, third: 25550, tci: 1920 }, headwind10: { first: 2036, second: 18063, third: 24196, tci: 1910 }, headwind30: { first: 1850, second: 16292, third: 21437, tci: 1890 } },
            { temp: -25, tailwind10: { first: 2429, second: 21651, third: 29927, tci: 1900 }, zeroWind: { first: 2150, second: 18942, third: 25590, tci: 1880 }, headwind10: { first: 2058, second: 18055, third: 24243, tci: 1870 }, headwind30: { first: 1872, second: 16303, third: 21620, tci: 1860 } },
            { temp: -20, tailwind10: { first: 2450, second: 21604, third: 30095, tci: 1870 }, zeroWind: { first: 2172, second: 18925, third: 25767, tci: 1840 }, headwind10: { first: 2079, second: 18048, third: 24423, tci: 1830 }, headwind30: { first: 1894, second: 16314, third: 21681, tci: 1820 } },
            { temp: -15, tailwind10: { first: 2472, second: 21553, third: 30110, tci: 1830 }, zeroWind: { first: 2193, second: 18904, third: 25803, tci: 1810 }, headwind10: { first: 2101, second: 18036, third: 24465, tci: 1800 }, headwind30: { first: 1915, second: 16321, third: 21863, tci: 1780 } },
            { temp: -10, tailwind10: { first: 2493, second: 21504, third: 30125, tci: 1790 }, zeroWind: { first: 2214, second: 18883, third: 25978, tci: 1770 }, headwind10: { first: 2122, second: 18024, third: 24507, tci: 1760 }, headwind30: { first: 1936, second: 16327, third: 21919, tci: 1750 } },
            { temp: -5,  tailwind10: { first: 2513, second: 21461, third: 30299, tci: 1760 }, zeroWind: { first: 2235, second: 18867, third: 26019, tci: 1740 }, headwind10: { first: 2142, second: 18017, third: 24690, tci: 1730 }, headwind30: { first: 1957, second: 16337, third: 22105, tci: 1720 } },
            { temp: 0,   tailwind10: { first: 2534, second: 21430, third: 30332, tci: 1730 }, zeroWind: { first: 2256, second: 18861, third: 26069, tci: 1710 }, headwind10: { first: 2163, second: 18019, third: 24746, tci: 1700 }, headwind30: { first: 1978, second: 16354, third: 22171, tci: 1690 } },
            { temp: 5,   tailwind10: { first: 2554, second: 22427, third: 32099, tci: 1700 }, zeroWind: { first: 2276, second: 19747, third: 27662, tci: 1680 }, headwind10: { first: 2183, second: 18869, third: 26143, tci: 1680 }, headwind30: { first: 1998, second: 17134, third: 23467, tci: 1660 } },
            { temp: 10,  tailwind10: { first: 2573, second: 25008, third: 36293, tci: 1690 }, zeroWind: { first: 2295, second: 22007, third: 31120, tci: 1670 }, headwind10: { first: 2202, second: 21025, third: 29604, tci: 1660 }, headwind30: { first: 2017, second: 19089, third: 26387, tci: 1650 } }
        ]
    },
    {
        weight: 17000,
        data: [
            { temp: -54, tailwind10: { first: 2272, second: 20566, third: 27884, tci: 2150 }, zeroWind: { first: 1994, second: 17834, third: 23623, tci: 2120 }, headwind10: { first: 1901, second: 16939, third: 22298, tci: 2110 }, headwind30: { first: 1716, second: 15172, third: 19723, tci: 2090 } },
            { temp: -35, tailwind10: { first: 2357, second: 20365, third: 28207, tci: 1970 }, zeroWind: { first: 2079, second: 17755, third: 24012, tci: 1950 }, headwind10: { first: 1986, second: 16900, third: 22710, tci: 1940 }, headwind30: { first: 1800, second: 15210, third: 20178, tci: 1920 } },
            { temp: -30, tailwind10: { first: 2379, second: 20315, third: 28221, tci: 1930 }, zeroWind: { first: 2100, second: 17736, third: 24182, tci: 1910 }, headwind10: { first: 2008, second: 16890, third: 22754, tci: 1900 }, headwind30: { first: 1822, second: 15219, third: 20235, tci: 1880 } },
            { temp: -25, tailwind10: { first: 2400, second: 20271, third: 28388, tci: 1890 }, zeroWind: { first: 2122, second: 17720, third: 24222, tci: 1870 }, headwind10: { first: 2029, second: 16884, third: 22930, tci: 1860 }, headwind30: { first: 1843, second: 15231, third: 20417, tci: 1850 } },
            { temp: -20, tailwind10: { first: 2421, second: 20229, third: 28408, tci: 1850 }, zeroWind: { first: 2143, second: 17705, third: 24262, tci: 1830 }, headwind10: { first: 2050, second: 16877, third: 22976, tci: 1820 }, headwind30: { first: 1865, second: 15242, third: 20477, tci: 1810 } },
            { temp: -15, tailwind10: { first: 2442, second: 20182, third: 28424, tci: 1820 }, zeroWind: { first: 2164, second: 17686, third: 24436, tci: 1800 }, headwind10: { first: 2071, second: 16867, third: 23153, tci: 1790 }, headwind30: { first: 1886, second: 15249, third: 20530, tci: 1770 } },
            { temp: -10, tailwind10: { first: 2463, second: 20136, third: 26593, tci: 1780 }, zeroWind: { first: 2185, second: 17667, third: 24472, tci: 1760 }, headwind10: { first: 2092, second: 16857, third: 23195, tci: 1750 }, headwind30: { first: 1907, second: 15256, third: 20711, tci: 1740 } },
            { temp: -5,  tailwind10: { first: 2484, second: 20097, third: 28516, tci: 1750 }, zeroWind: { first: 2206, second: 17653, third: 24654, tci: 1730 }, headwind10: { first: 2113, second: 16851, third: 23241, tci: 1720 }, headwind30: { first: 1927, second: 15266, third: 20768, tci: 1710 } },
            { temp: 0,   tailwind10: { first: 2504, second: 20069, third: 28803, tci: 1720 }, zeroWind: { first: 2226, second: 17648, third: 24702, tci: 1700 }, headwind10: { first: 2133, second: 16854, third: 23433, tci: 1690 }, headwind30: { first: 1948, second: 15283, third: 20952, tci: 1680 } },
            { temp: 5,   tailwind10: { first: 2524, second: 20954, third: 30303, tci: 1690 }, zeroWind: { first: 2246, second: 18436, third: 26055, tci: 1670 }, headwind10: { first: 2153, second: 17610, third: 24737, tci: 1660 }, headwind30: { first: 1967, second: 15978, third: 22040, tci: 1650 } },
            { temp: 10,  tailwind10: { first: 2543, second: 23240, third: 34050, tci: 1680 }, zeroWind: { first: 2264, second: 20439, third: 29259, tci: 1650 }, headwind10: { first: 2172, second: 19522, third: 27677, tci: 1650 }, headwind30: { first: 1986, second: 17711, third: 24742, tci: 1640 } }
        ]
    },
    {
        weight: 16500,
        data: [
            { temp: -54, tailwind10: { first: 2244, second: 19259, third: 26287, tci: 2130 }, zeroWind: { first: 1966, second: 16684, third: 22336, tci: 2110 }, headwind10: { first: 1873, second: 15839, third: 21068, tci: 2100 }, headwind30: { first: 1688, second: 14171, third: 18600, tci: 2080 } },
            { temp: -35, tailwind10: { first: 2328, second: 19074, third: 26514, tci: 1960 }, zeroWind: { first: 2050, second: 16613, third: 22729, tci: 1940 }, headwind10: { first: 1957, second: 15806, third: 21479, tci: 1930 }, headwind30: { first: 1772, second: 14210, third: 18931, tci: 1910 } },
            { temp: -30, tailwind10: { first: 2350, second: 19029, third: 26777, tci: 1920 }, zeroWind: { first: 2071, second: 16596, third: 22765, tci: 1900 }, headwind10: { first: 1979, second: 15798, third: 21522, tci: 1890 }, headwind30: { first: 1793, second: 14220, third: 19106, tci: 1880 } },
            { temp: -25, tailwind10: { first: 2371, second: 18988, third: 26797, tci: 1880 }, zeroWind: { first: 2093, second: 16582, third: 22940, tci: 1860 }, headwind10: { first: 2000, second: 15793, third: 21699, tci: 1850 }, headwind30: { first: 1814, second: 14232, third: 19164, tci: 1840 } },
            { temp: -20, tailwind10: { first: 2392, second: 18948, third: 26818, tci: 1840 }, zeroWind: { first: 2114, second: 16569, third: 22980, tci: 1820 }, headwind10: { first: 2021, second: 15787, third: 21745, tci: 1810 }, headwind30: { first: 1835, second: 14243, third: 19345, tci: 1800 } },
            { temp: -15, tailwind10: { first: 2413, second: 18906, third: 26986, tci: 1810 }, zeroWind: { first: 2134, second: 16551, third: 23016, tci: 1790 }, headwind10: { first: 2042, second: 15779, third: 21787, tci: 1790 }, headwind30: { first: 1856, second: 14250, third: 19399, tci: 1770 } },
            { temp: -10, tailwind10: { first: 2433, second: 18864, third: 27005, tci: 1770 }, zeroWind: { first: 2155, second: 16535, third: 23190, tci: 1750 }, headwind10: { first: 2062, second: 15770, third: 21964, tci: 1740 }, headwind30: { first: 1877, second: 14258, third: 19579, tci: 1730 } },
            { temp: -5,  tailwind10: { first: 2454, second: 18828, third: 27182, tci: 1740 }, zeroWind: { first: 2175, second: 16522, third: 23230, tci: 1720 }, headwind10: { first: 2082, second: 15765, third: 22010, tci: 1710 }, headwind30: { first: 1897, second: 14268, third: 19635, tci: 1700 } },
            { temp: 0,   tailwind10: { first: 2474, second: 18798, third: 27211, tci: 1710 }, zeroWind: { first: 2195, second: 16518, third: 23420, tci: 1690 }, headwind10: { first: 2103, second: 15768, third: 22200, tci: 1680 }, headwind30: { first: 1917, second: 14284, third: 19696, tci: 1670 } },
            { temp: 5,   tailwind10: { first: 2491, second: 19589, third: 28616, tci: 1680 }, zeroWind: { first: 2213, second: 17219, third: 24544, tci: 1660 }, headwind10: { first: 2120, second: 16442, third: 23283, tci: 1660 }, headwind30: { first: 1935, second: 14904, third: 20829, tci: 1640 } },
            { temp: 10,  tailwind10: { first: 2512, second: 21619, third: 32110, tci: 1670 }, zeroWind: { first: 2233, second: 18999, third: 27528, tci: 1650 }, headwind10: { first: 2141, second: 18140, third: 26013, tci: 1640 }, headwind30: { first: 1956, second: 16445, third: 23210, tci: 1630 } }
        ]
    },
    {
        weight: 16000,
        data: [
            { temp: -54, tailwind10: { first: 2217, second: 18042, third: 24920, tci: 2120 }, zeroWind: { first: 1939, second: 15811, third: 21129, tci: 2100 }, headwind10: { first: 1846, second: 14813, third: 19912, tci: 2090 }, headwind30: { first: 1660, second: 13237, third: 17430, tci: 2070 } },
            { temp: -35, tailwind10: { first: 2299, second: 17870, third: 25257, tci: 1950 }, zeroWind: { first: 2021, second: 15519, third: 21557, tci: 1690 }, headwind10: { first: 1928, second: 14785, third: 20194, tci: 1920 }, headwind30: { first: 1743, second: 13277, third: 17870, tci: 1910 } },
            { temp: -30, tailwind10: { first: 2320, second: 17828, third: 25274, tci: 1910 }, zeroWind: { first: 2042, second: 15532, third: 21550, tci: 1690 }, headwind10: { first: 1949, second: 14778, third: 20366, tci: 1880 }, headwind30: { first: 1764, second: 13287, third: 18046, tci: 1870 } },
            { temp: -25, tailwind10: { first: 2340, second: 17791, third: 25443, tci: 1870 }, zeroWind: { first: 2062, second: 15519, third: 21597, tci: 1650 }, headwind10: { first: 1969, second: 14774, third: 20410, tci: 1840 }, headwind30: { first: 1784, second: 13298, third: 18102, tci: 1830 } },
            { temp: -20, tailwind10: { first: 2362, second: 17754, third: 25465, tci: 1830 }, zeroWind: { first: 2084, second: 15508, third: 21773, tci: 1810 }, headwind10: { first: 1991, second: 14770, third: 20588, tci: 1810 }, headwind30: { first: 1805, second: 13309, third: 18281, tci: 1790 } },
            { temp: -15, tailwind10: { first: 2382, second: 17715, third: 25484, tci: 1800 }, zeroWind: { first: 2104, second: 15492, third: 21810, tci: 1780 }, headwind10: { first: 2011, second: 14762, third: 20630, tci: 1770 }, headwind30: { first: 1826, second: 13317, third: 18334, tci: 1760 } },
            { temp: -10, tailwind10: { first: 2403, second: 17677, third: 25656, tci: 1760 }, zeroWind: { first: 2124, second: 15478, third: 21846, tci: 1740 }, headwind10: { first: 2031, second: 14755, third: 20671, tci: 1740 }, headwind30: { first: 1846, second: 13325, third: 18386, tci: 1720 } },
            { temp: -5,  tailwind10: { first: 2423, second: 17643, third: 25680, tci: 1730 }, zeroWind: { first: 2144, second: 15466, third: 22025, tci: 1700 }, headwind10: { first: 2052, second: 14751, third: 20852, tci: 1700 }, headwind30: { first: 1866, second: 13335, third: 18567, tci: 1690 } },
            { temp: 0,   tailwind10: { first: 2443, second: 17619, third: 25712, tci: 1700 }, zeroWind: { first: 2164, second: 15463, third: 22072, tci: 1680 }, headwind10: { first: 2071, second: 14754, third: 20902, tci: 1670 }, headwind30: { first: 1886, second: 13351, third: 18627, tci: 1660 } },
            { temp: 5,   tailwind10: { first: 2462, second: 18321, third: 27028, tci: 1670 }, zeroWind: { first: 2183, second: 16089, third: 23262, tci: 1650 }, headwind10: { first: 2091, second: 15355, third: 22051, tci: 1650 }, headwind30: { first: 1905, second: 13904, third: 19554, tci: 1630 } },
            { temp: 10,  tailwind10: { first: 2480, second: 20126, third: 30143, tci: 1660 }, zeroWind: { first: 2202, second: 17672, third: 25910, tci: 1640 }, headwind10: { first: 2109, second: 16867, third: 24457, tci: 1630 }, headwind30: { first: 1923, second: 15276, third: 21776, tci: 1620 } }
        ]
    },
    {
        weight: 15500,
        data: [
            { temp: -54, tailwind10: { first: 2188, second: 16904, third: 23534, tci: 2110 }, zeroWind: { first: 1910, second: 14608, third: 19864, tci: 2090 }, headwind10: { first: 1817, second: 13854, third: 18699, tci: 2080 }, headwind30: { first: 1632, second: 12362, third: 16436, tci: 2060 } },
            { temp: -35, tailwind10: { first: 2270, second: 16745, third: 23832, tci: 1940 }, zeroWind: { first: 1991, second: 14551, third: 20253, tci: 1920 }, headwind10: { first: 1898, second: 13830, third: 19105, tci: 1910 }, headwind30: { first: 1713, second: 12403, third: 16872, tci: 1900 } },
            { temp: -30, tailwind10: { first: 2290, second: 16706, third: 23997, tci: 1900 }, zeroWind: { first: 2012, second: 14537, third: 20423, tci: 1880 }, headwind10: { first: 1919, second: 13824, third: 19146, tci: 1870 }, headwind30: { first: 1734, second: 12413, third: 16924, tci: 1860 } },
            { temp: -25, tailwind10: { first: 2311, second: 16672, third: 24019, tci: 1860 }, zeroWind: { first: 2033, second: 14524, third: 20460, tci: 1840 }, headwind10: { first: 1940, second: 13820, third: 19320, tci: 1830 }, headwind30: { first: 1754, second: 12424, third: 17101, tci: 1820 } },
            { temp: -20, tailwind10: { first: 2331, second: 16638, third: 24041, tci: 1820 }, zeroWind: { first: 2053, second: 14515, third: 20500, tci: 1800 }, headwind10: { first: 1960, second: 13817, third: 19364, tci: 1800 }, headwind30: { first: 1775, second: 12435, third: 17154, tci: 1780 } },
            { temp: -15, tailwind10: { first: 2351, second: 16602, third: 24212, tci: 1790 }, zeroWind: { first: 2073, second: 14501, third: 20674, tci: 1770 }, headwind10: { first: 1980, second: 13811, third: 19538, tci: 1760 }, headwind30: { first: 1795, second: 12444, third: 17329, tci: 1750 } },
            { temp: -10, tailwind10: { first: 2371, second: 16566, third: 24231, tci: 1750 }, zeroWind: { first: 2093, second: 14488, third: 20710, tci: 1730 }, headwind10: { first: 2000, second: 13805, third: 19578, tci: 1730 }, headwind30: { first: 1815, second: 12451, third: 17379, tci: 1720 } },
            { temp: -5,  tailwind10: { first: 2391, second: 16535, third: 24409, tci: 1720 }, zeroWind: { first: 2113, second: 14478, third: 20748, tci: 1700 }, headwind10: { first: 2020, second: 13801, third: 19621, tci: 1700 }, headwind30: { first: 1834, second: 12462, third: 17560, tci: 1680 } },
            { temp: 0,   tailwind10: { first: 2411, second: 16513, third: 24442, tci: 1690 }, zeroWind: { first: 2132, second: 14475, third: 20935, tci: 1670 }, headwind10: { first: 2040, second: 13804, third: 19808, tci: 1660 }, headwind30: { first: 1854, second: 12477, third: 17617, tci: 1650 } },
            { temp: 5,   tailwind10: { first: 2430, second: 17139, third: 25684, tci: 1660 }, zeroWind: { first: 2151, second: 15034, third: 21915, tci: 1640 }, headwind10: { first: 2059, second: 14342, third: 20755, tci: 1640 }, headwind30: { first: 1873, second: 12972, third: 18497, tci: 1630 } },
            { temp: 10,  tailwind10: { first: 2448, second: 18748, third: 28449, tci: 1640 }, zeroWind: { first: 2169, second: 16445, third: 24393, tci: 1630 }, headwind10: { first: 2077, second: 15689, third: 22997, tci: 1620 }, headwind30: { first: 1891, second: 14194, third: 20563, tci: 1610 } }
        ]
    },
    {
        weight: 14500,
        data: [
            { temp: -54, tailwind10: { first: 2130, second: 14837, third: 21135, tci: 2090 }, zeroWind: { first: 1851, second: 12784, third: 17776, tci: 2070 }, headwind10: { first: 1758, second: 12108, third: 16699, tci: 2060 }, headwind30: { first: 1573, second: 10772, third: 14610, tci: 2050 } },
            { temp: -35, tailwind10: { first: 2208, second: 14701, third: 21339, tci: 1920 }, zeroWind: { first: 1930, second: 12738, third: 18034, tci: 1900 }, headwind10: { first: 1837, second: 12092, third: 17102, tci: 1890 }, headwind30: { first: 1651, second: 10813, third: 15035, tci: 1880 } },
            { temp: -30, tailwind10: { first: 2228, second: 14668, third: 21506, tci: 1880 }, zeroWind: { first: 1950, second: 12727, third: 18202, tci: 1860 }, headwind10: { first: 1857, second: 12088, third: 17142, tci: 1860 }, headwind30: { first: 1672, second: 10823, third: 15085, tci: 1840 } },
            { temp: -25, tailwind10: { first: 2248, second: 14638, third: 21528, tci: 1840 }, zeroWind: { first: 1970, second: 12718, third: 18236, tci: 1820 }, headwind10: { first: 1877, second: 12086, third: 17183, tci: 1820 }, headwind30: { first: 1691, second: 10834, third: 15135, tci: 1810 } },
            { temp: -20, tailwind10: { first: 2268, second: 14608, third: 21551, tci: 1800 }, zeroWind: { first: 1990, second: 12709, third: 18411, tci: 1790 }, headwind10: { first: 1897, second: 12084, third: 17357, tci: 1780 }, headwind30: { first: 1711, second: 10845, third: 15308, tci: 1770 } },
            { temp: -15, tailwind10: { first: 2287, second: 14577, third: 21722, tci: 1770 }, zeroWind: { first: 2009, second: 12698, third: 18446, tci: 1750 }, headwind10: { first: 1916, second: 12079, third: 17396, tci: 1750 }, headwind30: { first: 1731, second: 10853, third: 15356, tci: 1740 } },
            { temp: -10, tailwind10: { first: 2307, second: 14547, third: 21744, tci: 1730 }, zeroWind: { first: 2028, second: 12687, third: 18481, tci: 1720 }, headwind10: { first: 1936, second: 12075, third: 17435, tci: 1710 }, headwind30: { first: 1750, second: 10861, third: 15530, tci: 1700 } },
            { temp: -5,  tailwind10: { first: 2326, second: 14521, third: 21768, tci: 1700 }, zeroWind: { first: 2046, second: 12679, third: 18658, tci: 1690 }, headwind10: { first: 1955, second: 12073, third: 17612, tci: 1680 }, headwind30: { first: 1769, second: 10871, third: 15578, tci: 1670 } },
            { temp: 0,   tailwind10: { first: 2345, second: 14501, third: 21954, tci: 1670 }, zeroWind: { first: 2067, second: 12577, third: 18700, tci: 1650 }, headwind10: { first: 1974, second: 12076, third: 17658, tci: 1650 }, headwind30: { first: 1788, second: 10885, third: 15630, tci: 1640 } },
            { temp: 5,   tailwind10: { first: 2363, second: 15001, third: 22911, tci: 1640 }, zeroWind: { first: 2085, second: 13124, third: 19569, tci: 1630 }, headwind10: { first: 1992, second: 12506, third: 18492, tci: 1620 }, headwind30: { first: 1807, second: 11282, third: 16410, tci: 1610 } },
            { temp: 10,  tailwind10: { first: 2381, second: 16283, third: 25357, tci: 1620 }, zeroWind: { first: 2103, second: 14249, third: 21622, tci: 1610 }, headwind10: { first: 2010, second: 13581, third: 20330, tci: 1600 }, headwind30: { first: 1824, second: 12256, third: 18101, tci: 1590 } }
        ]
    },
    {
        weight: 13500,
        data: [
            { temp: -54, tailwind10: { first: 2068, second: 13008, third: 18879, tci: 2070 }, zeroWind: { first: 1790, second: 11169, third: 15775, tci: 2050 }, headwind10: { first: 1697, second: 10563, third: 14780, tci: 2040 }, headwind30: { first: 1511, second: 9362, third: 12970, tci: 2030 } },
            { temp: -35, tailwind10: { first: 2144, second: 12891, third: 19088, tci: 1900 }, zeroWind: { first: 1865, second: 11131, third: 16158, tci: 1890 }, headwind10: { first: 1773, second: 10552, third: 15173, tci: 1880 }, headwind30: { first: 1587, second: 9403, third: 13264, tci: 1870 } },
            { temp: -30, tailwind10: { first: 2164, second: 12862, third: 19255, tci: 1860 }, zeroWind: { first: 1886, second: 11123, third: 16192, tci: 1850 }, headwind10: { first: 1793, second: 10549, third: 15211, tci: 1840 }, headwind30: { first: 1607, second: 9413, third: 13431, tci: 1830 } },
            { temp: -25, tailwind10: { first: 2183, second: 12836, third: 19276, tci: 1820 }, zeroWind: { first: 1904, second: 11115, third: 16362, tci: 1810 }, headwind10: { first: 1811, second: 10548, third: 15380, tci: 1800 }, headwind30: { first: 1626, second: 9423, third: 13478, tci: 1790 } },
            { temp: -20, tailwind10: { first: 2202, second: 12811, third: 19298, tci: 1790 }, zeroWind: { first: 1923, second: 11108, third: 16397, tci: 1770 }, headwind10: { first: 1830, second: 10547, third: 15419, tci: 1770 }, headwind30: { first: 1645, second: 9434, third: 13524, tci: 1760 } },
            { temp: -15, tailwind10: { first: 2220, second: 12784, third: 19470, tci: 1750 }, zeroWind: { first: 1942, second: 11099, third: 16429, tci: 1740 }, headwind10: { first: 1849, second: 10544, third: 15456, tci: 1730 }, headwind30: { first: 1664, second: 9442, third: 13693, tci: 1720 } },
            { temp: -10, tailwind10: { first: 2239, second: 12758, third: 19492, tci: 1720 }, zeroWind: { first: 1961, second: 11091, third: 16601, tci: 1700 }, headwind10: { first: 1868, second: 10541, third: 15627, tci: 1700 }, headwind30: { first: 1682, second: 9450, third: 13737, tci: 1690 } },
            { temp: -5,  tailwind10: { first: 2258, second: 12735, third: 19516, tci: 1690 }, zeroWind: { first: 1979, second: 11084, third: 16637, tci: 1670 }, headwind10: { first: 1887, second: 10540, third: 15666, tci: 1670 }, headwind30: { first: 1701, second: 9460, third: 13909, tci: 1660 } },
            { temp: 0,   tailwind10: { first: 2276, second: 12718, third: 19700, tci: 1660 }, zeroWind: { first: 1998, second: 11083, third: 16673, tci: 1640 }, headwind10: { first: 1905, second: 10543, third: 15708, tci: 1640 }, headwind30: { first: 1719, second: 9473, third: 13958, tci: 1630 } },
            { temp: 5,   tailwind10: { first: 2294, second: 13117, third: 20558, tci: 1630 }, zeroWind: { first: 2016, second: 11440, third: 17454, tci: 1610 }, headwind10: { first: 1923, second: 10887, third: 16459, tci: 1610 }, headwind30: { first: 1737, second: 9791, third: 14529, tci: 1600 } },
            { temp: 10,  tailwind10: { first: 2312, second: 14144, third: 22438, tci: 1610 }, zeroWind: { first: 2033, second: 12341, third: 19142, tci: 1590 }, headwind10: { first: 1940, second: 11747, third: 18085, tci: 1590 }, headwind30: { first: 1755, second: 10570, third: 16028, tci: 1580 } }
        ]
    }
];

const singleEngineFlightPathDistances_4000ft_anti_ice_on = [
    {
        weight: 20000,
        data: [
            { temp: -54, tailwind10: { first: 2467, second: 31422, third: 40232, tci: 2240 }, zeroWind: { first: 2188, second: 27418, third: 34427, tci: 2200 }, headwind10: { first: 2095, second: 26115, third: 32651, tci: 2190 }, headwind30: { first: 1910, second: 23554, third: 29078, tci: 2160 } },
            { temp: -35, tailwind10: { first: 2559, second: 31181, third: 40577, tci: 2060 }, zeroWind: { first: 2261, second: 27350, third: 35017, tci: 2030 }, headwind10: { first: 2188, second: 26102, third: 33144, tci: 2010 }, headwind30: { first: 2003, second: 23647, third: 29636, tci: 1990 } },
            { temp: -30, tailwind10: { first: 2583, second: 31130, third: 40752, tci: 2020 }, zeroWind: { first: 2305, second: 27340, third: 35076, tci: 1980 }, headwind10: { first: 2212, second: 26105, third: 33343, tci: 1970 }, headwind30: { first: 2026, second: 23675, third: 29847, tci: 1950 } },
            { temp: -25, tailwind10: { first: 2607, second: 31082, third: 40780, tci: 1980 }, zeroWind: { first: 2328, second: 27331, third: 35271, tci: 1940 }, headwind10: { first: 2236, second: 26109, third: 33412, tci: 1930 }, headwind30: { first: 2050, second: 23704, third: 30060, tci: 1910 } },
            { temp: -20, tailwind10: { first: 2630, second: 31032, third: 40959, tci: 1940 }, zeroWind: { first: 2352, second: 27320, third: 35327, tci: 1900 }, headwind10: { first: 2260, second: 26110, third: 33612, tci: 1890 }, headwind30: { first: 2073, second: 23729, third: 30144, tci: 1870 } },
            { temp: -15, tailwind10: { first: 2653, second: 30979, third: 40982, tci: 1900 }, zeroWind: { first: 2375, second: 27306, third: 35520, tci: 1870 }, headwind10: { first: 2282, second: 26107, third: 33811, tci: 1850 }, headwind30: { first: 2096, second: 23749, third: 30352, tci: 1840 } },
            { temp: -10, tailwind10: { first: 2675, second: 30930, third: 41162, tci: 1860 }, zeroWind: { first: 2397, second: 27293, third: 35717, tci: 1830 }, headwind10: { first: 2304, second: 26106, third: 33874, tci: 1820 }, headwind30: { first: 2118, second: 23771, third: 30431, tci: 1800 } },
            { temp: -5,  tailwind10: { first: 2420, second: 30890, third: 41354, tci: 1830 }, zeroWind: { first: 2420, second: 27288, third: 35779, tci: 1800 }, headwind10: { first: 2328, second: 26112, third: 34083, tci: 1790 }, headwind30: { first: 2142, second: 23798, third: 30647, tci: 1770 } },
            { temp: 0,   tailwind10: { first: 2721, second: 30864, third: 41560, tci: 1790 }, zeroWind: { first: 2443, second: 27293, third: 35995, tci: 1760 }, headwind10: { first: 2350, second: 26126, third: 34302, tci: 1750 }, headwind30: { first: 2164, second: 23834, third: 30873, tci: 1730 } },
            { temp: 5,   tailwind10: { first: 2742, second: 35240, third: 48170, tci: 1800 }, zeroWind: { first: 2463, second: 31103, third: 41721, tci: 1760 }, headwind10: { first: 2371, second: 29758, third: 39655, tci: 1750 }, headwind30: { first: 2185, second: 27118, third: 35647, tci: 1730 } },
            { temp: 10,  tailwind10: { first: 2761, second: 43490, third: 60137, tci: 1830 }, zeroWind: { first: 2483, second: 38232, third: 51844, tci: 1790 }, headwind10: { first: 2390, second: 36533, third: 49057, tci: 1770 }, headwind30: { first: 2204, second: 33215, third: 44089, tci: 1750 } }
        ]
    },
    {
        weight: 19500,
        data: [
            { temp: -54, tailwind10: { first: 2441, second: 29281, third: 37787, tci: 2220 }, zeroWind: { first: 2163, second: 25542, third: 32406, tci: 2180 }, headwind10: { first: 2070, second: 24324, third: 30721, tci: 2170 }, headwind30: { first: 1885, second: 21926, third: 27321, tci: 2150 } },
            { temp: -35, tailwind10: { first: 2533, second: 29061, third: 38143, tci: 2040 }, zeroWind: { first: 2255, second: 25484, third: 32864, tci: 2010 }, headwind10: { first: 2162, second: 24316, third: 31212, tci: 2000 }, headwind30: { first: 1976, second: 22019, third: 27871, tci: 1970 } },
            { temp: -30, tailwind10: { first: 2557, second: 29015, third: 38320, tci: 2000 }, zeroWind: { first: 2278, second: 25475, third: 33057, tci: 1970 }, headwind10: { first: 2186, second: 24320, third: 31278, tci: 1960 }, headwind30: { first: 2000, second: 22046, third: 28079, tci: 1930 } },
            { temp: -25, tailwind10: { first: 2580, second: 28970, third: 38499, tci: 1960 }, zeroWind: { first: 2302, second: 25468, third: 33115, tci: 1930 }, headwind10: { first: 2209, second: 24324, third: 31478, tci: 1920 }, headwind30: { first: 2023, second: 22073, third: 28163, tci: 1890 } },
            { temp: -20, tailwind10: { first: 2603, second: 28925, third: 38527, tci: 1920 }, zeroWind: { first: 2325, second: 25458, third: 33309, tci: 1890 }, headwind10: { first: 2232, second: 24326, third: 31677, tci: 1880 }, headwind30: { first: 2046, second: 22097, third: 28371, tci: 1860 } },
            { temp: -15, tailwind10: { first: 2626, second: 28877, third: 38706, tci: 1880 }, zeroWind: { first: 2348, second: 25445, third: 33501, tci: 1850 }, headwind10: { first: 2255, second: 24324, third: 31738, tci: 1840 }, headwind30: { first: 2069, second: 22117, third: 28448, tci: 1820 } },
            { temp: -10, tailwind10: { first: 2648, second: 28832, third: 38735, tci: 1840 }, zeroWind: { first: 2370, second: 25434, third: 33556, tci: 1810 }, headwind10: { first: 2277, second: 24325, third: 31938, tci: 1810 }, headwind30: { first: 2092, second: 22138, third: 28655, tci: 1790 } },
            { temp: -5,  tailwind10: { first: 2671, second: 28796, third: 38927, tci: 1810 }, zeroWind: { first: 2393, second: 25430, third: 33760, tci: 1780 }, headwind10: { first: 2300, second: 24330, third: 32006, tci: 1770 }, headwind30: { first: 2114, second: 22164, third: 28967, tci: 1750 } },
            { temp: 0,   tailwind10: { first: 2693, second: 28771, third: 39132, tci: 1780 }, zeroWind: { first: 2415, second: 25435, third: 33829, tci: 1750 }, headwind10: { first: 2322, second: 24345, third: 32222, tci: 1740 }, headwind30: { first: 2136, second: 22198, third: 28957, tci: 1720 } },
            { temp: 5,   tailwind10: { first: 2713, second: 32581, third: 45023, tci: 1770 }, zeroWind: { first: 2435, second: 28758, third: 38927, tci: 1740 }, headwind10: { first: 2342, second: 27513, third: 36973, tci: 1730 }, headwind30: { first: 2157, second: 25066, third: 33185, tci: 1710 } },
            { temp: 10,  tailwind10: { first: 2733, second: 39677, third: 55532, tci: 1800 }, zeroWind: { first: 2454, second: 34905, third: 47788, tci: 1760 }, headwind10: { first: 2361, second: 33360, third: 45317, tci: 1750 }, headwind30: { first: 2176, second: 30335, third: 40576, tci: 1720 } }
        ]
    },
    {
        weight: 19000,
        data: [
            { temp: -54, tailwind10: { first: 2416, second: 27321, third: 35670, tci: 2200 }, zeroWind: { first: 2137, second: 23823, third: 30542, tci: 2170 }, headwind10: { first: 2045, second: 22681, third: 28813, tci: 2150 }, headwind30: { first: 1859, second: 20433, third: 25699, tci: 2130 } },
            { temp: -35, tailwind10: { first: 2506, second: 27121, third: 36037, tci: 2020 }, zeroWind: { first: 2228, second: 23772, third: 31001, tci: 1990 }, headwind10: { first: 2135, second: 22678, third: 29297, tci: 1980 }, headwind30: { first: 1950, second: 20523, third: 26240, tci: 1960 } },
            { temp: -30, tailwind10: { first: 2530, second: 27078, third: 36066, tci: 1980 }, zeroWind: { first: 2251, second: 23765, third: 31057, tci: 1950 }, headwind10: { first: 2159, second: 22682, third: 29493, tci: 1940 }, headwind30: { first: 1973, second: 20549, third: 26321, tci: 1920 } },
            { temp: -25, tailwind10: { first: 2553, second: 27037, third: 36247, tci: 1940 }, zeroWind: { first: 2274, second: 23758, third: 31251, tci: 1910 }, headwind10: { first: 2182, second: 22686, third: 29691, tci: 1900 }, headwind30: { first: 1996, second: 20575, third: 26526, tci: 1880 } },
            { temp: -20, tailwind10: { first: 2576, second: 26995, third: 36428, tci: 1900 }, zeroWind: { first: 2297, second: 23750, third: 31445, tci: 1870 }, headwind10: { first: 2204, second: 22689, third: 29753, tci: 1850 }, headwind30: { first: 2019, second: 20598, third: 26731, tci: 1840 } },
            { temp: -15, tailwind10: { first: 2598, second: 26951, third: 36454, tci: 1860 }, zeroWind: { first: 2320, second: 23738, third: 31497, tci: 1830 }, headwind10: { first: 2227, second: 22688, third: 29949, tci: 1830 }, headwind30: { first: 2041, second: 20618, third: 26806, tci: 1810 } },
            { temp: -10, tailwind10: { first: 2620, second: 26910, third: 36539, tci: 1830 }, zeroWind: { first: 2342, second: 23729, third: 31692, tci: 1800 }, headwind10: { first: 2249, second: 22689, third: 30010, tci: 1790 }, headwind30: { first: 2064, second: 20539, third: 27012, tci: 1770 } },
            { temp: -5,  tailwind10: { first: 2543, second: 26877, third: 36576, tci: 1790 }, zeroWind: { first: 2364, second: 23726, third: 31751, tci: 1770 }, headwind10: { first: 2271, second: 26995, third: 30215, tci: 1770 }, headwind30: { first: 2086, second: 20663, third: 27090, tci: 1740 } },
            { temp: 0,   tailwind10: { first: 2664, second: 26854, third: 36881, tci: 1760 }, zeroWind: { first: 2386, second: 23731, third: 31963, tci: 1730 }, headwind10: { first: 2293, second: 22710, third: 30430, tci: 1730 }, headwind30: { first: 2108, second: 20695, third: 27308, tci: 1710 } },
            { temp: 5,   tailwind10: { first: 2585, second: 30183, third: 42138, tci: 1750 }, zeroWind: { first: 2406, second: 26640, third: 36505, tci: 1730 }, headwind10: { first: 2314, second: 25484, third: 34651, tci: 1720 }, headwind30: { first: 2128, second: 23209, third: 31053, tci: 1700 } },
            { temp: 10,  tailwind10: { first: 2704, second: 36327, third: 51390, tci: 1770 }, zeroWind: { first: 2425, second: 31973, third: 44271, tci: 1740 }, headwind10: { first: 2333, second: 30560, third: 41949, tci: 1730 }, headwind30: { first: 2147, second: 27789, third: 37596, tci: 1700 } }
        ]
    },
    {
        weight: 18500,
        data: [
            { temp: -54, tailwind10: { first: 2390, second: 25518, third: 33556, tci: 2180 }, zeroWind: { first: 2111, second: 22238, third: 28684, tci: 2150 }, headwind10: { first: 2019, second: 21167, third: 27160, tci: 2140 }, headwind30: { first: 1833, second: 19055, third: 24074, tci: 2120 } },
            { temp: -35, tailwind10: { first: 2479, second: 25334, third: 33938, tci: 2010 }, zeroWind: { first: 2201, second: 22194, third: 29136, tci: 1980 }, headwind10: { first: 2108, second: 21167, third: 27641, tci: 1970 }, headwind30: { first: 1923, second: 19142, third: 24725, tci: 1950 } },
            { temp: -30, tailwind10: { first: 2502, second: 25295, third: 34116, tci: 1960 }, zeroWind: { first: 2224, second: 22188, third: 29329, tci: 1940 }, headwind10: { first: 2131, second: 21171, third: 27836, tci: 1930 }, headwind30: { first: 1946, second: 19167, third: 24803, tci: 1910 } },
            { temp: -25, tailwind10: { first: 2525, second: 25257, third: 34147, tci: 1920 }, zeroWind: { first: 2247, second: 22162, third: 29522, tci: 1900 }, headwind10: { first: 2154, second: 21176, third: 27899, tci: 1890 }, headwind30: { first: 1968, second: 19187, third: 25001, tci: 1870 } },
            { temp: -20, tailwind10: { first: 2546, second: 25217, third: 34329, tci: 1890 }, zeroWind: { first: 2268, second: 22174, third: 29575, tci: 1860 }, headwind10: { first: 2175, second: 21178, third: 28094, tci: 1850 }, headwind30: { first: 1989, second: 19213, third: 25080, tci: 1830 } },
            { temp: -15, tailwind10: { first: 2570, second: 25177, third: 34511, tci: 1850 }, zeroWind: { first: 2291, second: 22164, third: 29767, tci: 1820 }, headwind10: { first: 2199, second: 21178, third: 28151, tci: 1810 }, headwind30: { first: 2013, second: 19233, third: 25281, tci: 1800 } },
            { temp: -10, tailwind10: { first: 2592, second: 25140, third: 34542, tci: 1810 }, zeroWind: { first: 2314, second: 22156, third: 29820, tci: 1790 }, headwind10: { first: 2221, second: 21180, third: 28349, tci: 1780 }, headwind30: { first: 2035, second: 19253, third: 25354, tci: 1760 } },
            { temp: -5,  tailwind10: { first: 2514, second: 25109, third: 34734, tci: 1780 }, zeroWind: { first: 2335, second: 22153, third: 30020, tci: 1750 }, headwind10: { first: 2243, second: 21186, third: 28552, tci: 1750 }, headwind30: { first: 2057, second: 19277, third: 25560, tci: 1730 } },
            { temp: 0,   tailwind10: { first: 2635, second: 25088, third: 34781, tci: 1750 }, zeroWind: { first: 2357, second: 22159, third: 30230, tci: 1720 }, headwind10: { first: 2264, second: 21200, third: 28624, tci: 1710 }, headwind30: { first: 2079, second: 19307, third: 25775, tci: 1700 } },
            { temp: 5,   tailwind10: { first: 2655, second: 28008, third: 39634, tci: 1740 }, zeroWind: { first: 2377, second: 24713, third: 34132, tci: 1710 }, headwind10: { first: 2284, second: 23637, third: 32511, tci: 1700 }, headwind30: { first: 2099, second: 21518, third: 29087, tci: 1680 } },
            { temp: 10,  tailwind10: { first: 2674, second: 33357, third: 47785, tci: 1750 }, zeroWind: { first: 2396, second: 29365, third: 41076, tci: 1720 }, headwind10: { first: 2303, second: 28067, third: 39031, tci: 1710 }, headwind30: { first: 2117, second: 25518, third: 34924, tci: 1690 } }
        ]
    },
    {
        weight: 18000,
        data: [
            { temp: -54, tailwind10: { first: 2363, second: 23852, third: 31742, tci: 2170 }, zeroWind: { first: 2085, second: 20772, third: 27076, tci: 2140 }, headwind10: { first: 1992, second: 19765, third: 25620, tci: 2120 }, headwind30: { first: 1807, second: 17778, third: 22670, tci: 2100 } },
            { temp: -35, tailwind10: { first: 2452, second: 23682, third: 32122, tci: 1990 }, zeroWind: { first: 2173, second: 20733, third: 27528, tci: 1960 }, headwind10: { first: 2081, second: 19768, third: 26098, tci: 1950 }, headwind30: { first: 1895, second: 17863, third: 23189, tci: 1940 } },
            { temp: -30, tailwind10: { first: 2474, second: 23645, third: 32152, tci: 1950 }, zeroWind: { first: 2196, second: 20727, third: 27718, tci: 1920 }, headwind10: { first: 2103, second: 19772, third: 26158, tci: 1910 }, headwind30: { first: 1918, second: 17886, third: 23387, tci: 1900 } },
            { temp: -25, tailwind10: { first: 2497, second: 23609, third: 32334, tci: 1910 }, zeroWind: { first: 2219, second: 20722, third: 27772, tci: 1880 }, headwind10: { first: 2126, second: 19776, third: 26352, tci: 1870 }, headwind30: { first: 1940, second: 17909, third: 23587, tci: 1860 } },
            { temp: -20, tailwind10: { first: 2519, second: 23573, third: 32517, tci: 1870 }, zeroWind: { first: 2241, second: 20715, third: 27963, tci: 1850 }, headwind10: { first: 2148, second: 19779, third: 26546, tci: 1840 }, headwind30: { first: 1962, second: 17931, third: 23659, tci: 1830 } },
            { temp: -15, tailwind10: { first: 2541, second: 23536, third: 32546, tci: 1830 }, zeroWind: { first: 2263, second: 20706, third: 28013, tci: 1810 }, headwind10: { first: 2170, second: 19779, third: 26602, tci: 1800 }, headwind30: { first: 1984, second: 17949, third: 23857, tci: 1780 } },
            { temp: -10, tailwind10: { first: 2563, second: 23501, third: 32732, tci: 1800 }, zeroWind: { first: 2285, second: 20699, third: 28207, tci: 1770 }, headwind10: { first: 2192, second: 19781, third: 26798, tci: 1770 }, headwind30: { first: 2006, second: 17968, third: 23927, tci: 1750 } },
            { temp: -5,  tailwind10: { first: 2585, second: 23472, third: 32770, tci: 1760 }, zeroWind: { first: 2306, second: 20696, third: 28261, tci: 1740 }, headwind10: { first: 2213, second: 19787, third: 26861, tci: 1730 }, headwind30: { first: 2028, second: 17991, third: 24131, tci: 1720 } },
            { temp: 0,   tailwind10: { first: 2606, second: 26024, third: 37164, tci: 1720 }, zeroWind: { first: 2347, second: 22953, third: 32071, tci: 1700 }, headwind10: { first: 2255, second: 21949, third: 30532, tci: 1690 }, headwind30: { first: 2069, second: 19970, third: 27264, tci: 1670 } },
            { temp: 5,   tailwind10: { first: 2444, second: 30705, third: 44499, tci: 1730 }, zeroWind: { first: 2366, second: 27030, third: 38305, tci: 1700 }, headwind10: { first: 2273, second: 25833, third: 35372, tci: 1700 }, headwind30: { first: 2088, second: 23479, third: 32485, tci: 1670 } }
        ]
    },
    {
        weight: 17500,
        data: [
            { temp: -54, tailwind10: { first: 2336, second: 22312, third: 29904, tci: 2150 }, zeroWind: { first: 2058, second: 19411, third: 25574, tci: 2120 }, headwind10: { first: 1965, second: 18463, third: 24183, tci: 2110 }, headwind30: { first: 1780, second: 16592, third: 21357, tci: 2090 } },
            { temp: -35, tailwind10: { first: 2424, second: 22149, third: 30279, tci: 1980 }, zeroWind: { first: 2145, second: 19376, third: 26024, tci: 1950 }, headwind10: { first: 2053, second: 18468, third: 24656, tci: 1940 }, headwind30: { first: 1867, second: 16573, third: 21867, tci: 1920 } },
            { temp: -30, tailwind10: { first: 2446, second: 22115, third: 30458, tci: 1930 }, zeroWind: { first: 2168, second: 19371, third: 26076, tci: 1910 }, headwind10: { first: 2075, second: 18472, third: 24714, tci: 1900 }, headwind30: { first: 1889, second: 16696, third: 22062, tci: 1880 } },
            { temp: -25, tailwind10: { first: 2468, second: 22081, third: 30489, tci: 1900 }, zeroWind: { first: 2190, second: 19366, third: 26266, tci: 1870 }, headwind10: { first: 2097, second: 18476, third: 24906, tci: 1860 }, headwind30: { first: 1912, second: 16717, third: 22133, tci: 1850 } },
            { temp: -20, tailwind10: { first: 2490, second: 22048, third: 30571, tci: 1860 }, zeroWind: { first: 2212, second: 19360, third: 26316, tci: 1830 }, headwind10: { first: 2119, second: 18478, third: 24962, tci: 1830 }, headwind30: { first: 1933, second: 16738, third: 22329, tci: 1810 } },
            { temp: -15, tailwind10: { first: 2512, second: 22013, third: 30854, tci: 1820 }, zeroWind: { first: 2234, second: 19352, third: 26505, tci: 1800 }, headwind10: { first: 2141, second: 18479, third: 25154, tci: 1790 }, headwind30: { first: 1955, second: 16755, third: 22395, tci: 1770 } },
            { temp: -10, tailwind10: { first: 2533, second: 21980, third: 30886, tci: 1790 }, zeroWind: { first: 2255, second: 19345, third: 26555, tci: 1760 }, headwind10: { first: 2162, second: 18481, third: 25210, tci: 1760 }, headwind30: { first: 1977, second: 16774, third: 22592, tci: 1740 } },
            { temp: -5,  tailwind10: { first: 2555, second: 21953, third: 31080, tci: 1750 }, zeroWind: { first: 2276, second: 19343, third: 26752, tci: 1730 }, headwind10: { first: 2184, second: 18487, third: 25409, tci: 1720 }, headwind30: { first: 1998, second: 16795, third: 22794, tci: 1710 } },
            { temp: 0,   tailwind10: { first: 2576, second: 21935, third: 31123, tci: 1720 }, zeroWind: { first: 2297, second: 19348, third: 26957, tci: 1700 }, headwind10: { first: 2205, second: 18499, third: 25475, tci: 1690 }, headwind30: { first: 2019, second: 16822, third: 22870, tci: 1680 } },
            { temp: 5,   tailwind10: { first: 2595, second: 24206, third: 35020, tci: 1710 }, zeroWind: { first: 2317, second: 21339, third: 30156, tci: 1680 }, headwind10: { first: 2224, second: 20400, third: 28692, tci: 1680 }, headwind30: { first: 2039, second: 18548, third: 25703, tci: 1660 } },
            { temp: 10,  tailwind10: { first: 2614, second: 28321, third: 41478, tci: 1710 }, zeroWind: { first: 2335, second: 24927, third: 35764, tci: 1680 }, headwind10: { first: 2243, second: 23820, third: 33790, tci: 1670 }, headwind30: { first: 2057, second: 21640, third: 30244, tci: 1660 } }
        ]
    },
    {
        weight: 17000,
        data: [
            { temp: -54, tailwind10: { first: 2309, second: 20872, third: 28310, tci: 2140 }, zeroWind: { first: 2031, second: 18146, third: 24039, tci: 2110 }, headwind10: { first: 1938, second: 17253, third: 22711, tci: 2100 }, headwind30: { first: 1752, second: 15489, third: 20129, tci: 2080 } },
            { temp: -35, tailwind10: { first: 2395, second: 20727, third: 26696, tci: 1960 }, zeroWind: { first: 2117, second: 18116, third: 24482, tci: 1940 }, headwind10: { first: 2024, second: 17259, third: 23175, tci: 1930 }, headwind30: { first: 1838, second: 15567, third: 20629, tci: 1910 } },
            { temp: -30, tailwind10: { first: 2417, second: 20694, third: 26726, tci: 1920 }, zeroWind: { first: 2139, second: 18111, third: 24668, tci: 1900 }, headwind10: { first: 2046, second: 17263, third: 23362, tci: 1890 }, headwind30: { first: 1861, second: 15589, third: 20822, tci: 1870 } },
            { temp: -25, tailwind10: { first: 2439, second: 20663, third: 26907, tci: 1880 }, zeroWind: { first: 2161, second: 18106, third: 24716, tci: 1860 }, headwind10: { first: 2068, second: 17267, third: 23419, tci: 1850 }, headwind30: { first: 1882, second: 15510, third: 20890, tci: 1840 } },
            { temp: -20, tailwind10: { first: 2461, second: 20632, third: 26938, tci: 1840 }, zeroWind: { first: 2182, second: 18101, third: 24907, tci: 1820 }, headwind10: { first: 2090, second: 17270, third: 23609, tci: 1810 }, headwind30: { first: 1904, second: 15629, third: 21054, tci: 1800 } },
            { temp: -15, tailwind10: { first: 2482, second: 20599, third: 29120, tci: 1810 }, zeroWind: { first: 2204, second: 18094, third: 25095, tci: 1790 }, headwind10: { first: 2111, second: 17272, third: 23662, tci: 1780 }, headwind30: { first: 1925, second: 15546, third: 21148, tci: 1770 } },
            { temp: -10, tailwind10: { first: 2503, second: 20569, third: 29307, tci: 1770 }, zeroWind: { first: 2225, second: 18068, third: 25144, tci: 1750 }, headwind10: { first: 2132, second: 17274, third: 23854, tci: 1750 }, headwind30: { first: 1947, second: 15664, third: 21343, tci: 1730 } },
            { temp: -5,  tailwind10: { first: 2524, second: 20544, third: 29344, tci: 1740 }, zeroWind: { first: 2246, second: 18087, third: 25340, tci: 1720 }, headwind10: { first: 2153, second: 17280, third: 23912, tci: 1710 }, headwind30: { first: 1968, second: 15685, third: 21411, tci: 1700 } },
            { temp: 0,   tailwind10: { first: 2546, second: 20527, third: 29544, tci: 1710 }, zeroWind: { first: 2268, second: 18091, third: 25398, tci: 1690 }, headwind10: { first: 2175, second: 17291, third: 24115, tci: 1680 }, headwind30: { first: 1989, second: 15710, third: 21615, tci: 1670 } },
            { temp: 5,   tailwind10: { first: 2565, second: 20538, third: 33026, tci: 1690 }, zeroWind: { first: 2286, second: 19856, third: 28374, tci: 1670 }, headwind10: { first: 2194, second: 18976, third: 26978, tci: 1660 }, headwind30: { first: 2008, second: 17240, third: 24123, tci: 1650 } },
            { temp: 10,  tailwind10: { first: 2583, second: 26171, third: 38852, tci: 1690 }, zeroWind: { first: 2305, second: 23026, third: 33424, tci: 1670 }, headwind10: { first: 2212, second: 21998, third: 31685, tci: 1660 }, headwind30: { first: 2026, second: 19973, third: 28313, tci: 1640 } }
        ]
    },
    {
        weight: 16500,
        data: [
            { temp: -54, tailwind10: { first: 2281, second: 19539, third: 26680, tci: 2120 }, zeroWind: { first: 2003, second: 16970, third: 22723, tci: 2100 }, headwind10: { first: 1910, second: 16127, third: 21452, tci: 2090 }, headwind30: { first: 1724, second: 14462, third: 18978, tci: 2070 } },
            { temp: -35, tailwind10: { first: 2366, second: 19404, third: 27065, tci: 1950 }, zeroWind: { first: 2088, second: 16943, third: 23154, tci: 1930 }, headwind10: { first: 1995, second: 16135, third: 21909, tci: 1920 }, headwind30: { first: 1809, second: 14538, third: 19459, tci: 1900 } },
            { temp: -30, tailwind10: { first: 2388, second: 19374, third: 27244, tci: 1910 }, zeroWind: { first: 2109, second: 16938, third: 23350, tci: 1690 }, headwind10: { first: 2017, second: 16139, third: 22096, tci: 1880 }, headwind30: { first: 1831, second: 14558, third: 19535, tci: 1860 } },
            { temp: -25, tailwind10: { first: 2409, second: 19345, third: 27275, tci: 1870 }, zeroWind: { first: 2131, second: 16934, third: 23399, tci: 1850 }, headwind10: { first: 2038, second: 16143, third: 22151, tci: 1840 }, headwind30: { first: 1853, second: 14578, third: 19725, tci: 1830 } },
            { temp: -20, tailwind10: { first: 2431, second: 19316, third: 27457, tci: 1830 }, zeroWind: { first: 2152, second: 16930, third: 23585, tci: 1610 }, headwind10: { first: 2060, second: 16146, third: 22340, tci: 1800 }, headwind30: { first: 1874, second: 14597, third: 19789, tci: 1790 } },
            { temp: -15, tailwind10: { first: 2452, second: 19285, third: 27487, tci: 1800 }, zeroWind: { first: 2174, second: 16923, third: 23632, tci: 1780 }, headwind10: { first: 2081, second: 16148, third: 22392, tci: 1770 }, headwind30: { first: 1895, second: 14613, third: 19979, tci: 1760 } },
            { temp: -10, tailwind10: { first: 2473, second: 19258, third: 27673, tci: 1760 }, zeroWind: { first: 2194, second: 16919, third: 23822, tci: 1740 }, headwind10: { first: 2102, second: 16150, third: 22583, tci: 1740 }, headwind30: { first: 1916, second: 14630, third: 20042, tci: 1720 } },
            { temp: -5,  tailwind10: { first: 2494, second: 19235, third: 27866, tci: 1730 }, zeroWind: { first: 2215, second: 16917, third: 23873, tci: 1710 }, headwind10: { first: 2122, second: 16157, third: 22640, tci: 1700 }, headwind30: { first: 1937, second: 14650, third: 20238, tci: 1690 } },
            { temp: 0,   tailwind10: { first: 2514, second: 19218, third: 27907, tci: 1700 }, zeroWind: { first: 2236, second: 16921, third: 24073, tci: 1680 }, headwind10: { first: 2143, second: 16167, third: 22840, tci: 1670 }, headwind30: { first: 1957, second: 14674, third: 20439, tci: 1660 } },
            { temp: 5,   tailwind10: { first: 2533, second: 21003, third: 31168, tci: 1680 }, zeroWind: { first: 2255, second: 18488, third: 26709, tci: 1660 }, headwind10: { first: 2162, second: 17864, third: 25376, tci: 1650 }, headwind30: { first: 1977, second: 16034, third: 22645, tci: 1640 } },
            { temp: 10,  tailwind10: { first: 2551, second: 24220, third: 36426, tci: 1680 }, zeroWind: { first: 2273, second: 21298, third: 31259, tci: 1650 }, headwind10: { first: 2181, second: 20342, third: 29605, tci: 1650 }, headwind30: { first: 1995, second: 18456, third: 26395, tci: 1630 } }
        ]
    },
    {
        weight: 16000,
        data: [
            { temp: -54, tailwind10: { first: 2253, second: 18297, third: 25285, tci: 2110 }, zeroWind: { first: 1974, second: 15873, third: 21489, tci: 2080 }, headwind10: { first: 1881, second: 15077, third: 20268, tci: 2080 }, headwind30: { first: 1696, second: 13504, third: 17896, tci: 2060 } },
            { temp: -35, tailwind10: { first: 2334, second: 18171, third: 25674, tci: 1940 }, zeroWind: { first: 2056, second: 15849, third: 21927, tci: 1920 }, headwind10: { first: 1964, second: 15086, third: 20721, tci: 1910 }, headwind30: { first: 1778, second: 13577, third: 18379, tci: 1900 } },
            { temp: -30, tailwind10: { first: 2358, second: 18143, third: 25704, tci: 1900 }, zeroWind: { first: 2080, second: 15845, third: 21973, tci: 1880 }, headwind10: { first: 1987, second: 15090, third: 20774, tci: 1870 }, headwind30: { first: 1801, second: 13596, third: 18442, tci: 1860 } },
            { temp: -25, tailwind10: { first: 2379, second: 18116, third: 25985, tci: 1860 }, zeroWind: { first: 2101, second: 15842, third: 22156, tci: 1840 }, headwind10: { first: 2008, second: 15094, third: 20961, tci: 1830 }, headwind30: { first: 1822, second: 13615, third: 18631, tci: 1820 } },
            { temp: -20, tailwind10: { first: 2400, second: 18089, third: 25916, tci: 1820 }, zeroWind: { first: 2122, second: 15837, third: 22205, tci: 1800 }, headwind10: { first: 2029, second: 15097, third: 21013, tci: 1800 }, headwind30: { first: 1843, second: 13633, third: 18693, tci: 1780 } },
            { temp: -15, tailwind10: { first: 2421, second: 18061, third: 26098, tci: 1790 }, zeroWind: { first: 2143, second: 15832, third: 22390, tci: 1770 }, headwind10: { first: 2050, second: 15099, third: 21199, tci: 1760 }, headwind30: { first: 1864, second: 13649, third: 18881, tci: 1750 } },
            { temp: -10, tailwind10: { first: 2442, second: 18035, third: 26130, tci: 1750 }, zeroWind: { first: 2163, second: 15827, third: 22437, tci: 1730 }, headwind10: { first: 2071, second: 15102, third: 21251, tci: 1730 }, headwind30: { first: 1885, second: 13666, third: 18941, tci: 1710 } },
            { temp: -5,  tailwind10: { first: 2462, second: 18013, third: 26320, tci: 1720 }, zeroWind: { first: 2184, second: 15827, third: 22630, tci: 1700 }, headwind10: { first: 2091, second: 15108, third: 21442, tci: 1690 }, headwind30: { first: 1905, second: 13685, third: 19134, tci: 1680 } },
            { temp: 0,   tailwind10: { first: 2482, second: 17997, third: 26519, tci: 1690 }, zeroWind: { first: 2204, second: 15830, third: 22684, tci: 1670 }, headwind10: { first: 2111, second: 15117, third: 21500, tci: 1660 }, headwind30: { first: 1926, second: 13707, third: 19199, tci: 1650 } },
            { temp: 5,   tailwind10: { first: 2501, second: 19585, third: 29258, tci: 1670 }, zeroWind: { first: 2223, second: 17224, third: 25149, tci: 1650 }, headwind10: { first: 2130, second: 16449, third: 23875, tci: 1640 }, headwind30: { first: 1945, second: 14917, third: 21259, tci: 1630 } },
            { temp: 10,  tailwind10: { first: 2519, second: 22442, third: 34172, tci: 1660 }, zeroWind: { first: 2241, second: 19721, third: 29244, tci: 1640 }, headwind10: { first: 2148, second: 18829, third: 27667, tci: 1630 }, headwind30: { first: 1962, second: 17070, third: 24744, tci: 1620 } }
        ]
    },
    {
        weight: 15500,
        data: [
            { temp: -54, tailwind10: { first: 2224, second: 17137, third: 23975, tci: 2100 }, zeroWind: { first: 1945, second: 14848, third: 20327, tci: 2070 }, headwind10: { first: 1852, second: 14096, third: 19155, tci: 2070 }, headwind30: { first: 1667, second: 12504, third: 16874, tci: 2050 } },
            { temp: -35, tailwind10: { first: 2306, second: 17020, third: 24367, tci: 1930 }, zeroWind: { first: 2026, second: 14626, third: 20761, tci: 1910 }, headwind10: { first: 1935, second: 14105, third: 19604, tci: 1900 }, headwind30: { first: 1749, second: 12578, third: 17353, tci: 1890 } },
            { temp: -30, tailwind10: { first: 2327, second: 16997, third: 24401, tci: 1890 }, zeroWind: { first: 2049, second: 14823, third: 20807, tci: 1870 }, headwind10: { first: 1956, second: 14109, third: 19655, tci: 1860 }, headwind30: { first: 1771, second: 12697, third: 17414, tci: 1850 } },
            { temp: -25, tailwind10: { first: 2348, second: 16968, third: 24578, tci: 1850 }, zeroWind: { first: 2070, second: 14820, third: 20853, tci: 1630 }, headwind10: { first: 1977, second: 14113, third: 19706, tci: 1820 }, headwind30: { first: 1792, second: 12715, third: 17599, tci: 1810 } },
            { temp: -20, tailwind10: { first: 2369, second: 16943, third: 24609, tci: 1810 }, zeroWind: { first: 2091, second: 14816, third: 21037, tci: 1790 }, headwind10: { first: 1998, second: 14117, third: 19889, tci: 1790 }, headwind30: { first: 1812, second: 12732, third: 17658, tci: 1770 } },
            { temp: -15, tailwind10: { first: 2390, second: 16916, third: 24791, tci: 1780 }, zeroWind: { first: 2111, second: 14811, third: 21081, tci: 1760 }, headwind10: { first: 2018, second: 14119, third: 19937, tci: 1750 }, headwind30: { first: 1833, second: 12747, third: 17844, tci: 1740 } },
            { temp: -10, tailwind10: { first: 2410, second: 16892, third: 24822, tci: 1740 }, zeroWind: { first: 2131, second: 14807, third: 21266, tci: 1720 }, headwind10: { first: 2039, second: 14122, third: 20124, tci: 1720 }, headwind30: { first: 1853, second: 12763, third: 17903, tci: 1710 } },
            { temp: -5,  tailwind10: { first: 2430, second: 16872, third: 24857, tci: 1710 }, zeroWind: { first: 2152, second: 14807, third: 21316, tci: 1690 }, headwind10: { first: 2059, second: 14127, third: 20177, tci: 1690 }, headwind30: { first: 1873, second: 12781, third: 18094, tci: 1670 } },
            { temp: 0,   tailwind10: { first: 2450, second: 16857, third: 25054, tci: 1680 }, zeroWind: { first: 2172, second: 14810, third: 21511, tci: 1660 }, headwind10: { first: 2079, second: 14136, third: 20372, tci: 1660 }, headwind30: { first: 1893, second: 12802, third: 18157, tci: 1640 } },
            { temp: 5,   tailwind10: { first: 2469, second: 18271, third: 27632, tci: 1660 }, zeroWind: { first: 2190, second: 16052, third: 23681, tci: 1640 }, headwind10: { first: 2098, second: 15323, third: 22462, tci: 1630 }, headwind30: { first: 1912, second: 13881, third: 20087, tci: 1620 } },
            { temp: 10,  tailwind10: { first: 2488, second: 20815, third: 32070, tci: 1650 }, zeroWind: { first: 2209, second: 18276, third: 27362, tci: 1630 }, headwind10: { first: 2116, second: 17443, third: 26000, tci: 1620 }, headwind30: { first: 1931, second: 15798, third: 23074, tci: 1610 } }
        ]
    },
    {
        weight: 14500,
        data: [
            { temp: -54, tailwind10: { first: 2164, second: 15032, third: 21430, tci: 2080 }, zeroWind: { first: 1885, second: 12956, third: 18065, tci: 2060 }, headwind10: { first: 1793, second: 12313, third: 16986, tci: 2050 }, headwind30: { first: 1607, second: 10980, third: 14891, tci: 2030 } },
            { temp: -35, tailwind10: { first: 2244, second: 14930, third: 21819, tci: 1910 }, zeroWind: { first: 1965, second: 12969, third: 18488, tci: 1890 }, headwind10: { first: 1873, second: 12324, third: 17419, tci: 1890 }, headwind30: { first: 1687, second: 11045, third: 15343, tci: 1870 } },
            { temp: -30, tailwind10: { first: 2264, second: 14907, third: 21848, tci: 1870 }, zeroWind: { first: 1986, second: 12966, third: 18530, tci: 1850 }, headwind10: { first: 1893, second: 12328, third: 17466, tci: 1840 }, headwind30: { first: 1707, second: 11062, third: 15523, tci: 1830 } },
            { temp: -25, tailwind10: { first: 2284, second: 14884, third: 22028, tci: 1830 }, zeroWind: { first: 2005, second: 12964, third: 18710, tci: 1810 }, headwind10: { first: 1913, second: 12331, third: 17646, tci: 1810 }, headwind30: { first: 1728, second: 11078, third: 15579, tci: 1800 } },
            { temp: -20, tailwind10: { first: 2305, second: 14862, third: 22057, tci: 1790 }, zeroWind: { first: 2026, second: 12961, third: 18752, tci: 1780 }, headwind10: { first: 1933, second: 12335, third: 17692, tci: 1770 }, headwind30: { first: 1748, second: 11094, third: 15760, tci: 1760 } },
            { temp: -15, tailwind10: { first: 2324, second: 14839, third: 22086, tci: 1760 }, zeroWind: { first: 2046, second: 12957, third: 18934, tci: 1740 }, headwind10: { first: 1953, second: 12337, third: 17874, tci: 1740 }, headwind30: { first: 1767, second: 11108, third: 15813, tci: 1730 } },
            { temp: -10, tailwind10: { first: 2344, second: 14818, third: 22270, tci: 1720 }, zeroWind: { first: 2066, second: 12954, third: 18977, tci: 1710 }, headwind10: { first: 1973, second: 12340, third: 17920, tci: 1700 }, headwind30: { first: 1787, second: 11123, third: 15996, tci: 1690 } },
            { temp: -5,  tailwind10: { first: 2364, second: 14801, third: 22304, tci: 1690 }, zeroWind: { first: 2085, second: 12954, third: 19165, tci: 1680 }, headwind10: { first: 1993, second: 12346, third: 18106, tci: 1670 }, headwind30: { first: 1807, second: 11140, third: 16052, tci: 1660 } },
            { temp: 0,   tailwind10: { first: 2383, second: 14787, third: 22498, tci: 1660 }, zeroWind: { first: 2105, second: 12957, third: 19212, tci: 1650 }, headwind10: { first: 2012, second: 12354, third: 18157, tci: 1640 }, headwind30: { first: 1826, second: 11158, third: 16241, tci: 1630 } },
            { temp: 5,   tailwind10: { first: 2401, second: 15911, third: 24633, tci: 1640 }, zeroWind: { first: 2123, second: 13945, third: 21135, tci: 1620 }, headwind10: { first: 2030, second: 13298, third: 20010, tci: 1620 }, headwind30: { first: 1845, second: 12016, third: 17659, tci: 1610 } },
            { temp: 10,  tailwind10: { first: 2419, second: 17941, third: 28252, tci: 1630 }, zeroWind: { first: 2140, second: 15719, third: 24082, tci: 1610 }, headwind10: { first: 2048, second: 14990, third: 22845, tci: 1600 }, headwind30: { first: 1862, second: 13545, third: 20296, tci: 1590 } }
        ]
    },
    {
        weight: 13500,
        data: [
            { temp: -54, tailwind10: { first: 2101, second: 13171, third: 19134, tci: 2060 }, zeroWind: { first: 1823, second: 11339, third: 16154, tci: 2040 }, headwind10: { first: 1735, second: 10735, third: 15154, tci: 2030 }, headwind30: { first: 1544, second: 9539, third: 13214, tci: 2020 } },
            { temp: -35, tailwind10: { first: 2178, second: 13082, third: 19520, tci: 1890 }, zeroWind: { first: 1900, second: 11325, third: 16434, tci: 1870 }, headwind10: { first: 1807, second: 10747, third: 15445, tci: 1870 }, headwind30: { first: 1622, second: 9599, third: 13651, tci: 1860 } },
            { temp: -30, tailwind10: { first: 2198, second: 13061, third: 19547, tci: 1850 }, zeroWind: { first: 1920, second: 11323, third: 16610, tci: 1630 }, headwind10: { first: 1827, second: 10750, third: 15620, tci: 1830 }, headwind30: { first: 1641, second: 9614, third: 13702, tci: 1820 } },
            { temp: -25, tailwind10: { first: 2218, second: 13042, third: 19725, tci: 1810 }, zeroWind: { first: 1939, second: 11321, third: 16650, tci: 1800 }, headwind10: { first: 1847, second: 10754, third: 15664, tci: 1790 }, headwind30: { first: 1661, second: 9629, third: 13878, tci: 1780 } },
            { temp: -20, tailwind10: { first: 2237, second: 13022, third: 19753, tci: 1780 }, zeroWind: { first: 1959, second: 11319, third: 16827, tci: 1760 }, headwind10: { first: 1866, second: 10757, third: 15841, tci: 1760 }, headwind30: { first: 1680, second: 9644, third: 13928, tci: 1750 } },
            { temp: -15, tailwind10: { first: 2256, second: 13002, third: 19781, tci: 1740 }, zeroWind: { first: 1978, second: 11316, third: 16866, tci: 1730 }, headwind10: { first: 1885, second: 10760, third: 15883, tci: 1720 }, headwind30: { first: 1700, second: 9657, third: 14104, tci: 1710 } },
            { temp: -10, tailwind10: { first: 2275, second: 12984, third: 19964, tci: 1710 }, zeroWind: { first: 1997, second: 11314, third: 16905, tci: 1690 }, headwind10: { first: 1904, second: 10763, third: 16064, tci: 1690 }, headwind30: { first: 1719, second: 9670, third: 14153, tci: 1680 } },
            { temp: -5,  tailwind10: { first: 2294, second: 12968, third: 19996, tci: 1680 }, zeroWind: { first: 2016, second: 11314, third: 17089, tci: 1660 }, headwind10: { first: 1923, second: 10768, third: 16109, tci: 1660 }, headwind30: { first: 1738, second: 9686, third: 14204, tci: 1650 } },
            { temp: 0,   tailwind10: { first: 2313, second: 12956, third: 20187, tci: 1650 }, zeroWind: { first: 2035, second: 11316, third: 17133, tci: 1630 }, headwind10: { first: 1942, second: 10775, third: 16296, tci: 1630 }, headwind30: { first: 1756, second: 9702, third: 14387, tci: 1620 } },
            { temp: 5,   tailwind10: { first: 2331, second: 13853, third: 21943, tci: 1620 }, zeroWind: { first: 2053, second: 12105, third: 18714, tci: 1610 }, headwind10: { first: 1960, second: 11529, third: 17679, tci: 1600 }, headwind30: { first: 1774, second: 10386, third: 15666, tci: 1590 } },
            { temp: 10,  tailwind10: { first: 2348, second: 15483, third: 25012, tci: 1610 }, zeroWind: { first: 2070, second: 13529, third: 21321, tci: 1590 }, headwind10: { first: 1977, second: 12886, third: 20042, tci: 1590 }, headwind30: { first: 1792, second: 11612, third: 17842, tci: 1580 } }
        ]
    }
];

const singleEngineFlightPathDistances_5000ft_anti_ice_on = [
    {
        weight: 20000,
        data: [
            { temp: -54, tailwind10: { first: 2507, second: 31231, third: 40183, tci: 2230 }, zeroWind: { first: 2228, second: 27321, third: 34565, tci: 2190 }, headwind10: { first: 2136, second: 26047, third: 32702, tci: 2170 }, headwind30: { first: 1950, second: 23542, third: 29295, tci: 2150 } },
            { temp: -35, tailwind10: { first: 2601, second: 31017, third: 40566, tci: 2050 }, zeroWind: { first: 2323, second: 27273, third: 35076, tci: 2010 }, headwind10: { first: 2230, second: 26053, third: 33357, tci: 2000 }, headwind30: { first: 2045, second: 23650, third: 29882, tci: 1980 } },
            { temp: -30, tailwind10: { first: 2626, second: 30973, third: 40752, tci: 2000 }, zeroWind: { first: 2347, second: 27268, third: 35281, tci: 1970 }, headwind10: { first: 2254, second: 26060, third: 33431, tci: 1950 }, headwind30: { first: 2069, second: 23682, third: 29975, tci: 1940 } },
            { temp: -25, tailwind10: { first: 2650, second: 30930, third: 40941, tci: 1960 }, zeroWind: { first: 2371, second: 27263, third: 35344, tci: 1930 }, headwind10: { first: 2278, second: 26068, third: 33641, tci: 1920 }, headwind30: { first: 2093, second: 23713, third: 30194, tci: 1900 } },
            { temp: -20, tailwind10: { first: 2673, second: 30893, third: 40982, tci: 1920 }, zeroWind: { first: 2395, second: 27256, third: 35555, tci: 1890 }, headwind10: { first: 2302, second: 26079, third: 33718, tci: 1880 }, headwind30: { first: 2117, second: 23747, third: 30417, tci: 1860 } },
            { temp: -15, tailwind10: { first: 2697, second: 30856, third: 41179, tci: 1880 }, zeroWind: { first: 2419, second: 27263, third: 35624, tci: 1850 }, headwind10: { first: 2326, second: 26090, third: 33934, tci: 1840 }, headwind30: { first: 2140, second: 23780, third: 30510, tci: 1820 } },
            { temp: -10, tailwind10: { first: 2720, second: 30893, third: 41228, tci: 1850 }, zeroWind: { first: 2442, second: 27258, third: 35555, tci: 1820 }, headwind10: { first: 2349, second: 26105, third: 34156, tci: 1810 }, headwind30: { first: 2163, second: 23816, third: 30738, tci: 1790 } },
            { temp: -5,  tailwind10: { first: 2743, second: 31019, third: 42094, tci: 1810 }, zeroWind: { first: 2465, second: 27452, third: 36501, tci: 1780 }, headwind10: { first: 2372, second: 26268, third: 34659, tci: 1790 }, headwind30: { first: 2187, second: 23998, third: 31221, tci: 1760 } },
            { temp: 0,   tailwind10: { first: 2765, second: 32956, third: 45273, tci: 1800 }, zeroWind: { first: 2487, second: 29153, third: 39201, tci: 1770 }, headwind10: { first: 2394, second: 27914, third: 37256, tci: 1760 }, headwind30: { first: 2209, second: 25480, third: 33619, tci: 1740 } },
            { temp: 5,   tailwind10: { first: 2788, second: 40067, third: 55597, tci: 1820 }, zeroWind: { first: 2508, second: 35330, third: 48141, tci: 1780 }, headwind10: { first: 2415, second: 33795, third: 45679, tci: 1790 }, headwind30: { first: 2229, second: 30791, third: 41059, tci: 1750 } },
            { temp: 10,  tailwind10: { first: 2805, second: 52364, third: 73120, tci: 1890 }, zeroWind: { first: 2527, second: 45903, third: 62712, tci: 1830 }, headwind10: { first: 2434, second: 43829, third: 59460, tci: 1820 }, headwind30: { first: 2248, second: 39795, third: 53328, tci: 1790 } }
        ]
    },
    {
        weight: 19500,
        data: [
            { temp: -54, tailwind10: { first: 2481, second: 29115, third: 37904, tci: 2210 }, zeroWind: { first: 2203, second: 25459, third: 32443, tci: 2170 }, headwind10: { first: 2110, second: 24264, third: 30775, tci: 2160 }, headwind30: { first: 1924, second: 21922, third: 27421, tci: 2130 } },
            { temp: -35, tailwind10: { first: 2575, second: 28917, third: 38297, tci: 2030 }, zeroWind: { first: 2296, second: 25419, third: 33067, tci: 1990 }, headwind10: { first: 2203, second: 24277, third: 31297, tci: 1980 }, headwind30: { first: 2018, second: 22027, third: 28119, tci: 1960 } },
            { temp: -30, tailwind10: { first: 2598, second: 28876, third: 38332, tci: 1980 }, zeroWind: { first: 2320, second: 25415, third: 33130, tci: 1950 }, headwind10: { first: 2227, second: 24284, third: 31504, tci: 1940 }, headwind30: { first: 2042, second: 22058, third: 28208, tci: 1920 } },
            { temp: -25, tailwind10: { first: 2622, second: 28836, third: 38520, tci: 1940 }, zeroWind: { first: 2344, second: 25410, third: 33334, tci: 1910 }, headwind10: { first: 2251, second: 24291, third: 31575, tci: 1900 }, headwind30: { first: 2066, second: 22087, third: 28424, tci: 1880 } },
            { temp: -20, tailwind10: { first: 2646, second: 28802, third: 38716, tci: 1900 }, zeroWind: { first: 2367, second: 25410, third: 33400, tci: 1870 }, headwind10: { first: 2275, second: 24302, third: 31787, tci: 1850 }, headwind30: { first: 2089, second: 22115, third: 28511, tci: 1840 } },
            { temp: -15, tailwind10: { first: 2669, second: 28770, third: 38759, tci: 1870 }, zeroWind: { first: 2391, second: 25411, third: 33609, tci: 1840 }, headwind10: { first: 2298, second: 24313, third: 32001, tci: 1830 }, headwind30: { first: 2112, second: 22150, third: 28734, tci: 1810 } },
            { temp: -10, tailwind10: { first: 2692, second: 28744, third: 38965, tci: 1830 }, zeroWind: { first: 2414, second: 25415, third: 33826, tci: 1800 }, headwind10: { first: 2321, second: 24328, third: 32079, tci: 1790 }, headwind30: { first: 2135, second: 22184, third: 28958, tci: 1770 } },
            { temp: -5,  tailwind10: { first: 2715, second: 28903, third: 39541, tci: 1800 }, zeroWind: { first: 2437, second: 25574, third: 34632, tci: 1770 }, headwind10: { first: 2344, second: 24446, third: 32698, tci: 1750 }, headwind30: { first: 2158, second: 22851, third: 29418, tci: 1740 } },
            { temp: 0,   tailwind10: { first: 2737, second: 30597, third: 42580, tci: 1780 }, zeroWind: { first: 2459, second: 27064, third: 36806, tci: 1750 }, headwind10: { first: 2366, second: 25912, third: 34955, tci: 1740 }, headwind30: { first: 2180, second: 23645, third: 31503, tci: 1720 } },
            { temp: 5,   tailwind10: { first: 2757, second: 36739, third: 51723, tci: 1790 }, zeroWind: { first: 2479, second: 32411, third: 44625, tci: 1760 }, headwind10: { first: 2386, second: 31006, third: 42313, tci: 1750 }, headwind30: { first: 2201, second: 28251, third: 38109, tci: 1730 } },
            { temp: 10,  tailwind10: { first: 2776, second: 47142, third: 66632, tci: 1840 }, zeroWind: { first: 2498, second: 41368, third: 57178, tci: 1800 }, headwind10: { first: 2405, second: 39535, third: 54319, tci: 1790 }, headwind30: { first: 2219, second: 35920, third: 48653, tci: 1760 } }
        ]
    },
    {
        weight: 19000,
        data: [
            { temp: -54, tailwind10: { first: 2455, second: 27170, third: 35652, tci: 2190 }, zeroWind: { first: 2177, second: 23751, third: 30587, tci: 2150 }, headwind10: { first: 2084, second: 22634, third: 29003, tci: 2140 }, headwind30: { first: 1898, second: 20434, third: 25808, tci: 2120 } },
            { temp: -35, tailwind10: { first: 2547, second: 26993, third: 36053, tci: 2010 }, zeroWind: { first: 2269, second: 23717, third: 31073, tci: 1980 }, headwind10: { first: 2176, second: 22646, third: 29518, tci: 1970 }, headwind30: { first: 1991, second: 20536, third: 26363, tci: 1950 } },
            { temp: -30, tailwind10: { first: 2571, second: 26955, third: 36240, tci: 1970 }, zeroWind: { first: 2293, second: 23714, third: 31274, tci: 1940 }, headwind10: { first: 2200, second: 22654, third: 29588, tci: 1930 }, headwind30: { first: 2014, second: 20565, third: 26575, tci: 1910 } },
            { temp: -25, tailwind10: { first: 2595, second: 26918, third: 36277, tci: 1930 }, zeroWind: { first: 2316, second: 23710, third: 31335, tci: 1900 }, headwind10: { first: 2223, second: 22661, third: 29793, tci: 1890 }, headwind30: { first: 2038, second: 20593, third: 26659, tci: 1870 } },
            { temp: -20, tailwind10: { first: 2618, second: 26886, third: 36472, tci: 1890 }, zeroWind: { first: 2339, second: 23710, third: 31541, tci: 1860 }, headwind10: { first: 2247, second: 22671, third: 30002, tci: 1850 }, headwind30: { first: 2061, second: 20622, third: 26874, tci: 1830 } },
            { temp: -15, tailwind10: { first: 2641, second: 26857, third: 36570, tci: 1850 }, zeroWind: { first: 2362, second: 23711, third: 31606, tci: 1820 }, headwind10: { first: 2270, second: 22682, third: 30074, tci: 1810 }, headwind30: { first: 2084, second: 20552, third: 27091, tci: 1800 } },
            { temp: -10, tailwind10: { first: 2664, second: 26832, third: 36719, tci: 1810 }, zeroWind: { first: 2385, second: 23716, third: 31815, tci: 1790 }, headwind10: { first: 2292, second: 22696, third: 30291, tci: 1790 }, headwind30: { first: 2107, second: 20684, third: 27179, tci: 1760 } },
            { temp: -5,  tailwind10: { first: 2686, second: 26968, third: 37370, tci: 1780 }, zeroWind: { first: 2408, second: 23852, third: 32430, tci: 1750 }, headwind10: { first: 2315, second: 22834, third: 30746, tci: 1750 }, headwind30: { first: 2129, second: 20824, third: 27618, tci: 1730 } },
            { temp: 0,   tailwind10: { first: 2708, second: 28454, third: 39943, tci: 1760 }, zeroWind: { first: 2429, second: 25164, third: 34597, tci: 1730 }, headwind10: { first: 2337, second: 24089, third: 32834, tci: 1720 }, headwind30: { first: 2151, second: 21973, third: 29549, tci: 1710 } },
            { temp: 5,   tailwind10: { first: 2728, second: 33788, third: 48126, tci: 1770 }, zeroWind: { first: 2450, second: 29814, third: 41435, tci: 1740 }, headwind10: { first: 2357, second: 26522, third: 39394, tci: 1730 }, headwind30: { first: 2171, second: 25984, third: 35434, tci: 1710 } },
            { temp: 10,  tailwind10: { first: 2747, second: 42671, third: 61054, tci: 1810 }, zeroWind: { first: 2468, second: 37503, third: 52417, tci: 1770 }, headwind10: { first: 2375, second: 35833, third: 49768, tci: 1760 }, headwind30: { first: 2190, second: 32569, third: 44637, tci: 1730 } }
        ]
    },
    {
        weight: 18500,
        data: [
            { temp: -54, tailwind10: { first: 2429, second: 25386, third: 33706, tci: 2170 }, zeroWind: { first: 2150, second: 22178, third: 28869, tci: 2130 }, headwind10: { first: 2057, second: 21129, third: 27229, tci: 2120 }, headwind30: { first: 1872, second: 19062, third: 24297, tci: 2100 } },
            { temp: -35, tailwind10: { first: 2520, second: 25223, third: 34116, tci: 1990 }, zeroWind: { first: 2241, second: 22150, third: 29353, tci: 1960 }, headwind10: { first: 2149, second: 21145, third: 27869, tci: 1950 }, headwind30: { first: 1963, second: 19161, third: 24850, tci: 1930 } },
            { temp: -30, tailwind10: { first: 2543, second: 25188, third: 34152, tci: 1950 }, zeroWind: { first: 2265, second: 22147, third: 29413, tci: 1920 }, headwind10: { first: 2172, second: 21152, third: 27936, tci: 1910 }, headwind30: { first: 1987, second: 19188, third: 25059, tci: 1890 } },
            { temp: -25, tailwind10: { first: 2566, second: 25154, third: 34342, tci: 1910 }, zeroWind: { first: 2288, second: 22144, third: 29613, tci: 1880 }, headwind10: { first: 2195, second: 21159, third: 28140, tci: 1870 }, headwind30: { first: 2010, second: 19215, third: 25140, tci: 1860 } },
            { temp: -20, tailwind10: { first: 2589, second: 25125, third: 34383, tci: 1870 }, zeroWind: { first: 2311, second: 22144, third: 29816, tci: 1840 }, headwind10: { first: 2218, second: 21169, third: 28208, tci: 1840 }, headwind30: { first: 2033, second: 19243, third: 25352, tci: 1820 } },
            { temp: -15, tailwind10: { first: 2612, second: 25097, third: 34581, tci: 1830 }, zeroWind: { first: 2334, second: 22145, third: 29861, tci: 1810 }, headwind10: { first: 2241, second: 21179, third: 28417, tci: 1800 }, headwind30: { first: 2055, second: 19271, third: 25435, tci: 1780 } },
            { temp: -10, tailwind10: { first: 2635, second: 25075, third: 34785, tci: 1800 }, zeroWind: { first: 2356, second: 22150, third: 30092, tci: 1770 }, headwind10: { first: 2263, second: 21192, third: 28490, tci: 1770 }, headwind30: { first: 2078, second: 19302, third: 25651, tci: 1750 } },
            { temp: -5,  tailwind10: { first: 2657, second: 25190, third: 35257, tci: 1770 }, zeroWind: { first: 2378, second: 22269, third: 30539, tci: 1740 }, headwind10: { first: 2286, second: 21313, third: 29070, tci: 1730 }, headwind30: { first: 2100, second: 19426, third: 26073, tci: 1720 } },
            { temp: 0,   tailwind10: { first: 2678, second: 26498, third: 37554, tci: 1740 }, zeroWind: { first: 2400, second: 23426, third: 32552, tci: 1710 }, headwind10: { first: 2307, second: 22422, third: 30868, tci: 1710 }, headwind30: { first: 2122, second: 20441, third: 27739, tci: 1690 } },
            { temp: 5,   tailwind10: { first: 2698, second: 31151, third: 44842, tci: 1750 }, zeroWind: { first: 2420, second: 27458, third: 38662, tci: 1720 }, headwind10: { first: 2327, second: 26295, third: 36733, tci: 1710 }, headwind30: { first: 2142, second: 23949, third: 32989, tci: 1690 } },
            { temp: 10,  tailwind10: { first: 2717, second: 38797, third: 56229, tci: 1780 }, zeroWind: { first: 2438, second: 34122, third: 48309, tci: 1740 }, headwind10: { first: 2346, second: 32608, third: 45832, tci: 1730 }, headwind30: { first: 2160, second: 29642, third: 41043, tci: 1710 } }
        ]
    },
    {
        weight: 18000,
        data: [
            { temp: -54, tailwind10: { first: 2402, second: 23739, third: 31754, tci: 2150 }, zeroWind: { first: 2123, second: 20725, third: 27138, tci: 2120 }, headwind10: { first: 2031, second: 19739, third: 25698, tci: 2110 }, headwind30: { first: 1845, second: 17793, third: 22698, tci: 2090 } },
            { temp: -35, tailwind10: { first: 2492, second: 23590, third: 32164, tci: 1980 }, zeroWind: { first: 2213, second: 20702, third: 27754, tci: 1950 }, headwind10: { first: 2144, second: 19763, third: 26399, tci: 1900 }, headwind30: { first: 1935, second: 17889, third: 23520, tci: 1880 } },
            { temp: -30, tailwind10: { first: 2515, second: 23557, third: 32352, tci: 1930 }, zeroWind: { first: 2237, second: 20599, third: 27812, tci: 1910 }, headwind10: { first: 2144, second: 19763, third: 26399, tci: 1900 }, headwind30: { first: 1958, second: 17915, third: 23520, tci: 1880 } },
            { temp: -25, tailwind10: { first: 2538, second: 23525, third: 32389, tci: 1890 }, zeroWind: { first: 2260, second: 20697, third: 28011, tci: 1870 }, headwind10: { first: 2167, second: 19770, third: 26276, tci: 1860 }, headwind30: { first: 1940, second: 17946, third: 23726, tci: 1840 } },
            { temp: -20, tailwind10: { first: 2560, second: 23498, third: 32584, tci: 1860 }, zeroWind: { first: 2282, second: 20697, third: 28072, tci: 1830 }, headwind10: { first: 2189, second: 19779, third: 26667, tci: 1820 }, headwind30: { first: 2004, second: 17967, third: 23935, tci: 1810 } },
            { temp: -15, tailwind10: { first: 2583, second: 23472, third: 32626, tci: 1820 }, zeroWind: { first: 2304, second: 20698, third: 28276, tci: 1800 }, headwind10: { first: 2212, second: 19789, third: 26874, tci: 1800 }, headwind30: { first: 2026, second: 17993, third: 24013, tci: 1770 } },
            { temp: -10, tailwind10: { first: 2605, second: 23451, third: 32831, tci: 1790 }, zeroWind: { first: 2327, second: 20703, third: 28340, tci: 1760 }, headwind10: { first: 2234, second: 19802, third: 26945, tci: 1750 }, headwind30: { first: 2048, second: 18023, third: 24227, tci: 1740 } },
            { temp: -5,  tailwind10: { first: 2627, second: 23550, third: 33283, tci: 1750 }, zeroWind: { first: 2349, second: 20807, third: 28770, tci: 1730 }, headwind10: { first: 2256, second: 19908, third: 27368, tci: 1720 }, headwind30: { first: 2070, second: 18133, third: 24635, tci: 1710 } },
            { temp: 0,   tailwind10: { first: 2648, second: 24705, third: 35529, tci: 1730 }, zeroWind: { first: 2370, second: 21851, third: 30648, tci: 1700 }, headwind10: { first: 2277, second: 20902, third: 29188, tci: 1700 }, headwind30: { first: 2091, second: 19083, third: 26208, tci: 1680 } },
            { temp: 5,   tailwind10: { first: 2668, second: 28780, third: 41987, tci: 1730 }, zeroWind: { first: 2390, second: 25410, third: 36118, tci: 1700 }, headwind10: { first: 2297, second: 24287, third: 33942, tci: 1690 }, headwind30: { first: 2111, second: 22112, third: 30743, tci: 1680 } },
            { temp: 10,  tailwind10: { first: 2686, second: 35406, third: 51884, tci: 1750 }, zeroWind: { first: 2408, second: 31152, third: 44609, tci: 1720 }, headwind10: { first: 2315, second: 29771, third: 42285, tci: 1710 }, headwind30: { first: 2130, second: 27061, third: 37928, tci: 1690 } }
        ]
    },
    {
        weight: 17500,
        data: [
            { temp: -54, tailwind10: { first: 2374, second: 22211, third: 30068, tci: 2130 }, zeroWind: { first: 2096, second: 19376, third: 25644, tci: 2110 }, headwind10: { first: 2003, second: 18447, third: 24267, tci: 2100 }, headwind30: { first: 1818, second: 16813, third: 21588, tci: 2080 } },
            { temp: -35, tailwind10: { first: 2463, second: 22073, third: 30483, tci: 1980 }, zeroWind: { first: 2185, second: 19356, third: 26119, tci: 1940 }, headwind10: { first: 2092, second: 18465, third: 24763, tci: 1930 }, headwind30: { first: 1907, second: 16706, third: 22123, tci: 1910 } },
            { temp: -30, tailwind10: { first: 2486, second: 22043, third: 30519, tci: 1920 }, zeroWind: { first: 2208, second: 19354, third: 26314, tci: 1900 }, headwind10: { first: 2115, second: 18472, third: 24961, tci: 1890 }, headwind30: { first: 1929, second: 16730, third: 22198, tci: 1870 } },
            { temp: -25, tailwind10: { first: 2509, second: 22013, third: 30748, tci: 1880 }, zeroWind: { first: 2230, second: 19351, third: 26371, tci: 1860 }, headwind10: { first: 2137, second: 18478, third: 25023, tci: 1850 }, headwind30: { first: 1952, second: 16754, third: 22476, tci: 1800 } },
            { temp: -20, tailwind10: { first: 2531, second: 21987, third: 30748, tci: 1840 }, zeroWind: { first: 2253, second: 19352, third: 26571, tci: 1820 }, headwind10: { first: 2160, second: 18487, third: 25225, tci: 1810 }, headwind30: { first: 1974, second: 16779, third: 22552, tci: 1800 } },
            { temp: -15, tailwind10: { first: 2553, second: 21963, third: 30945, tci: 1770 }, zeroWind: { first: 2275, second: 19353, third: 26630, tci: 1780 }, headwind10: { first: 2182, second: 18496, third: 25290, tci: 1780 }, headwind30: { first: 1996, second: 16804, third: 22582, tci: 1760 } },
            { temp: -10, tailwind10: { first: 2575, second: 21944, third: 30992, tci: 1770 }, zeroWind: { first: 2297, second: 19358, third: 26836, tci: 1750 }, headwind10: { first: 2204, second: 18509, third: 25499, tci: 1740 }, headwind30: { first: 2018, second: 16832, third: 22760, tci: 1730 } },
            { temp: -5,  tailwind10: { first: 2597, second: 22028, third: 31588, tci: 1740 }, zeroWind: { first: 2318, second: 19448, third: 27253, tci: 1720 }, headwind10: { first: 2226, second: 18602, third: 25908, tci: 1710 }, headwind30: { first: 2040, second: 16930, third: 23154, tci: 1700 } },
            { temp: 0,   tailwind10: { first: 2618, second: 23051, third: 33543, tci: 1720 }, zeroWind: { first: 2339, second: 20357, third: 28873, tci: 1690 }, headwind10: { first: 2247, second: 19474, third: 27472, tci: 1690 }, headwind30: { first: 2061, second: 17730, third: 24606, tci: 1670 } },
            { temp: 5,   tailwind10: { first: 2636, second: 26633, third: 39194, tci: 1710 }, zeroWind: { first: 2358, second: 23491, third: 33770, tci: 1690 }, headwind10: { first: 2265, second: 22465, third: 32033, tci: 1660 }, headwind30: { first: 2080, second: 20442, third: 28799, tci: 1660 } },
            { temp: 10,  tailwind10: { first: 2655, second: 32408, third: 48094, tci: 1730 }, zeroWind: { first: 2377, second: 28519, third: 41392, tci: 1700 }, headwind10: { first: 2284, second: 27253, third: 39200, tci: 1690 }, headwind30: { first: 2099, second: 24767, third: 35099, tci: 1670 } }
        ]
    },
    {
        weight: 17000,
        data: [
            { temp: -54, tailwind10: { first: 2346, second: 20790, third: 26343, tci: 2120 }, zeroWind: { first: 2068, second: 18120, third: 24244, tci: 2090 }, headwind10: { first: 1975, second: 17244, third: 22926, tci: 2080 }, headwind30: { first: 1790, second: 15514, third: 20351, tci: 2070 } },
            { temp: -35, tailwind10: { first: 2434, second: 20561, third: 26756, tci: 1950 }, zeroWind: { first: 2156, second: 18102, third: 24715, tci: 1920 }, headwind10: { first: 2063, second: 17262, third: 23415, tci: 1920 }, headwind30: { first: 1877, second: 15603, third: 20856, tci: 1900 } },
            { temp: -30, tailwind10: { first: 2457, second: 20632, third: 26943, tci: 1910 }, zeroWind: { first: 2178, second: 18100, third: 24770, tci: 1880 }, headwind10: { first: 2086, second: 17268, third: 23475, tci: 1880 }, headwind30: { first: 1900, second: 15625, third: 20957, tci: 1860 } },
            { temp: -25, tailwind10: { first: 2479, second: 20504, third: 26979, tci: 1870 }, zeroWind: { first: 2201, second: 18097, third: 24964, tci: 1850 }, headwind10: { first: 2108, second: 17275, third: 23672, tci: 1840 }, headwind30: { first: 1922, second: 15548, third: 21156, tci: 1820 } },
            { temp: -20, tailwind10: { first: 2501, second: 20580, third: 29173, tci: 1830 }, zeroWind: { first: 2223, second: 18098, third: 25021, tci: 1810 }, headwind10: { first: 2130, second: 17283, third: 23734, tci: 1800 }, headwind30: { first: 1944, second: 15672, third: 21229, tci: 1790 } },
            { temp: -15, tailwind10: { first: 2523, second: 20557, third: 29213, tci: 1790 }, zeroWind: { first: 2244, second: 18099, third: 25220, tci: 1770 }, headwind10: { first: 2152, second: 17292, third: 23935, tci: 1770 }, headwind30: { first: 1966, second: 15695, third: 21432, tci: 1750 } },
            { temp: -10, tailwind10: { first: 2544, second: 20539, third: 29416, tci: 1760 }, zeroWind: { first: 2266, second: 18103, third: 25425, tci: 1740 }, headwind10: { first: 2173, second: 17304, third: 24000, tci: 1730 }, headwind30: { first: 1988, second: 15722, third: 21508, tci: 1720 } },
            { temp: -5,  tailwind10: { first: 2566, second: 20611, third: 29840, tci: 1730 }, zeroWind: { first: 2287, second: 18183, third: 25683, tci: 1710 }, headwind10: { first: 2195, second: 17385, third: 24397, tci: 1700 }, headwind30: { first: 2009, second: 15809, third: 21890, tci: 1690 } },
            { temp: 0,   tailwind10: { first: 2587, second: 21520, third: 31581, tci: 1700 }, zeroWind: { first: 2308, second: 18991, third: 27203, tci: 1680 }, headwind10: { first: 2215, second: 16161, third: 25864, tci: 1680 }, headwind30: { first: 2030, second: 16522, third: 23120, tci: 1660 } },
            { temp: 5,   tailwind10: { first: 2468, second: 18918, third: 26867, tci: 1650 }, zeroWind: { first: 2328, second: 21759, third: 31740, tci: 1650 }, headwind10: { first: 2235, second: 19484, third: 27585, tci: 1640 }, headwind30: { first: 2049, second: 18918, third: 26867, tci: 1650 } },
            { temp: 10,  tailwind10: { first: 2524, second: 29738, third: 44528, tci: 1710 }, zeroWind: { first: 2346, second: 26167, third: 38456, tci: 1680 }, headwind10: { first: 2253, second: 25003, third: 36382, tci: 1670 }, headwind30: { first: 2067, second: 22713, third: 32508, tci: 1650 } }
        ]
    },
    {
        weight: 16500,
        data: [
            { temp: -54, tailwind10: { first: 2318, second: 19465, third: 26862, tci: 2110 }, zeroWind: { first: 2040, second: 16947, third: 22930, tci: 2080 }, headwind10: { first: 1947, second: 16121, third: 21667, tci: 2070 }, headwind30: { first: 1761, second: 14488, third: 19088, tci: 2060 } },
            { temp: -35, tailwind10: { first: 2407, second: 19345, third: 27277, tci: 1940 }, zeroWind: { first: 2128, second: 16927, third: 23393, tci: 1910 }, headwind10: { first: 2035, second: 16140, third: 22149, tci: 1910 }, headwind30: { first: 1849, second: 14572, third: 19595, tci: 1890 } },
            { temp: -30, tailwind10: { first: 2427, second: 19318, third: 27312, tci: 1900 }, zeroWind: { first: 2148, second: 16930, third: 23450, tci: 1870 }, headwind10: { first: 2056, second: 16145, third: 22208, tci: 1870 }, headwind30: { first: 14594, second: 19791, third: 1850, tci: 1850 } },
            { temp: -25, tailwind10: { first: 2449, second: 19291, third: 27500, tci: 1860 }, zeroWind: { first: 2170, second: 16928, third: 23644, tci: 1840 }, headwind10: { first: 2078, second: 16151, third: 22402, tci: 1830 }, headwind30: { first: 1892, second: 14615, third: 19859, tci: 1810 } },
            { temp: -20, tailwind10: { first: 2470, second: 19269, third: 27539, tci: 1820 }, zeroWind: { first: 2192, second: 16928, third: 23698, tci: 1800 }, headwind10: { first: 2099, second: 16159, third: 22463, tci: 1790 }, headwind30: { first: 1914, second: 14638, third: 20058, tci: 1780 } },
            { temp: -15, tailwind10: { first: 2492, second: 19248, third: 27735, tci: 1780 }, zeroWind: { first: 2214, second: 16929, third: 23896, tci: 1760 }, headwind10: { first: 2121, second: 16168, third: 22662, tci: 1760 }, headwind30: { first: 1935, second: 14661, third: 20127, tci: 1740 } },
            { temp: -10, tailwind10: { first: 2513, second: 19231, third: 27779, tci: 1750 }, zeroWind: { first: 2235, second: 16934, third: 23955, tci: 1730 }, headwind10: { first: 2142, second: 16179, third: 22725, tci: 1720 }, headwind30: { first: 1957, second: 14686, third: 20331, tci: 1710 } },
            { temp: -5,  tailwind10: { first: 2534, second: 19292, third: 28191, tci: 1720 }, zeroWind: { first: 2256, second: 17003, third: 24346, tci: 1700 }, headwind10: { first: 2163, second: 16251, third: 23110, tci: 1690 }, headwind30: { first: 1978, second: 14764, third: 20702, tci: 1680 } },
            { temp: 0,   tailwind10: { first: 2555, second: 20097, third: 29929, tci: 1690 }, zeroWind: { first: 2277, second: 17724, third: 25781, tci: 1670 }, headwind10: { first: 2184, second: 16943, third: 24352, tci: 1670 }, headwind30: { first: 1998, second: 15400, third: 21858, tci: 1650 } },
            { temp: 5,   tailwind10: { first: 2574, second: 22899, third: 34491, tci: 1680 }, zeroWind: { first: 2296, second: 20176, third: 29172, tci: 1660 }, headwind10: { first: 2203, second: 19284, third: 28129, tci: 1650 }, headwind30: { first: 2017, second: 17523, third: 25202, tci: 1640 } },
            { temp: 10,  tailwind10: { first: 2592, second: 27348, third: 41504, tci: 1690 }, zeroWind: { first: 2313, second: 24057, third: 35756, tci: 1660 }, headwind10: { first: 2221, second: 22982, third: 33791, tci: 1650 }, headwind30: { first: 2035, second: 20866, third: 30264, tci: 1640 } }
        ]
    },
    {
        weight: 16000,
        data: [
            { temp: -54, tailwind10: { first: 2289, second: 18229, third: 25325, tci: 2090 }, zeroWind: { first: 2010, second: 15854, third: 21563, tci: 2070 }, headwind10: { first: 1918, second: 15073, third: 20353, tci: 2050 }, headwind30: { first: 1732, second: 13530, third: 18003, tci: 2050 } },
            { temp: -35, tailwind10: { first: 2374, second: 18120, third: 25740, tci: 1920 }, zeroWind: { first: 2096, second: 15840, third: 22020, tci: 1900 }, headwind10: { first: 2003, second: 15091, third: 20825, tci: 1900 }, headwind30: { first: 1818, second: 13510, third: 18501, tci: 1880 } },
            { temp: -30, tailwind10: { first: 2397, second: 18092, third: 25924, tci: 1880 }, zeroWind: { first: 2119, second: 15838, third: 22210, tci: 1860 }, headwind10: { first: 2026, second: 15098, third: 21017, tci: 1880 }, headwind30: { first: 1840, second: 13632, third: 18695, tci: 1840 } },
            { temp: -25, tailwind10: { first: 2418, second: 18068, third: 25959, tci: 1850 }, zeroWind: { first: 2140, second: 15837, third: 22261, tci: 1830 }, headwind10: { first: 2047, second: 15103, third: 21073, tci: 1820 }, headwind30: { first: 1861, second: 13652, third: 18760, tci: 1810 } },
            { temp: -20, tailwind10: { first: 2439, second: 18046, third: 26151, tci: 1810 }, zeroWind: { first: 2161, second: 15837, third: 22456, tci: 1790 }, headwind10: { first: 2068, second: 15111, third: 21268, tci: 1780 }, headwind30: { first: 1883, second: 13674, third: 18957, tci: 1770 } },
            { temp: -15, tailwind10: { first: 2461, second: 18027, third: 26190, tci: 1770 }, zeroWind: { first: 2162, second: 15839, third: 22509, tci: 1750 }, headwind10: { first: 2089, second: 15119, third: 21326, tci: 1750 }, headwind30: { first: 1904, second: 13695, third: 19023, tci: 1740 } },
            { temp: -10, tailwind10: { first: 2482, second: 18011, third: 26389, tci: 1740 }, zeroWind: { first: 2203, second: 15843, third: 22710, tci: 1720 }, headwind10: { first: 2110, second: 15130, third: 21526, tci: 1710 }, headwind30: { first: 1925, second: 13719, third: 19223, tci: 1700 } },
            { temp: -5,  tailwind10: { first: 2502, second: 18063, third: 26793, tci: 1710 }, zeroWind: { first: 2224, second: 15904, third: 22948, tci: 1690 }, headwind10: { first: 2131, second: 15194, third: 21761, tci: 1680 }, headwind30: { first: 1946, second: 13789, third: 19453, tci: 1670 } },
            { temp: 0,   tailwind10: { first: 2523, second: 18785, third: 28288, tci: 1680 }, zeroWind: { first: 2244, second: 16547, third: 24304, tci: 1660 }, headwind10: { first: 2151, second: 15812, third: 23072, tci: 1660 }, headwind30: { first: 1966, second: 14358, third: 20540, tci: 1650 } },
            { temp: 5,   tailwind10: { first: 2542, second: 21267, third: 32536, tci: 1670 }, zeroWind: { first: 2263, second: 18724, third: 27963, tci: 1650 }, headwind10: { first: 2171, second: 17890, third: 26447, tci: 1640 }, headwind30: { first: 1985, second: 16242, third: 23651, tci: 1630 } },
            { temp: 10,  tailwind10: { first: 2559, second: 27348, third: 38817, tci: 1670 }, zeroWind: { first: 2281, second: 22154, third: 33270, tci: 1650 }, headwind10: { first: 2188, second: 21159, third: 31545, tci: 1640 }, headwind30: { first: 2002, second: 19197, third: 28195, tci: 1620 } }
        ]
    },
    {
        weight: 15500,
        data: [
            { temp: -54, tailwind10: { first: 2260, second: 17075, third: 24017, tci: 2080 }, zeroWind: { first: 1981, second: 14831, third: 20401, tci: 2060 }, headwind10: { first: 1888, second: 14094, third: 19239, tci: 2050 }, headwind30: { first: 1703, second: 12534, third: 16982, tci: 2040 } },
            { temp: -35, tailwind10: { first: 2344, second: 16971, third: 24431, tci: 1910 }, zeroWind: { first: 2065, second: 14115, third: 20854, tci: 1890 }, headwind10: { first: 1972, second: 14115, third: 19708, tci: 1890 }, headwind30: { first: 1787, second: 12711, third: 17471, tci: 1870 } },
            { temp: -30, tailwind10: { first: 2365, second: 16947, third: 24465, tci: 1870 }, zeroWind: { first: 2087, second: 14818, third: 20903, tci: 1850 }, headwind10: { first: 1994, second: 14118, third: 19759, tci: 1850 }, headwind30: { first: 1808, second: 12729, third: 17659, tci: 1830 } },
            { temp: -25, tailwind10: { first: 2386, second: 16924, third: 24652, tci: 1840 }, zeroWind: { first: 2108, second: 14816, third: 21092, tci: 1820 }, headwind10: { first: 2015, second: 14123, third: 19948, tci: 1810 }, headwind30: { first: 1830, second: 12750, third: 17724, tci: 1800 } },
            { temp: -20, tailwind10: { first: 2408, second: 16904, third: 24688, tci: 1800 }, zeroWind: { first: 2129, second: 14814, third: 21140, tci: 1780 }, headwind10: { first: 2036, second: 14131, third: 20003, tci: 1770 }, headwind30: { first: 1851, second: 12771, third: 17918, tci: 1760 } },
            { temp: -15, tailwind10: { first: 2428, second: 16885, third: 24882, tci: 1760 }, zeroWind: { first: 2150, second: 14819, third: 21336, tci: 1750 }, headwind10: { first: 2057, second: 14138, third: 20198, tci: 1740 }, headwind30: { first: 1872, second: 12789, third: 17979, tci: 1730 } },
            { temp: -10, tailwind10: { first: 2449, second: 16870, third: 24924, tci: 1730 }, zeroWind: { first: 2171, second: 14822, third: 21392, tci: 1710 }, headwind10: { first: 2078, second: 14149, third: 20256, tci: 1710 }, headwind30: { first: 1892, second: 12814, third: 18180, tci: 1700 } },
            { temp: -5,  tailwind10: { first: 2470, second: 16916, third: 25319, tci: 1700 }, zeroWind: { first: 2191, second: 14877, third: 21766, tci: 1680 }, headwind10: { first: 2099, second: 14206, third: 20624, tci: 1670 }, headwind30: { first: 1913, second: 12877, third: 18403, tci: 1660 } },
            { temp: 0,   tailwind10: { first: 2490, second: 17560, third: 26737, tci: 1670 }, zeroWind: { first: 2211, second: 15452, third: 22908, tci: 1650 }, headwind10: { first: 2119, second: 14759, third: 21727, tci: 1650 }, headwind30: { first: 1933, second: 13387, third: 19431, tci: 1640 } },
            { temp: 5,   tailwind10: { first: 2509, second: 19767, third: 30553, tci: 1660 }, zeroWind: { first: 2230, second: 17387, third: 26182, tci: 1640 }, headwind10: { first: 2137, second: 16606, third: 24877, tci: 1630 }, headwind30: { first: 1952, second: 15062, third: 22201, tci: 1620 } },
            { temp: 10,  tailwind10: { first: 2526, second: 23249, third: 36233, tci: 1660 }, zeroWind: { first: 2248, second: 20428, third: 31107, tci: 1630 }, headwind10: { first: 2155, second: 19504, third: 29466, tci: 1630 }, headwind30: { first: 1969, second: 17682, third: 26280, tci: 1610 } }
        ]
    },
    {
        weight: 14500,
        data: [
            { temp: -54, tailwind10: { first: 2199, second: 14980, third: 21474, tci: 2060 }, zeroWind: { first: 1920, second: 12973, third: 18269, tci: 2040 }, headwind10: { first: 1827, second: 12313, third: 17193, tci: 2030 }, headwind30: { first: 1642, second: 11005, third: 15106, tci: 2020 } },
            { temp: -35, tailwind10: { first: 2280, second: 14888, third: 21882, tci: 1890 }, zeroWind: { first: 2002, second: 12964, third: 18574, tci: 1870 }, headwind10: { first: 1909, second: 12331, third: 17513, tci: 1870 }, headwind30: { first: 1723, second: 11075, third: 15578, tci: 1860 } },
            { temp: -30, tailwind10: { first: 2301, second: 14867, third: 21914, tci: 1850 }, zeroWind: { first: 2023, second: 12963, third: 18759, tci: 1840 }, headwind10: { first: 1930, second: 12336, third: 17698, tci: 1830 }, headwind30: { first: 1744, second: 11094, third: 15636, tci: 1820 } },
            { temp: -25, tailwind10: { first: 2322, second: 14847, third: 22100, tci: 1820 }, zeroWind: { first: 2043, second: 12952, third: 18805, tci: 1800 }, headwind10: { first: 1950, second: 12342, third: 17748, tci: 1790 }, headwind30: { first: 1765, second: 11111, third: 15822, tci: 1780 } },
            { temp: -20, tailwind10: { first: 2342, second: 14830, third: 22136, tci: 1780 }, zeroWind: { first: 2064, second: 12963, third: 18994, tci: 1760 }, headwind10: { first: 1971, second: 12349, third: 17936, tci: 1760 }, headwind30: { first: 1785, second: 11130, third: 15880, tci: 1750 } },
            { temp: -15, tailwind10: { first: 2362, second: 14813, third: 22327, tci: 1750 }, zeroWind: { first: 2084, second: 12953, third: 19042, tci: 1730 }, headwind10: { first: 1991, second: 12356, third: 17998, tci: 1730 }, headwind30: { first: 1805, second: 11149, third: 16070, tci: 1710 } },
            { temp: -10, tailwind10: { first: 2383, second: 14800, third: 22367, tci: 1710 }, zeroWind: { first: 2104, second: 12958, third: 19236, tci: 1700 }, headwind10: { first: 2011, second: 12365, third: 18180, tci: 1700 }, headwind30: { first: 1826, second: 11169, third: 16130, tci: 1680 } },
            { temp: -5,  tailwind10: { first: 2402, second: 14833, third: 22746, tci: 1680 }, zeroWind: { first: 2124, second: 13011, third: 19452, tci: 1660 }, headwind10: { first: 2031, second: 12410, third: 18393, tci: 1660 }, headwind30: { first: 1846, second: 11220, third: 16338, tci: 1650 } },
            { temp: 0,   tailwind10: { first: 2422, second: 15349, third: 23878, tci: 1650 }, zeroWind: { first: 2143, second: 13472, third: 20460, tci: 1640 }, headwind10: { first: 2051, second: 12855, third: 19390, tci: 1630 }, headwind30: { first: 1865, second: 11630, third: 17378, tci: 1620 } },
            { temp: 5,   tailwind10: { first: 2440, second: 17101, third: 27088, tci: 1640 }, zeroWind: { first: 2162, second: 15009, third: 23217, tci: 1620 }, headwind10: { first: 2069, second: 14321, third: 21878, tci: 1620 }, headwind30: { first: 1884, second: 12960, third: 19562, tci: 1600 } },
            { temp: 10,  tailwind10: { first: 2458, second: 19859, third: 31737, tci: 1630 }, zeroWind: { first: 2179, second: 17418, third: 27225, tci: 1610 }, headwind10: { first: 2086, second: 16617, third: 25732, tci: 1600 }, headwind30: { first: 1901, second: 15034, third: 22835, tci: 1590 } }
        ]
    },
    {
        weight: 13500,
        data: [
            { temp: -54, tailwind10: { first: 2135, second: 13127, third: 19178, tci: 2040 }, zeroWind: { first: 1856, second: 11329, third: 16222, tci: 2020 }, headwind10: { first: 1764, second: 10737, third: 15229, tci: 2020 }, headwind30: { first: 1578, second: 9565, third: 13425, tci: 2010 } },
            { temp: -35, tailwind10: { first: 2214, second: 13046, third: 19580, tci: 1880 }, zeroWind: { first: 1935, second: 11322, third: 16653, tci: 1860 }, headwind10: { first: 1842, second: 10754, third: 15665, tci: 1860 }, headwind30: { first: 1657, second: 9627, third: 13752, tci: 1840 } },
            { temp: -30, tailwind10: { first: 2234, second: 13028, third: 19763, tci: 1840 }, zeroWind: { first: 1955, second: 11322, third: 16694, tci: 1820 }, headwind10: { first: 1863, second: 10759, third: 15711, tci: 1820 }, headwind30: { first: 1677, second: 9644, third: 13931, tci: 1810 } },
            { temp: -25, tailwind10: { first: 2254, second: 13010, third: 19795, tci: 1800 }, zeroWind: { first: 1975, second: 11321, third: 16877, tci: 1780 }, headwind10: { first: 1883, second: 10764, third: 15890, tci: 1780 }, headwind30: { first: 1697, second: 9660, third: 13984, tci: 1770 } },
            { temp: -20, tailwind10: { first: 2274, second: 12994, third: 19828, tci: 1760 }, zeroWind: { first: 1995, second: 11322, third: 16921, tci: 1750 }, headwind10: { first: 1902, second: 10771, third: 15941, tci: 1750 }, headwind30: { first: 1717, second: 9674, third: 14164, tci: 1730 } },
            { temp: -15, tailwind10: { first: 2293, second: 12980, third: 20018, tci: 1730 }, zeroWind: { first: 2015, second: 11324, third: 16965, tci: 1720 }, headwind10: { first: 1922, second: 1777, third: 16127, tci: 1710 }, headwind30: { first: 1736, second: 9694, third: 14220, tci: 1700 } },
            { temp: -10, tailwind10: { first: 2312, second: 12968, third: 20054, tci: 1700 }, zeroWind: { first: 2034, second: 11327, third: 17155, tci: 1680 }, headwind10: { first: 1941, second: 10786, third: 16176, tci: 1680 }, headwind30: { first: 1756, second: 9712, third: 14407, tci: 1670 } },
            { temp: -5,  tailwind10: { first: 2332, second: 12992, third: 20424, tci: 1660 }, zeroWind: { first: 2053, second: 11360, third: 17359, tci: 1650 }, headwind10: { first: 1961, second: 10822, third: 16377, tci: 1650 }, headwind30: { first: 1775, second: 9754, third: 14605, tci: 1640 } },
            { temp: 0,   tailwind10: { first: 2351, second: 13406, third: 21294, tci: 1640 }, zeroWind: { first: 2072, second: 11732, third: 18152, tci: 1620 }, headwind10: { first: 1979, second: 11180, third: 17286, tci: 1620 }, headwind30: { first: 1794, second: 10085, third: 15321, tci: 1610 } },
            { temp: 5,   tailwind10: { first: 2369, second: 14804, third: 23997, tci: 1620 }, zeroWind: { first: 2091, second: 12957, third: 20434, tci: 1600 }, headwind10: { first: 1998, second: 12349, third: 19342, tci: 1600 }, headwind30: { first: 1812, second: 11144, third: 17217, tci: 1590 } },
            { temp: 10,  tailwind10: { first: 2386, second: 17008, third: 27944, tci: 1610 }, zeroWind: { first: 2107, second: 14861, third: 23823, tci: 1590 }, headwind10: { first: 2015, second: 14182, third: 22454, tci: 1590 }, headwind30: { first: 1829, second: 12798, third: 19944, tci: 1570 } }
        ]
    }
];

const singleEngineFlightPathDistances_6000ft_anti_ice_on = [
    {
        weight: 20000,
        data: [
            { temp: -54, tailwind10: { first: 2549, second: 30747, third: 39990, tci: 2210 }, zeroWind: { first: 2270, second: 26964, third: 34355, tci: 2170 }, headwind10: { first: 2178, second: 25731, third: 32638, tci: 2150 }, headwind30: { first: 1992, second: 23305, third: 29169, tci: 2130 } },
            { temp: -35, tailwind10: { first: 2545, second: 30510, third: 40372, tci: 2030 }, zeroWind: { first: 2357, second: 26894, third: 34839, tci: 1990 }, headwind10: { first: 2274, second: 25714, third: 33155, tci: 1980 }, headwind30: { first: 2088, second: 23391, third: 29747, tci: 1960 } },
            { temp: -30, tailwind10: { first: 2670, second: 30460, third: 40403, tci: 1980 }, zeroWind: { first: 2392, second: 26853, third: 35040, tci: 1950 }, headwind10: { first: 2299, second: 25716, third: 33225, tci: 1940 }, headwind30: { first: 2113, second: 23417, third: 29965, tci: 1920 } },
            { temp: -25, tailwind10: { first: 2694, second: 30415, third: 40595, tci: 1940 }, zeroWind: { first: 2416, second: 26876, third: 35104, tci: 1910 }, headwind10: { first: 2323, second: 25720, third: 33436, tci: 1900 }, headwind30: { first: 2138, second: 23445, third: 30055, tci: 1880 } },
            { temp: -20, tailwind10: { first: 2719, second: 30394, third: 40652, tci: 1900 }, zeroWind: { first: 2440, second: 26857, third: 35330, tci: 1870 }, headwind10: { first: 2347, second: 25743, third: 33666, tci: 1860 }, headwind30: { first: 2162, second: 23487, third: 30289, tci: 1840 } },
            { temp: -15, tailwind10: { first: 2743, second: 30372, third: 41179, tci: 1880 }, zeroWind: { first: 2464, second: 26897, third: 35624, tci: 1850 }, headwind10: { first: 2371, second: 25763, third: 33754, tci: 1830 }, headwind30: { first: 2186, second: 23528, third: 30510, tci: 1810 } },
            { temp: -10, tailwind10: { first: 2766, second: 30416, third: 41145, tci: 1830 }, zeroWind: { first: 2488, second: 26964, third: 35837, tci: 1800 }, headwind10: { first: 2395, second: 25837, third: 34033, tci: 1790 }, headwind30: { first: 2210, second: 23516, third: 30671, tci: 1770 } },
            { temp: -5,  tailwind10: { first: 2790, second: 32054, third: 44337, tci: 1810 }, zeroWind: { first: 2511, second: 28399, third: 38409, tci: 1780 }, headwind10: { first: 2419, second: 27207, third: 36656, tci: 1770 }, headwind30: { first: 2233, second: 24864, third: 32964, tci: 1750 } },
            { temp: 0,   tailwind10: { first: 2811, second: 37503, third: 52385, tci: 1820 }, zeroWind: { first: 2533, second: 33151, third: 45416, tci: 1790 }, headwind10: { first: 2440, second: 31739, third: 43089, tci: 1770 }, headwind30: { first: 2254, second: 28969, third: 38865, tci: 1750 } },
            { temp: 5,   tailwind10: { first: 2831, second: 47638, third: 66952, tci: 1870 }, zeroWind: { first: 2552, second: 41918, third: 57683, tci: 1820 }, headwind10: { first: 2460, second: 40075, third: 54686, tci: 1810 }, headwind30: { first: 2274, second: 36481, third: 49041, tci: 1780 } },
            { temp: 10,  tailwind10: { first: 2850, second: 65069, third: 91721, tci: 1970 }, zeroWind: { first: 2572, second: 56760, third: 78421, tci: 1910 }, headwind10: { first: 2479, second: 54118, third: 74172, tci: 1890 }, headwind30: { first: 2293, second: 49010, third: 66306, tci: 1850 } }
        ]
    },
    {
        weight: 19500,
        data: [
            { temp: -54, tailwind10: { first: 2523, second: 28677, third: 37606, tci: 2180 }, zeroWind: { first: 2244, second: 25140, third: 32361, tci: 2150 }, headwind10: { first: 2152, second: 23986, third: 30747, tci: 2140 }, headwind30: { first: 1968, second: 21714, third: 27442, tci: 2110 } },
            { temp: -35, tailwind10: { first: 2618, second: 28463, third: 37999, tci: 2010 }, zeroWind: { first: 2340, second: 25062, third: 32868, tci: 1980 }, headwind10: { first: 2247, second: 23977, third: 31266, tci: 1960 }, headwind30: { first: 2061, second: 21800, third: 28013, tci: 1940 } },
            { temp: -30, tailwind10: { first: 2642, second: 28417, third: 38185, tci: 1980 }, zeroWind: { first: 2364, second: 25072, third: 32928, tci: 1930 }, headwind10: { first: 2271, second: 23979, third: 31333, tci: 1920 }, headwind30: { first: 2086, second: 21825, third: 28227, tci: 1900 } },
            { temp: -25, tailwind10: { first: 2667, second: 28376, third: 38222, tci: 1920 }, zeroWind: { first: 2388, second: 25066, third: 33133, tci: 1890 }, headwind10: { first: 2295, second: 23984, third: 31543, tci: 1890 }, headwind30: { first: 2110, second: 21851, third: 28314, tci: 1870 } },
            { temp: -20, tailwind10: { first: 2690, second: 28356, third: 38435, tci: 1890 }, zeroWind: { first: 2412, second: 25076, third: 33355, tci: 1860 }, headwind10: { first: 2319, second: 24004, third: 31628, tci: 1850 }, headwind30: { first: 2134, second: 21891, third: 28546, tci: 1830 } },
            { temp: -15, tailwind10: { first: 2714, second: 28335, third: 38491, tci: 1850 }, zeroWind: { first: 2436, second: 25056, third: 33433, tci: 1820 }, headwind10: { first: 2343, second: 24024, third: 31854, tci: 1810 }, headwind30: { first: 2157, second: 21929, third: 28642, tci: 1790 } },
            { temp: -10, tailwind10: { first: 2738, second: 28373, third: 38750, tci: 1810 }, zeroWind: { first: 2459, second: 25146, third: 33703, tci: 1790 }, headwind10: { first: 2367, second: 24090, third: 32125, tci: 1780 }, headwind30: { first: 2181, second: 22009, third: 28913, tci: 1760 } },
            { temp: -5,  tailwind10: { first: 2761, second: 29795, third: 41739, tci: 1790 }, zeroWind: { first: 2463, second: 26394, third: 36093, tci: 1760 }, headwind10: { first: 2390, second: 25284, third: 34430, tci: 1750 }, headwind30: { first: 2204, second: 23099, third: 30914, tci: 1740 } },
            { temp: 0,   tailwind10: { first: 2782, second: 34543, third: 48769, tci: 1800 }, zeroWind: { first: 2504, second: 30544, third: 42203, tci: 1760 }, headwind10: { first: 2411, second: 29243, third: 40151, tci: 1750 }, headwind30: { first: 2225, second: 26390, third: 36168, tci: 1730 } },
            { temp: 5,   tailwind10: { first: 2802, second: 43190, third: 61378, tci: 1830 }, zeroWind: { first: 2523, second: 38046, third: 52919, tci: 1790 }, headwind10: { first: 2430, second: 36384, third: 50274, tci: 1790 }, headwind30: { first: 2245, second: 33134, third: 45154, tci: 1750 } },
            { temp: 10,  tailwind10: { first: 2821, second: 57490, third: 82087, tci: 1910 }, zeroWind: { first: 2542, second: 50292, third: 70197, tci: 1860 }, headwind10: { first: 2450, second: 47990, third: 66634, tci: 1840 }, headwind30: { first: 2264, second: 43524, third: 59483, tci: 1800 } }
        ]
    },
    {
        weight: 19000,
        data: [
            { temp: -54, tailwind10: { first: 2496, second: 26779, third: 35543, tci: 2170 }, zeroWind: { first: 2218, second: 23466, third: 30558, tci: 2130 }, headwind10: { first: 2125, second: 22384, third: 28868, tci: 2120 }, headwind30: { first: 1939, second: 20251, third: 25844, tci: 2100 } },
            { temp: -35, tailwind10: { first: 2590, second: 26586, third: 35796, tci: 1990 }, zeroWind: { first: 2312, second: 23417, third: 30905, tci: 1960 }, headwind10: { first: 2219, second: 22380, third: 29380, tci: 1950 }, headwind30: { first: 2034, second: 20337, third: 26407, tci: 1930 } },
            { temp: -30, tailwind10: { first: 2614, second: 26543, third: 35983, tci: 1950 }, zeroWind: { first: 2336, second: 23408, third: 31105, tci: 1920 }, headwind10: { first: 2243, second: 22383, third: 29584, tci: 1910 }, headwind30: { first: 2058, second: 20360, third: 26489, tci: 1890 } },
            { temp: -25, tailwind10: { first: 2638, second: 26505, third: 36176, tci: 1910 }, zeroWind: { first: 2360, second: 23403, third: 31309, tci: 1880 }, headwind10: { first: 2267, second: 22387, third: 29651, tci: 1870 }, headwind30: { first: 2082, second: 20385, third: 26703, tci: 1850 } },
            { temp: -20, tailwind10: { first: 2662, second: 26486, third: 36230, tci: 1870 }, zeroWind: { first: 2384, second: 23412, third: 31385, tci: 1840 }, headwind10: { first: 2291, second: 22407, third: 29873, tci: 1830 }, headwind30: { first: 2105, second: 20423, third: 26797, tci: 1820 } },
            { temp: -15, tailwind10: { first: 2583, second: 26466, third: 36442, tci: 1830 }, zeroWind: { first: 2405, second: 23414, third: 31597, tci: 1810 }, headwind10: { first: 2312, second: 22424, third: 30096, tci: 1800 }, headwind30: { first: 2127, second: 20458, third: 27022, tci: 1780 } },
            { temp: -10, tailwind10: { first: 2709, second: 26499, third: 36706, tci: 1800 }, zeroWind: { first: 2430, second: 23475, third: 31867, tci: 1770 }, headwind10: { first: 2337, second: 22485, third: 30216, tci: 1760 }, headwind30: { first: 2152, second: 20531, third: 27285, tci: 1750 } },
            { temp: -5,  tailwind10: { first: 2732, second: 27737, third: 39162, tci: 1770 }, zeroWind: { first: 2453, second: 24566, third: 33953, tci: 1750 }, headwind10: { first: 2360, second: 23529, third: 32372, tci: 1740 }, headwind30: { first: 2175, second: 21487, third: 29155, tci: 1720 } },
            { temp: 0,   tailwind10: { first: 2752, second: 31896, third: 45628, tci: 1780 }, zeroWind: { first: 2474, second: 28205, third: 39409, tci: 1750 }, headwind10: { first: 2381, second: 27004, third: 37469, tci: 1740 }, headwind30: { first: 2196, second: 24641, third: 33702, tci: 1720 } },
            { temp: 5,   tailwind10: { first: 2772, second: 39330, third: 56552, tci: 1800 }, zeroWind: { first: 2493, second: 34571, third: 48802, tci: 1770 }, headwind10: { first: 2401, second: 33162, third: 46328, tci: 1750 }, headwind30: { first: 2215, second: 30205, third: 41544, tci: 1730 } },
            { temp: 10,  tailwind10: { first: 2791, second: 51230, third: 74082, tci: 1860 }, zeroWind: { first: 2512, second: 44909, third: 63501, tci: 1810 }, headwind10: { first: 2420, second: 42878, third: 60243, tci: 1800 }, headwind30: { first: 2234, second: 38926, third: 53816, tci: 1770 } }
        ]
    },
    {
        weight: 18500,
        data: [
            { temp: -54, tailwind10: { first: 2469, second: 25032, third: 33485, tci: 2150 }, zeroWind: { first: 2191, second: 21923, third: 28731, tci: 2120 }, headwind10: { first: 2098, second: 20907, third: 27247, tci: 2110 }, headwind30: { first: 1913, second: 18901, third: 24360, tci: 2090 } },
            { temp: -35, tailwind10: { first: 2562, second: 24857, third: 33896, tci: 1970 }, zeroWind: { first: 2264, second: 21852, third: 29214, tci: 1950 }, headwind10: { first: 2191, second: 20908, third: 27756, tci: 1940 }, headwind30: { first: 2006, second: 18986, third: 24915, tci: 1920 } },
            { temp: -30, tailwind10: { first: 2586, second: 24817, third: 33929, tci: 1930 }, zeroWind: { first: 2308, second: 21874, third: 29413, tci: 1900 }, headwind10: { first: 2215, second: 20910, third: 27821, tci: 1900 }, headwind30: { first: 2029, second: 19008, third: 24994, tci: 1880 } },
            { temp: -25, tailwind10: { first: 2610, second: 24782, third: 34122, tci: 1890 }, zeroWind: { first: 2331, second: 21869, third: 29472, tci: 1870 }, headwind10: { first: 2239, second: 20915, third: 28024, tci: 1860 }, headwind30: { first: 2053, second: 19032, third: 25205, tci: 1840 } },
            { temp: -20, tailwind10: { first: 2633, second: 24764, third: 34333, tci: 1850 }, zeroWind: { first: 2355, second: 21878, third: 29686, tci: 1830 }, headwind10: { first: 2262, second: 20933, third: 28244, tci: 1820 }, headwind30: { first: 2076, second: 19067, third: 25296, tci: 1800 } },
            { temp: -15, tailwind10: { first: 2656, second: 24746, third: 34386, tci: 1820 }, zeroWind: { first: 2378, second: 21887, third: 29760, tci: 1790 }, headwind10: { first: 2285, second: 20950, third: 28322, tci: 1790 }, headwind30: { first: 2099, second: 19101, third: 25517, tci: 1770 } },
            { temp: -10, tailwind10: { first: 2679, second: 24774, third: 34640, tci: 1780 }, zeroWind: { first: 2401, second: 21935, third: 30015, tci: 1760 }, headwind10: { first: 2308, second: 21005, third: 26576, tci: 1750 }, headwind30: { first: 2122, second: 19168, third: 25772, tci: 1740 } },
            { temp: -5,  tailwind10: { first: 2702, second: 25856, third: 36963, tci: 1760 }, zeroWind: { first: 2423, second: 22891, third: 31969, tci: 1730 }, headwind10: { first: 2331, second: 21921, third: 30462, tci: 1730 }, headwind30: { first: 2145, second: 20008, third: 27392, tci: 1710 } },
            { temp: 0,   tailwind10: { first: 2722, second: 29513, third: 42752, tci: 1760 }, zeroWind: { first: 2444, second: 26096, third: 36845, tci: 1730 }, headwind10: { first: 2351, second: 24982, third: 35149, tci: 1720 }, headwind30: { first: 2166, second: 22788, third: 31559, tci: 1700 } },
            { temp: 5,   tailwind10: { first: 2742, second: 35947, third: 52361, tci: 1780 }, zeroWind: { first: 2463, second: 31703, third: 45069, tci: 1740 }, headwind10: { first: 2370, second: 30325, third: 42767, tci: 1730 }, headwind30: { first: 2185, second: 27621, third: 38414, tci: 1710 } },
            { temp: 10,  tailwind10: { first: 2760, second: 45967, third: 67395, tci: 1820 }, zeroWind: { first: 2482, second: 40354, third: 57777, tci: 1780 }, headwind10: { first: 2389, second: 38545, third: 54772, tci: 1750 }, headwind30: { first: 2204, second: 35013, third: 48969, tci: 1740 } }
        ]
    },
    {
        weight: 18000,
        data: [
            { temp: -54, tailwind10: { first: 2442, second: 23420, third: 31710, tci: 2130 }, zeroWind: { first: 2163, second: 20497, third: 27157, tci: 2100 }, headwind10: { first: 2071, second: 19534, third: 25732, tci: 2090 }, headwind30: { first: 1885, second: 17652, third: 22855, tci: 2070 } },
            { temp: -35, tailwind10: { first: 2534, second: 23260, third: 31975, tci: 1960 }, zeroWind: { first: 2255, second: 20462, third: 27640, tci: 1930 }, headwind10: { first: 2162, second: 19546, third: 26244, tci: 1920 }, headwind30: { first: 1977, second: 17735, third: 23397, tci: 1910 } },
            { temp: -30, tailwind10: { first: 2557, second: 23223, third: 32163, tci: 1920 }, zeroWind: { first: 2279, second: 20456, third: 27695, tci: 1890 }, headwind10: { first: 2186, second: 19548, third: 26307, tci: 1880 }, headwind30: { first: 2000, second: 17757, third: 23601, tci: 1870 } },
            { temp: -25, tailwind10: { first: 2580, second: 23190, third: 32357, tci: 1880 }, zeroWind: { first: 2302, second: 20451, third: 27896, tci: 1850 }, headwind10: { first: 2209, second: 19553, third: 26509, tci: 1850 }, headwind30: { first: 2024, second: 17778, third: 23678, tci: 1830 } },
            { temp: -20, tailwind10: { first: 2604, second: 23173, third: 32409, tci: 1840 }, zeroWind: { first: 2325, second: 20460, third: 27956, tci: 1820 }, headwind10: { first: 2232, second: 19570, third: 26585, tci: 1810 }, headwind30: { first: 2047, second: 17812, third: 23895, tci: 1790 } },
            { temp: -15, tailwind10: { first: 2626, second: 23156, third: 32620, tci: 1800 }, zeroWind: { first: 2348, second: 20468, third: 28181, tci: 1780 }, headwind10: { first: 2255, second: 19596, third: 26801, tci: 1770 }, headwind30: { first: 2070, second: 17844, third: 24114, tci: 1760 } },
            { temp: -10, tailwind10: { first: 2649, second: 23181, third: 32869, tci: 1770 }, zeroWind: { first: 2371, second: 20511, third: 28428, tci: 1750 }, headwind10: { first: 2278, second: 19635, third: 27049, tci: 1740 }, headwind30: { first: 2092, second: 17906, third: 24226, tci: 1730 } },
            { temp: -5,  tailwind10: { first: 2671, second: 23212, third: 32890, tci: 1740 }, zeroWind: { first: 2393, second: 20542, third: 28459, tci: 1710 }, headwind10: { first: 2300, second: 19665, third: 27083, tci: 1700 }, headwind30: { first: 2114, second: 17951, third: 24436, tci: 1690 } },
            { temp: 0,   tailwind10: { first: 2692, second: 23303, third: 33261, tci: 1710 }, zeroWind: { first: 2414, second: 20632, third: 28833, tci: 1680 }, headwind10: { first: 2321, second: 19747, third: 27453, tci: 1680 }, headwind30: { first: 2135, second: 18034, third: 24716, tci: 1660 } },
            { temp: 5,   tailwind10: { first: 2711, second: 24129, third: 34900, tci: 1740 }, zeroWind: { first: 2393, second: 21349, third: 30266, tci: 1720 }, headwind10: { first: 2300, second: 20442, third: 28684, tci: 1710 }, headwind30: { first: 2115, second: 18646, third: 25747, tci: 1700 } },
            { temp: 10,  tailwind10: { first: 2692, second: 27357, third: 40102, tci: 1740 }, zeroWind: { first: 2413, second: 24184, third: 34626, tci: 1710 }, headwind10: { first: 2321, second: 23147, third: 32873, tci: 1700 }, headwind30: { first: 2135, second: 21105, third: 29470, tci: 1690 } }
        ]
    },
    {
        weight: 17500,
        data: [
            { temp: -54, tailwind10: { first: 2414, second: 21927, third: 29907, tci: 2120 }, zeroWind: { first: 2136, second: 19175, third: 25887, tci: 2090 }, headwind10: { first: 2043, second: 16274, third: 24198, tci: 2080 }, headwind30: { first: 1857, second: 16493, third: 21563, tci: 2060 } },
            { temp: -35, tailwind10: { first: 2505, second: 21780, third: 30326, tci: 1940 }, zeroWind: { first: 2226, second: 19146, third: 26170, tci: 1920 }, headwind10: { first: 2133, second: 16282, third: 24695, tci: 1910 }, headwind30: { first: 1948, second: 16574, third: 22097, tci: 1900 } },
            { temp: -30, tailwind10: { first: 2528, second: 21746, third: 30516, tci: 1900 }, zeroWind: { first: 2249, second: 19140, third: 26224, tci: 1880 }, headwind10: { first: 2157, second: 18285, third: 24892, tci: 1870 }, headwind30: { first: 1971, second: 16595, third: 22299, tci: 1860 } },
            { temp: -25, tailwind10: { first: 2551, second: 21715, third: 30554, tci: 1860 }, zeroWind: { first: 2272, second: 19136, third: 26424, tci: 1840 }, headwind10: { first: 2180, second: 18269, third: 24954, tci: 1830 }, headwind30: { first: 1994, second: 16617, third: 22372, tci: 1820 } },
            { temp: -20, tailwind10: { first: 2574, second: 21699, third: 30762, tci: 1830 }, zeroWind: { first: 2295, second: 19144, third: 26491, tci: 1810 }, headwind10: { first: 2202, second: 18305, third: 25166, tci: 1800 }, headwind30: { first: 2017, second: 16648, third: 22587, tci: 1780 } },
            { temp: -15, tailwind10: { first: 2596, second: 21683, third: 30813, tci: 1790 }, zeroWind: { first: 2318, second: 19151, third: 26703, tci: 1770 }, headwind10: { first: 2225, second: 18321, third: 25380, tci: 1770 }, headwind30: { first: 2039, second: 16678, third: 22659, tci: 1750 } },
            { temp: -10, tailwind10: { first: 2618, second: 21704, third: 31056, tci: 1760 }, zeroWind: { first: 2340, second: 19190, third: 26797, tci: 1740 }, headwind10: { first: 2247, second: 18365, third: 25478, tci: 1730 }, headwind30: { first: 2062, second: 16734, third: 22908, tci: 1720 } },
            { temp: -5,  tailwind10: { first: 2641, second: 22540, third: 32976, tci: 1730 }, zeroWind: { first: 2362, second: 19931, third: 28540, tci: 1710 }, headwind10: { first: 2269, second: 19076, third: 27019, tci: 1700 }, headwind30: { first: 2084, second: 17388, third: 24345, tci: 1690 } },
            { temp: 0,   tailwind10: { first: 2661, second: 25395, third: 37647, tci: 1720 }, zeroWind: { first: 2382, second: 22441, third: 32430, tci: 1700 }, headwind10: { first: 2290, second: 21475, third: 30758, tci: 1690 }, headwind30: { first: 2104, second: 19569, third: 27656, tci: 1680 } },
            { temp: 5,   tailwind10: { first: 2680, second: 30294, third: 45256, tci: 1730 }, zeroWind: { first: 2401, second: 26721, third: 38916, tci: 1700 }, headwind10: { first: 2308, second: 25557, third: 36988, tci: 1690 }, headwind30: { first: 2123, second: 23266, third: 33106, tci: 1670 } },
            { temp: 10,  tailwind10: { first: 2698, second: 37599, third: 56479, tci: 1780 }, zeroWind: { first: 2420, second: 33061, third: 48432, tci: 1720 }, headwind10: { first: 2327, second: 31590, third: 45966, tci: 1710 }, headwind30: { first: 2141, second: 28707, third: 41193, tci: 1690 } }
        ]
    },
    {
        weight: 17000,
        data: [
            { temp: -54, tailwind10: { first: 2386, second: 20537, third: 28358, tci: 2100 }, zeroWind: { first: 2107, second: 17944, third: 24174, tci: 2080 }, headwind10: { first: 2014, second: 17094, third: 22877, tci: 2070 }, headwind30: { first: 1829, second: 15413, third: 20352, tci: 2050 } },
            { temp: -35, tailwind10: { first: 2475, second: 20403, third: 26782, tci: 1930 }, zeroWind: { first: 2197, second: 17919, third: 24649, tci: 1910 }, headwind10: { first: 2104, second: 17104, third: 23368, tci: 1900 }, headwind30: { first: 1918, second: 15492, third: 20876, tci: 1890 } },
            { temp: -30, tailwind10: { first: 2498, second: 20371, third: 28817, tci: 1890 }, zeroWind: { first: 2220, second: 17913, third: 24844, tci: 1870 }, headwind10: { first: 2127, second: 17107, third: 23564, tci: 1860 }, headwind30: { first: 1941, second: 15511, third: 21075, tci: 1850 } },
            { temp: -25, tailwind10: { first: 2521, second: 20342, third: 29010, tci: 1850 }, zeroWind: { first: 2242, second: 17910, third: 24898, tci: 1830 }, headwind10: { first: 2149, second: 17111, third: 23625, tci: 1820 }, headwind30: { first: 1964, second: 15532, third: 21147, tci: 1810 } },
            { temp: -20, tailwind10: { first: 2543, second: 20327, third: 29059, tci: 1820 }, zeroWind: { first: 2265, second: 17917, third: 25106, tci: 1790 }, headwind10: { first: 2172, second: 17126, third: 23835, tci: 1790 }, headwind30: { first: 1986, second: 15561, third: 21358, tci: 1770 } },
            { temp: -15, tailwind10: { first: 2565, second: 20312, third: 29257, tci: 1780 }, zeroWind: { first: 2287, second: 17925, third: 25171, tci: 1760 }, headwind10: { first: 2194, second: 17141, third: 23904, tci: 1750 }, headwind30: { first: 2009, second: 15590, third: 21436, tci: 1740 } },
            { temp: -10, tailwind10: { first: 2587, second: 20329, third: 29344, tci: 1750 }, zeroWind: { first: 2309, second: 17960, third: 25406, tci: 1730 }, headwind10: { first: 2216, second: 17181, third: 24139, tci: 1720 }, headwind30: { first: 2031, second: 15641, third: 21670, tci: 1710 } },
            { temp: -5,  tailwind10: { first: 2509, second: 21064, third: 31165, tci: 1720 }, zeroWind: { first: 2331, second: 18514, third: 26915, tci: 1700 }, headwind10: { first: 2238, second: 17808, third: 25596, tci: 1690 }, headwind30: { first: 2052, second: 16220, third: 22896, tci: 1680 } },
            { temp: 0,   tailwind10: { first: 2629, second: 23601, third: 35361, tci: 1710 }, zeroWind: { first: 2351, second: 20644, third: 30529, tci: 1690 }, headwind10: { first: 2258, second: 19941, third: 26930, tci: 1660 }, headwind30: { first: 2072, second: 18159, third: 25968, tci: 1660 } },
            { temp: 5,   tailwind10: { first: 2648, second: 27904, third: 42219, tci: 1710 }, zeroWind: { first: 2369, second: 24608, third: 36356, tci: 1690 }, headwind10: { first: 2277, second: 23531, third: 34381, tci: 1680 }, headwind30: { first: 2091, second: 21412, third: 30843, tci: 1660 } },
            { temp: 10,  tailwind10: { first: 2666, second: 34207, third: 51969, tci: 1730 }, zeroWind: { first: 2388, second: 30088, third: 44728, tci: 1700 }, headwind10: { first: 2295, second: 26749, third: 42415, tci: 1690 }, headwind30: { first: 2109, second: 26122, third: 37937, tci: 1670 } }
        ]
    },
    {
        weight: 16500,
        data: [
            { temp: -54, tailwind10: { first: 2357, second: 19240, third: 26752, tci: 2090 }, zeroWind: { first: 2078, second: 16794, third: 22879, tci: 2060 }, headwind10: { first: 1985, second: 15991, third: 21635, tci: 2060 }, headwind30: { first: 1800, second: 14403, third: 19212, tci: 2040 } },
            { temp: -35, tailwind10: { first: 2443, second: 19115, third: 27175, tci: 1920 }, zeroWind: { first: 2165, second: 16771, third: 23351, tci: 1900 }, headwind10: { first: 2073, second: 16002, third: 22120, tci: 1890 }, headwind30: { first: 1887, second: 14478, third: 19726, tci: 1880 } },
            { temp: -30, tailwind10: { first: 2467, second: 19085, third: 27364, tci: 1880 }, zeroWind: { first: 2189, second: 16766, third: 23402, tci: 1860 }, headwind10: { first: 2096, second: 16005, third: 22176, tci: 1850 }, headwind30: { first: 1911, second: 14497, third: 19793, tci: 1840 } },
            { temp: -25, tailwind10: { first: 2490, second: 19058, third: 27400, tci: 1840 }, zeroWind: { first: 2211, second: 16763, third: 23596, tci: 1820 }, headwind10: { first: 2119, second: 16009, third: 22373, tci: 1810 }, headwind30: { first: 1933, second: 14517, third: 19992, tci: 1800 } },
            { temp: -20, tailwind10: { first: 2512, second: 19043, third: 27605, tci: 1800 }, zeroWind: { first: 2234, second: 16770, third: 23803, tci: 1780 }, headwind10: { first: 2141, second: 16023, third: 22440, tci: 1780 }, headwind30: { first: 1955, second: 14544, third: 20067, tci: 1760 } },
            { temp: -15, tailwind10: { first: 2534, second: 19029, third: 27653, tci: 1770 }, zeroWind: { first: 2255, second: 16777, third: 23865, tci: 1750 }, headwind10: { first: 2163, second: 16036, third: 22647, tci: 1740 }, headwind30: { first: 1977, second: 14571, third: 20275, tci: 1730 } },
            { temp: -10, tailwind10: { first: 2556, second: 19044, third: 27885, tci: 1740 }, zeroWind: { first: 2277, second: 16808, third: 24096, tci: 1720 }, headwind10: { first: 2184, second: 16073, third: 22877, tci: 1710 }, headwind30: { first: 1999, second: 14618, third: 20503, tci: 1700 } },
            { temp: -5,  tailwind10: { first: 2577, second: 19692, third: 29460, tci: 1710 }, zeroWind: { first: 2299, second: 17387, third: 25382, tci: 1690 }, headwind10: { first: 2206, second: 16630, third: 24121, tci: 1680 }, headwind30: { first: 2020, second: 15132, third: 21529, tci: 1670 } },
            { temp: 0,   tailwind10: { first: 2597, second: 21952, third: 33219, tci: 1690 }, zeroWind: { first: 2319, second: 19374, third: 28605, tci: 1670 }, headwind10: { first: 2226, second: 18529, third: 27224, tci: 1670 }, headwind30: { first: 2040, second: 16860, third: 24392, tci: 1650 } },
            { temp: 5,   tailwind10: { first: 2615, second: 25746, third: 39415, tci: 1690 }, zeroWind: { first: 2337, second: 22695, third: 33846, tci: 1670 }, headwind10: { first: 2244, second: 21698, third: 32115, tci: 1660 }, headwind30: { first: 2059, second: 19732, third: 26755, tci: 1650 } },
            { temp: 10,  tailwind10: { first: 2633, second: 31214, third: 48184, tci: 1710 }, zeroWind: { first: 2355, second: 27457, third: 41364, tci: 1680 }, headwind10: { first: 2262, second: 26233, third: 39186, tci: 1670 }, headwind30: { first: 2077, second: 23828, third: 34970, tci: 1650 } }
        ]
    },
    {
        weight: 16000,
        data: [
            { temp: -54, tailwind10: { first: 2327, second: 18026, third: 25380, tci: 2080 }, zeroWind: { first: 2049, second: 15716, third: 21659, tci: 2050 }, headwind10: { first: 1956, second: 14957, third: 20462, tci: 2050 }, headwind30: { first: 1770, second: 13456, third: 18136, tci: 2030 } },
            { temp: -35, tailwind10: { first: 2414, second: 17909, third: 25805, tci: 1910 }, zeroWind: { first: 2136, second: 15696, third: 22125, tci: 1890 }, headwind10: { first: 2043, second: 14969, third: 20942, tci: 1880 }, headwind30: { first: 1857, second: 13529, third: 18641, tci: 1870 } },
            { temp: -30, tailwind10: { first: 2436, second: 17881, third: 25839, tci: 1870 }, zeroWind: { first: 2158, second: 15692, third: 22175, tci: 1850 }, headwind10: { first: 2065, second: 14972, third: 20997, tci: 1840 }, headwind30: { first: 1880, second: 13547, third: 18706, tci: 1830 } },
            { temp: -25, tailwind10: { first: 2458, second: 17856, third: 26031, tci: 1830 }, zeroWind: { first: 2180, second: 15689, third: 22369, tci: 1810 }, headwind10: { first: 2087, second: 14976, third: 21192, tci: 1800 }, headwind30: { first: 1902, second: 13566, third: 18902, tci: 1790 } },
            { temp: -20, tailwind10: { first: 2480, second: 17842, third: 26077, tci: 1790 }, zeroWind: { first: 2202, second: 15695, third: 22429, tci: 1780 }, headwind10: { first: 2109, second: 14989, third: 21256, tci: 1770 }, headwind30: { first: 1924, second: 13591, third: 18975, tci: 1760 } },
            { temp: -15, tailwind10: { first: 2502, second: 17828, third: 26281, tci: 1760 }, zeroWind: { first: 2223, second: 15701, third: 22634, tci: 1740 }, headwind10: { first: 2131, second: 15002, third: 21460, tci: 1730 }, headwind30: { first: 1945, second: 13616, third: 19178, tci: 1720 } },
            { temp: -10, tailwind10: { first: 2523, second: 17840, third: 26349, tci: 1730 }, zeroWind: { first: 2245, second: 15729, third: 22712, tci: 1710 }, headwind10: { first: 2152, second: 15035, third: 21541, tci: 1700 }, headwind30: { first: 1967, second: 13560, third: 19255, tci: 1690 } },
            { temp: -5,  tailwind10: { first: 2544, second: 18415, third: 27851, tci: 1700 }, zeroWind: { first: 2266, second: 16243, third: 24063, tci: 1680 }, headwind10: { first: 2173, second: 15530, third: 22724, tci: 1670 }, headwind30: { first: 1988, second: 14117, third: 20371, tci: 1660 } },
            { temp: 0,   tailwind10: { first: 2564, second: 20431, third: 31371, tci: 1680 }, zeroWind: { first: 2286, second: 18018, third: 26947, tci: 1660 }, headwind10: { first: 2193, second: 17226, third: 25627, tci: 1660 }, headwind30: { first: 2007, second: 15960, third: 22917, tci: 1640 } },
            { temp: 5,   tailwind10: { first: 2582, second: 23788, third: 36809, tci: 1680 }, zeroWind: { first: 2304, second: 20957, third: 31665, tci: 1660 }, headwind10: { first: 2211, second: 20031, third: 30015, tci: 1650 }, headwind30: { first: 2026, second: 18202, third: 26817, tci: 1630 } },
            { temp: 10,  tailwind10: { first: 2600, second: 28557, third: 44567, tci: 1690 }, zeroWind: { first: 2322, second: 25114, third: 38287, tci: 1660 }, headwind10: { first: 2229, second: 23991, third: 36230, tci: 1650 }, headwind30: { first: 2043, second: 21781, third: 32390, tci: 1630 } }
        ]
    },
    {
        weight: 15500,
        data: [
            { temp: -54, tailwind10: { first: 2297, second: 16889, third: 24087, tci: 2070 }, zeroWind: { first: 2019, second: 14707, third: 20506, tci: 2040 }, headwind10: { first: 1926, second: 13989, third: 19357, tci: 2040 }, headwind30: { first: 1740, second: 12569, third: 17121, tci: 2020 } },
            { temp: -35, tailwind10: { first: 2381, second: 16781, third: 24360, tci: 1900 }, zeroWind: { first: 2103, second: 14690, third: 20829, tci: 1880 }, headwind10: { first: 2010, second: 14002, third: 19695, tci: 1870 }, headwind30: { first: 1824, second: 12539, third: 17617, tci: 1860 } },
            { temp: -30, tailwind10: { first: 2405, second: 16755, third: 24548, tci: 1860 }, zeroWind: { first: 2126, second: 14690, third: 21023, tci: 1840 }, headwind10: { first: 2033, second: 14005, third: 19884, tci: 1830 }, headwind30: { first: 1848, second: 12557, third: 17680, tci: 1820 } },
            { temp: -25, tailwind10: { first: 2426, second: 16731, third: 24583, tci: 1820 }, zeroWind: { first: 2148, second: 14583, third: 21068, tci: 1800 }, headwind10: { first: 2055, second: 14009, third: 19938, tci: 1800 }, headwind30: { first: 1870, second: 12575, third: 17874, tci: 1780 } },
            { temp: -20, tailwind10: { first: 2448, second: 16718, third: 24784, tci: 1780 }, zeroWind: { first: 2170, second: 14689, third: 21270, tci: 1770 }, headwind10: { first: 2077, second: 14021, third: 20139, tci: 1760 }, headwind30: { first: 1891, second: 12699, third: 17943, tci: 1750 } },
            { temp: -15, tailwind10: { first: 2469, second: 16705, third: 24829, tci: 1750 }, zeroWind: { first: 2191, second: 14695, third: 21326, tci: 1730 }, headwind10: { first: 2098, second: 14033, third: 20200, tci: 1730 }, headwind30: { first: 1912, second: 12722, third: 18144, tci: 1710 } },
            { temp: -10, tailwind10: { first: 2490, second: 16715, third: 25053, tci: 1720 }, zeroWind: { first: 2212, second: 14720, third: 21546, tci: 1700 }, headwind10: { first: 2119, second: 14063, third: 20418, tci: 1690 }, headwind30: { first: 1934, second: 12762, third: 18226, tci: 1680 } },
            { temp: -5,  tailwind10: { first: 2511, second: 17224, third: 26331, tci: 1690 }, zeroWind: { first: 2233, second: 15177, third: 22713, tci: 1670 }, headwind10: { first: 2140, second: 14504, third: 21549, tci: 1670 }, headwind30: { first: 1955, second: 13170, third: 19284, tci: 1650 } },
            { temp: 0,   tailwind10: { first: 2531, second: 19028, third: 29477, tci: 1670 }, zeroWind: { first: 2252, second: 16764, third: 25393, tci: 1650 }, headwind10: { first: 2159, second: 16021, third: 24130, tci: 1650 }, headwind30: { first: 1974, second: 14550, third: 21532, tci: 1630 } },
            { temp: 5,   tailwind10: { first: 2548, second: 22006, third: 34546, tci: 1660 }, zeroWind: { first: 2270, second: 19373, third: 29635, tci: 1640 }, headwind10: { first: 2177, second: 18510, third: 28063, tci: 1640 }, headwind30: { first: 1991, second: 16807, third: 25014, tci: 1620 } },
            { temp: 10,  tailwind10: { first: 2566, second: 26184, third: 41398, tci: 1670 }, zeroWind: { first: 2288, second: 23018, third: 35456, tci: 1640 }, headwind10: { first: 2195, second: 21984, third: 33655, tci: 1630 }, headwind30: { first: 2010, second: 19945, third: 30017, tci: 1620 } }
        ]
    },
    {
        weight: 14500,
        data: [
            { temp: -54, tailwind10: { first: 2235, second: 14824, third: 21565, tci: 2040 }, zeroWind: { first: 1957, second: 12872, third: 18256, tci: 2020 }, headwind10: { first: 1864, second: 12229, third: 17194, tci: 2020 }, headwind30: { first: 1678, second: 10955, third: 15133, tci: 2010 } },
            { temp: -35, tailwind10: { first: 2318, second: 14730, third: 21834, tci: 1880 }, zeroWind: { first: 2040, second: 12859, third: 18705, tci: 1860 }, headwind10: { first: 1947, second: 12242, third: 17652, tci: 1860 }, headwind30: { first: 1761, second: 11021, third: 15607, tci: 1840 } },
            { temp: -30, tailwind10: { first: 2339, second: 14708, third: 22021, tci: 1840 }, zeroWind: { first: 2061, second: 12856, third: 18750, tci: 1820 }, headwind10: { first: 1968, second: 12245, third: 17700, tci: 1820 }, headwind30: { first: 1783, second: 11037, third: 15794, tci: 1810 } },
            { temp: -25, tailwind10: { first: 2360, second: 14687, third: 22055, tci: 1800 }, zeroWind: { first: 2062, second: 12854, third: 18940, tci: 1790 }, headwind10: { first: 1989, second: 12250, third: 17891, tci: 1780 }, headwind30: { first: 1804, second: 11053, third: 15851, tci: 1770 } },
            { temp: -20, tailwind10: { first: 2380, second: 14674, third: 22253, tci: 1770 }, zeroWind: { first: 2101, second: 12859, third: 18992, tci: 1750 }, headwind10: { first: 2009, second: 12260, third: 17945, tci: 1750 }, headwind30: { first: 1823, second: 11074, third: 16045, tci: 1730 } },
            { temp: -15, tailwind10: { first: 2402, second: 14662, third: 22295, tci: 1730 }, zeroWind: { first: 2123, second: 12864, third: 19190, tci: 1720 }, headwind10: { first: 2031, second: 12271, third: 18142, tci: 1710 }, headwind30: { first: 1845, second: 11095, third: 16107, tci: 1700 } },
            { temp: -10, tailwind10: { first: 2422, second: 14669, third: 22511, tci: 1700 }, zeroWind: { first: 2144, second: 12864, third: 19255, tci: 1680 }, headwind10: { first: 2051, second: 12296, third: 18209, tci: 1680 }, headwind30: { first: 1865, second: 11129, third: 16314, tci: 1670 } },
            { temp: -5,  tailwind10: { first: 2443, second: 15072, third: 23585, tci: 1670 }, zeroWind: { first: 2164, second: 13247, third: 20329, tci: 1650 }, headwind10: { first: 2071, second: 12646, third: 19252, tci: 1650 }, headwind30: { first: 1886, second: 11455, third: 17021, tci: 1640 } },
            { temp: 0,   tailwind10: { first: 2462, second: 16521, third: 26321, tci: 1650 }, zeroWind: { first: 2183, second: 14522, third: 22554, tci: 1630 }, headwind10: { first: 2090, second: 13868, third: 21396, tci: 1630 }, headwind30: { first: 1905, second: 12563, third: 18999, tci: 1600 } },
            { temp: 5,   tailwind10: { first: 2480, second: 18882, third: 30459, tci: 1640 }, zeroWind: { first: 2201, second: 16591, third: 25965, tci: 1620 }, headwind10: { first: 2108, second: 15839, third: 24676, tci: 1620 }, headwind30: { first: 1923, second: 14351, third: 21885, tci: 1600 } },
            { temp: 10,  tailwind10: { first: 2497, second: 22126, third: 35911, tci: 1640 }, zeroWind: { first: 2218, second: 19423, third: 30691, tci: 1610 }, headwind10: { first: 2126, second: 18538, third: 29070, tci: 1610 }, headwind30: { first: 1940, second: 16790, third: 25930, tci: 1590 } }
        ]
    },
    {
        weight: 13500,
        data: [
            { temp: -54, tailwind10: { first: 2170, second: 12996, third: 19287, tci: 2030 }, zeroWind: { first: 1892, second: 11246, third: 16221, tci: 2010 }, headwind10: { first: 1799, second: 10669, third: 15369, tci: 2000 }, headwind30: { first: 1613, second: 9525, third: 13456, tci: 1990 } },
            { temp: -35, tailwind10: { first: 2250, second: 12914, third: 19550, tci: 1860 }, zeroWind: { first: 1972, second: 11236, third: 16655, tci: 1850 }, headwind10: { first: 1879, second: 10683, third: 15679, tci: 1840 }, headwind30: { first: 1693, second: 9586, third: 13914, tci: 1830 } },
            { temp: -30, tailwind10: { first: 2271, second: 12894, third: 19735, tci: 1820 }, zeroWind: { first: 1992, second: 11234, third: 16839, tci: 1810 }, headwind10: { first: 1900, second: 10687, third: 15863, tci: 1800 }, headwind30: { first: 1714, second: 9600, third: 13967, tci: 1790 } },
            { temp: -25, tailwind10: { first: 2291, second: 12876, third: 19767, tci: 1790 }, zeroWind: { first: 2013, second: 11233, third: 16883, tci: 1770 }, headwind10: { first: 1920, second: 10691, third: 15909, tci: 1770 }, headwind30: { first: 1734, second: 9615, third: 14149, tci: 1760 } },
            { temp: -20, tailwind10: { first: 2311, second: 12865, third: 19962, tci: 1750 }, zeroWind: { first: 2033, second: 11237, third: 16930, tci: 1740 }, headwind10: { first: 1940, second: 10700, third: 16100, tci: 1730 }, headwind30: { first: 1755, second: 9634, third: 14206, tci: 1720 } },
            { temp: -15, tailwind10: { first: 2331, second: 12854, third: 20001, tci: 1720 }, zeroWind: { first: 2053, second: 11241, third: 17123, tci: 1700 }, headwind10: { first: 1960, second: 10709, third: 16151, tci: 1700 }, headwind30: { first: 1774, second: 9653, third: 14396, tci: 1690 } },
            { temp: -10, tailwind10: { first: 2351, second: 12857, third: 20211, tci: 1680 }, zeroWind: { first: 2073, second: 11257, third: 17180, tci: 1670 }, headwind10: { first: 1980, second: 10729, third: 16352, tci: 1670 }, headwind30: { first: 1794, second: 9682, third: 14460, tci: 1660 } },
            { temp: -5,  tailwind10: { first: 2370, second: 13176, third: 21141, tci: 1650 }, zeroWind: { first: 2092, second: 11546, third: 18034, tci: 1640 }, headwind10: { first: 1999, second: 11009, third: 17036, tci: 1640 }, headwind30: { first: 1814, second: 9942, third: 15238, tci: 1630 } },
            { temp: 0,   tailwind10: { first: 2389, second: 14346, third: 23341, tci: 1630 }, zeroWind: { first: 2111, second: 12575, third: 20016, tci: 1620 }, headwind10: { first: 2018, second: 11992, third: 18947, tci: 1610 }, headwind30: { first: 1833, second: 10835, third: 16732, tci: 1600 } },
            { temp: 5,   tailwind10: { first: 2407, second: 16232, third: 26853, tci: 1620 }, zeroWind: { first: 2129, second: 14227, third: 22869, tci: 1600 }, headwind10: { first: 2036, second: 13567, third: 21694, tci: 1600 }, headwind30: { first: 1850, second: 12261, third: 19265, tci: 1590 } },
            { temp: 10,  tailwind10: { first: 2424, second: 18780, third: 31298, tci: 1610 }, zeroWind: { first: 2146, second: 16449, third: 26699, tci: 1590 }, headwind10: { first: 2053, second: 15687, third: 25232, tci: 1590 }, headwind30: { first: 1867, second: 14175, third: 22382, tci: 1570 } }
        ]
    }
];
*/
