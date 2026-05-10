/**
 * Color Correction Service
 * Core logic for RIP color correction calculations
 */

const { num } = require('./labCalculations.service');

// Substrate alert thresholds
const THRESH_WARN = 2.5;   // Perceptible chromatic ΔWP
const THRESH_DANGER = 5.0; // Strong substrate influence, partial compensation likely

/**
 * Compute color drift between bench target and scan result
 * @param {Object} nuancier - Bench target {L, a, b}
 * @param {Object} scanPrint - Scan result {L, a, b}
 * @returns {Object} Drift {L, a, b}
 */
function computeDerive(nuancier, scanPrint) {
  return {
    L: (num(nuancier.L) !== null && num(scanPrint.L) !== null) 
       ? num(nuancier.L) - num(scanPrint.L) 
       : null,
    a: (num(nuancier.a) !== null && num(scanPrint.a) !== null) 
       ? num(nuancier.a) - num(scanPrint.a) 
       : null,
    b: (num(nuancier.b) !== null && num(scanPrint.b) !== null) 
       ? num(nuancier.b) - num(scanPrint.b) 
       : null
  };
}

/**
 * Compute new RIP values by applying drift correction
 * @param {Object} rip - Current RIP values {L, a, b}
 * @param {Object} derive - Computed drift {L, a, b}
 * @returns {Object} New RIP values {L, a, b}
 */
function computeNewRip(rip, derive) {
  return {
    L: (num(rip.L) !== null && derive.L !== null) 
       ? num(rip.L) + derive.L 
       : null,
    a: (num(rip.a) !== null && derive.a !== null) 
       ? num(rip.a) + derive.a 
       : null,
    b: (num(rip.b) !== null && derive.b !== null) 
       ? num(rip.b) + derive.b 
       : null
  };
}

/**
 * Compute substrate alert level for a color
 * Determines if substrate color may perceptibly affect result
 * @param {Object} nuancier - Bench color {L, a, b}
 * @param {Object} deltaWP - White point delta {L, a, b}
 * @returns {string|null} 'warn', 'danger', or null
 */
function computeSubstrateAlert(nuancier, deltaWP) {
  if (!deltaWP) return null;
  
  const nL = num(nuancier.L);
  const na = num(nuancier.a);
  const nb = num(nuancier.b);
  const dwa = deltaWP.a;
  const dwb = deltaWP.b;
  
  if (dwa === null && dwb === null) return null;
  
  // Calculate chromatic magnitude of deltaWP
  const chromaDW = Math.sqrt((dwa || 0) ** 2 + (dwb || 0) ** 2);
  if (chromaDW < THRESH_WARN) return null;
  
  // Check if color is susceptible: light (L*>60) or neutral/low chroma
  const chroma = (na !== null && nb !== null) 
    ? Math.sqrt(na ** 2 + nb ** 2) 
    : null;
  
  const isSusceptible = (nL !== null && nL > 60) || 
                        (chroma !== null && chroma < 20);
  
  if (!isSusceptible) return null;
  
  // Non-compensable: substrate pushes strongly opposite to ink capacity
  // WP_impression has strong chromatic component ink cannot counteract
  let isNonComp = false;
  
  if (Math.abs(dwa || 0) > THRESH_DANGER || Math.abs(dwb || 0) > THRESH_DANGER) {
    // Neutral/light color with big substrate push is hard to fully compensate
    if (chroma !== null && chroma < 15 && chromaDW > THRESH_DANGER) {
      isNonComp = true;
    }
  }
  
  return isNonComp ? 'danger' : 'warn';
}

/**
 * Extract Lab values from a history snapshot
 * Priority: scanPrintCorrected > scanPrint > rip
 * @param {Object} snap - History snapshot
 * @returns {Object|null} Lab values {L, a, b} or null
 */
function snapLabValues(snap) {
  // Priority 1: Substrate-corrected scan print
  if (snap.scanPrintCorrected) {
    const cL = snap.scanPrintCorrected.L;
    const ca = snap.scanPrintCorrected.a;
    const cb = snap.scanPrintCorrected.b;
    
    if (cL !== null && ca !== null && cb !== null) {
      return { L: cL, a: ca, b: cb };
    }
  }
  
  // Priority 2: Raw scan print (actual measurement)
  if (snap.scanPrint) {
    const sL = num(snap.scanPrint.L);
    const sa = num(snap.scanPrint.a);
    const sb = num(snap.scanPrint.b);
    
    if (sL !== null && sa !== null && sb !== null) {
      return { L: sL, a: sa, b: sb };
    }
  }
  
  // Priority 3: RIP value (requested value, fallback)
  if (snap.rip) {
    const rL = num(snap.rip.L);
    const ra = num(snap.rip.a);
    const rb = num(snap.rip.b);
    
    if (rL !== null && ra !== null && rb !== null) {
      return { L: rL, a: ra, b: rb };
    }
  }
  
  return null;
}

/**
 * Find index of iteration closest to bench target (via ΔE2000)
 * @param {Array} history - Array of snapshots
 * @param {Object} nuancier - Bench target {L, a, b}
 * @returns {number|null} Best snapshot index or null
 */
function bestSnapIndex(history, nuancier) {
  const { deltaE2000 } = require('./labCalculations.service');
  
  const nL = num(nuancier.L);
  const na = num(nuancier.a);
  const nb = num(nuancier.b);
  
  if (nL === null || na === null || nb === null || !history || !history.length) {
    return null;
  }
  
  let best = null;
  let bestDE = Infinity;
  
  history.forEach((snap, i) => {
    const vals = snapLabValues(snap);
    if (!vals) return;
    
    const de = deltaE2000(vals.L, vals.a, vals.b, nL, na, nb);
    if (de < bestDE) {
      bestDE = de;
      best = i;
    }
  });
  
  return best;
}

/**
 * Calculate ΔE2000 between snapshot and bench
 * @param {Object} snap - History snapshot
 * @param {Object} nuancier - Bench target {L, a, b}
 * @returns {number|null} ΔE2000 value or null
 */
function snapDeltaE(snap, nuancier) {
  const { deltaE2000 } = require('./labCalculations.service');
  
  const nL = num(nuancier.L);
  const na = num(nuancier.a);
  const nb = num(nuancier.b);
  
  if (nL === null || na === null || nb === null) return null;
  
  const vals = snapLabValues(snap);
  if (!vals) return null;
  
  return deltaE2000(vals.L, vals.a, vals.b, nL, na, nb);
}

/**
 * Create a color factory object
 * @param {string} name - Color name
 * @param {string} ripL - L* value
 * @param {string} ripA - a* value
 * @param {string} ripB - b* value
 * @returns {Object} Color object
 */
function makeColor(name, ripL, ripA, ripB) {
  return {
    id: Math.random().toString(36).slice(2),
    name,
    locked: false,
    nuancier: { L: '', a: '', b: '' },
    nuancierLocked: false,
    rip: { 
      L: String(ripL || ''), 
      a: String(ripA || ''), 
      b: String(ripB || '') 
    },
    scanPrint: { L: '', a: '', b: '' },
    substrateCorrection: false,
    history: []
  };
}

/**
 * Create a history snapshot
 * @param {Object} color - Color object
 * @param {number} printNum - Print number
 * @param {Object} deltaWP - White point delta
 * @returns {Object} Snapshot object
 */
function makeSnapshot(color, printNum, deltaWP) {
  const { effectiveScanPrint, isDeltaWPDefined } = require('./labCalculations.service');
  
  const subOn = color.substrateCorrection && isDeltaWPDefined(deltaWP);
  const effSP = effectiveScanPrint(color, subOn ? deltaWP : null);
  const derive = computeDerive(color.nuancier, effSP);
  const nr = computeNewRip(color.rip, derive);
  const iterNum = (color.history || []).length + 1;
  
  const snap = {
    id: Math.random().toString(36).slice(2),
    iterNum,
    printNum,
    date: new Date().toISOString(),
    rip: { ...color.rip },
    scanPrint: { ...color.scanPrint },
    derive: { L: derive.L, a: derive.a, b: derive.b },
    newRip: {
      L: nr.L !== null ? parseFloat(nr.L.toFixed(2)) : null,
      a: nr.a !== null ? parseFloat(nr.a.toFixed(2)) : null,
      b: nr.b !== null ? parseFloat(nr.b.toFixed(2)) : null
    },
    substrateUsed: subOn
  };
  
  if (subOn) {
    snap.scanPrintCorrected = {
      L: num(effSP.L),
      a: num(effSP.a),
      b: num(effSP.b)
    };
    snap.deltaWP = { L: deltaWP.L, a: deltaWP.a, b: deltaWP.b };
  }
  
  return snap;
}

module.exports = {
  THRESH_WARN,
  THRESH_DANGER,
  computeDerive,
  computeNewRip,
  computeSubstrateAlert,
  snapLabValues,
  bestSnapIndex,
  snapDeltaE,
  makeColor,
  makeSnapshot
};
