/* Market data you can update without touching the rest of the site.
   psf:   average price per sq ft in AED (from Property Monitor), e.g. "Mirage": "2450"
   build: construction progress, e.g. "Mirage": {pct: 70, date: "21 June 2026"}
   Leave a value empty ("") and the site shows "–" or "Construction update coming soon". */
window.OASIS_MARKET = {
  psf: {
    "Palmiera 1": "",
    "Palmiera 2": "",
    "Palmiera 3": "",
    "Palmiera Collective": "",
    "Mirage": "",
    "Lavita": "",
    "Marèva": "",
    "Marèva 2": "",
    "Address Tierra": "",
    "Palace Ostra": ""
  },
  build: {
    "Palmiera 1": {pct: 81.72, date: "1 October 2026"},
    "Palmiera 2": {pct: 77.11, date: "1 October 2026"},
    "Palmiera 3": {pct: 72.62, date: "1 October 2026"},
    "Palmiera Collective": {pct: 1.33, date: "1 October 2026"},
    "Mirage": {pct: 46.94, date: "1 October 2026"},
    "Lavita": {pct: 20.13, date: "1 October 2026"},
    "Marèva": {pct: 2.05, date: "1 October 2026"},
    "Marèva 2": {pct: 1.32, date: "1 October 2026"},
    "Address Tierra": {pct: 6.81, date: "1 October 2026"},
    "Palace Ostra": {pct: 6.54, date: "1 October 2026"},
    "Valoria": {pct: 1.12, date: "1 October 2026"}
  },
  buildSource: "Dubai REST app, updated monthly on the 1st"
};
