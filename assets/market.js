/* Market data you can update without touching the rest of the site.
   psf:   average price per sq ft in AED (from Property Monitor), e.g. "Mirage": "2450"
   build: construction progress, e.g. "Mirage": {pct: 70, date: "21 June 2026"}
   Leave a value empty ("") and the site shows "–" or "Construction update coming soon". */
window.OASIS_MARKET = {
  psf: {
    "Palmiera 1": "1741",
    "Palmiera 2": "1724",
    "Palmiera 3": "1758",
    "Palmiera Collective": "2112",
    "Mirage": "1781",
    "Lavita": "2319",
    "Marèva": "2044",
    "Marèva 2": "2043",
    "Address Tierra": "1844",
    "Palace Ostra": "2044"
  },
  build: {
    "Palmiera 1": {pct: 81.72, date: "October 1st, 2026"},
    "Palmiera 2": {pct: 77.11, date: "October 1st, 2026"},
    "Palmiera 3": {pct: 72.62, date: "October 1st, 2026"},
    "Palmiera Collective": {pct: 1.33, date: "October 1st, 2026"},
    "Mirage": {pct: 46.94, date: "October 1st, 2026"},
    "Lavita": {pct: 20.13, date: "October 1st, 2026"},
    "Marèva": {pct: 2.05, date: "October 1st, 2026"},
    "Marèva 2": {pct: 1.32, date: "October 1st, 2026"},
    "Address Tierra": {pct: 6.81, date: "October 1st, 2026"},
    "Palace Ostra": {pct: 6.54, date: "October 1st, 2026"},
    "Valoria": {pct: 1.12, date: "October 1st, 2026"}
  },
  buildSource: "Dubai REST app, updated monthly on the 1st"
};
