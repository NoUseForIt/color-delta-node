/**
 * Lab Calculations Service
 * Lab color space conversions and calculations
 */

/**
 * Helper function to parse numeric values
 * @param {*} v - Value to parse
 * @returns {number|null} Parsed number or null
 */
function num(v) {
  if (v === '' || v === null || v === undefined || v === '-' || v === '-.') return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? null : n;
}

/**
 * Lab validation ranges
 */
const LAB_RANGE = {
  L: { min: 0, max: 100 },
  a: { min: -127, max: 127 },
  b: { min: -127, max: 127 }
};

/**
 * Convert Lab to sRGB CSS color string
 * Uses D50 illuminant, no profile
 * @param {number|string} L - Lightness (0-100)
 * @param {number|string} a - a* component (-127 to 127)
 * @param {number|string} b - b* component (-127 to 127)
 * @returns {string|null} RGB CSS string or null if invalid
 */
function labToCSS(L, a, b) {
  const Ln = num(L);
  const an = num(a);
  const bn = num(b);
  
  if (Ln === null || an === null || bn === null) return null;
  
  // Lab to XYZ (D50)
  const fy = (Ln + 16) / 116;
  const fx = an / 500 + fy;
  const fz = fy - bn / 200;
  
  const e = 0.008856;
  const k = 903.3;
  
  const xr = fx * fx * fx > e ? fx * fx * fx : (116 * fx - 16) / k;
  const yr = Ln > k * e ? Math.pow((Ln + 16) / 116, 3) : Ln / k;
  const zr = fz * fz * fz > e ? fz * fz * fz : (116 * fz - 16) / k;
  
  // D50 white point
  const X = xr * 0.9642;
  const Y = yr * 1.0000;
  const Z = zr * 0.8251;
  
  // XYZ to linear RGB
  const rl =  3.1338561 * X - 1.6168667 * Y - 0.4906146 * Z;
  const gl = -0.9787684 * X + 1.9161415 * Y + 0.0334540 * Z;
  const bl =  0.0719453 * X - 0.2289914 * Y + 1.4052427 * Z;
  
  // Gamma correction
  function gamma(v) {
    v = Math.max(0, Math.min(1, v));
    return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  }
  
  const R = Math.round(gamma(rl) * 255);
  const G = Math.round(gamma(gl) * 255);
  const B = Math.round(gamma(bl) * 255);
  
  return `rgb(${R},${G},${B})`;
}

/**
 * Calculate CIEDE2000 color difference
 * Industry standard for print/graphic arts
 * @param {number} L1 - First color L*
 * @param {number} a1 - First color a*
 * @param {number} b1 - First color b*
 * @param {number} L2 - Second color L*
 * @param {number} a2 - Second color a*
 * @param {number} b2 - Second color b*
 * @returns {number} DeltaE2000 value
 */
function deltaE2000(L1, a1, b1, L2, a2, b2) {
  const kL = 1, kC = 1, kH = 1;
  
  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cb = (C1 + C2) / 2;
  const Cb7 = Math.pow(Cb, 7);
  const G = 0.5 * (1 - Math.sqrt(Cb7 / (Cb7 + Math.pow(25, 7))));
  
  const a1p = a1 * (1 + G);
  const a2p = a2 * (1 + G);
  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);
  
  const h1p = (Math.atan2(b1, a1p) * 180 / Math.PI + 360) % 360;
  const h2p = (Math.atan2(b2, a2p) * 180 / Math.PI + 360) % 360;
  
  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  
  let dhp;
  if (C1p * C2p === 0) {
    dhp = 0;
  } else if (Math.abs(h2p - h1p) <= 180) {
    dhp = h2p - h1p;
  } else if (h2p - h1p > 180) {
    dhp = h2p - h1p - 360;
  } else {
    dhp = h2p - h1p + 360;
  }
  
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp / 2 * Math.PI / 180);
  
  const Lbp = (L1 + L2) / 2;
  const Cbp = (C1p + C2p) / 2;
  
  let hbp;
  if (C1p * C2p === 0) {
    hbp = h1p + h2p;
  } else if (Math.abs(h1p - h2p) <= 180) {
    hbp = (h1p + h2p) / 2;
  } else if (h1p + h2p < 360) {
    hbp = (h1p + h2p + 360) / 2;
  } else {
    hbp = (h1p + h2p - 360) / 2;
  }
  
  const r2h = (d) => d * Math.PI / 180;
  
  const T = 1 - 0.17 * Math.cos(r2h(hbp - 30)) +
            0.24 * Math.cos(r2h(2 * hbp)) +
            0.32 * Math.cos(r2h(3 * hbp + 6)) -
            0.20 * Math.cos(r2h(4 * hbp - 63));
  
  const SL = 1 + 0.015 * Math.pow(Lbp - 50, 2) / Math.sqrt(20 + Math.pow(Lbp - 50, 2));
  const SC = 1 + 0.045 * Cbp;
  const SH = 1 + 0.015 * Cbp * T;
  
  const Cbp7 = Math.pow(Cbp, 7);
  const RC = 2 * Math.sqrt(Cbp7 / (Cbp7 + Math.pow(25, 7)));
  
  const dTheta = 30 * Math.exp(-Math.pow((hbp - 275) / 25, 2));
  const RT = -Math.sin(r2h(2 * dTheta)) * RC;
  
  return Math.sqrt(
    Math.pow(dLp / (kL * SL), 2) +
    Math.pow(dCp / (kC * SC), 2) +
    Math.pow(dHp / (kH * SH), 2) +
    RT * (dCp / (kC * SC)) * (dHp / (kH * SH))
  );
}

/**
 * Calculate effective scan print (with optional substrate correction)
 * Neutralizes substrate color influence
 * @param {Object} color - Color object with scanPrint and substrateCorrection
 * @param {Object} deltaWP - White point delta {L, a, b} or null
 * @returns {Object} Effective scan print {L, a, b}
 */
function effectiveScanPrint(color, deltaWP) {
  if (!color.substrateCorrection || !deltaWP) {
    return color.scanPrint;
  }
  
  const sL = num(color.scanPrint.L);
  const sa = num(color.scanPrint.a);
  const sb = num(color.scanPrint.b);
  
  // Subtract substrate contribution from measurement
  return {
    L: (sL !== null && deltaWP.L !== null) 
       ? String((sL - deltaWP.L).toFixed(3)) 
       : color.scanPrint.L,
    a: (sa !== null && deltaWP.a !== null) 
       ? String((sa - deltaWP.a).toFixed(3)) 
       : color.scanPrint.a,
    b: (sb !== null && deltaWP.b !== null) 
       ? String((sb - deltaWP.b).toFixed(3)) 
       : color.scanPrint.b
  };
}

/**
 * Compute white point delta
 * @param {Object} wpBench - Bench white point {L, a, b}
 * @param {Object} wpImpression - Print substrate white point {L, a, b}
 * @returns {Object} Delta WP {L, a, b}
 */
function computeDeltaWP(wpBench, wpImpression) {
  return {
    L: (num(wpBench.L) !== null && num(wpImpression.L) !== null) 
       ? num(wpBench.L) - num(wpImpression.L) 
       : null,
    a: (num(wpBench.a) !== null && num(wpImpression.a) !== null) 
       ? num(wpBench.a) - num(wpImpression.a) 
       : null,
    b: (num(wpBench.b) !== null && num(wpImpression.b) !== null) 
       ? num(wpBench.b) - num(wpImpression.b) 
       : null
  };
}

/**
 * Check if delta WP is defined
 * @param {Object} deltaWP - Delta WP object
 * @returns {boolean}
 */
function isDeltaWPDefined(deltaWP) {
  if (!deltaWP) return false;
  return deltaWP.L !== null || deltaWP.a !== null || deltaWP.b !== null;
}

/**
 * Format number for display
 * @param {number|null} v - Value to format
 * @returns {string} Formatted value or "—"
 */
function fmtNum(v) {
  if (v === null || v === undefined) return '—';
  const n = typeof v === 'number' ? v : num(v);
  return n === null ? '—' : n.toFixed(2);
}

/**
 * Format derive value with sign
 * @param {number|null} v - Derive value
 * @returns {string} Formatted value with + or -
 */
function fmtDerive(v) {
  if (v === null) return '—';
  const s = v.toFixed(2);
  return v > 0 ? '+' + s : s;
}

module.exports = {
  num,
  LAB_RANGE,
  labToCSS,
  deltaE2000,
  effectiveScanPrint,
  computeDeltaWP,
  isDeltaWPDefined,
  fmtNum,
  fmtDerive
};
