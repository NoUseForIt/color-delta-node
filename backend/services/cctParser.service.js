/**
 * CCT Parser Service
 * Parse ColorGATE .cct files (XML format) and extract Lab values
 */

const { DOMParser } = require('@xmldom/xmldom');

const NS = "urn:schemas-colorgate-com:colortable";

/**
 * Parse CCT XML and extract color entries
 * @param {string} xmlText - Raw XML content
 * @returns {Object} { colors: Array, warnings: Array }
 */
function parseXML(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  
  // Check for parsing errors
  const parseError = doc.getElementsByTagName('parsererror');
  if (parseError.length > 0) {
    throw new Error('XML parsing failed: Invalid XML format');
  }
  
  const entries = doc.getElementsByTagNameNS(NS, 'ColorEntry');
  const colors = [];
  const warnings = [];
  
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const name = entry.getAttribute('Name') || '';
    
    if (!name) {
      warnings.push(`Entry ${i + 1}: Missing color name`);
      continue;
    }
    
    const colorOut = entry.getElementsByTagNameNS(NS, 'ColorOut')[0];
    if (!colorOut) {
      warnings.push(`${name}: Missing ColorOut element`);
      continue;
    }
    
    const cv = colorOut.getElementsByTagNameNS(NS, 'ComponentValues')[0];
    if (!cv || !cv.textContent) {
      warnings.push(`${name}: Missing ComponentValues`);
      continue;
    }
    
    const parts = cv.textContent.trim().split(/\s+/);
    if (parts.length < 3) {
      warnings.push(`${name}: Incomplete Lab values (need 3, got ${parts.length})`);
      continue;
    }
    
    const L = parseFloat(parts[0]);
    const a = parseFloat(parts[1]);
    const b = parseFloat(parts[2]);
    
    // Validate ranges
    if (L < 0 || L > 100) {
      warnings.push(`${name}: L*=${L} hors plage [0-100]`);
    }
    if (a < -127 || a > 127) {
      warnings.push(`${name}: a*=${a} hors plage [-127-127]`);
    }
    if (b < -127 || b > 127) {
      warnings.push(`${name}: b*=${b} hors plage [-127-127]`);
    }
    
    colors.push({
      name,
      L: parts[0],
      a: parts[1],
      b: parts[2]
    });
  }
  
  return { colors, warnings };
}

/**
 * Parse CCT and return all color candidates (for WP picker)
 * @param {string} xmlText - Raw XML content
 * @returns {Array} Array of color candidates
 */
function parseCCTCandidates(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  
  const parseError = doc.getElementsByTagName('parsererror');
  if (parseError.length > 0) {
    throw new Error('XML parsing failed: Invalid XML format');
  }
  
  const entries = doc.getElementsByTagNameNS(NS, 'ColorEntry');
  const candidates = [];
  
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const name = entry.getAttribute('Name') || '(sans nom)';
    const colorOut = entry.getElementsByTagNameNS(NS, 'ColorOut')[0];
    
    if (!colorOut) continue;
    
    const cv = colorOut.getElementsByTagNameNS(NS, 'ComponentValues')[0];
    if (!cv || !cv.textContent) continue;
    
    const parts = cv.textContent.trim().split(/\s+/);
    if (parts.length < 3) continue;
    
    candidates.push({
      name,
      L: parts[0],
      a: parts[1],
      b: parts[2]
    });
  }
  
  return candidates;
}

/**
 * Build CCT XML from color data
 * @param {string} sourceText - Original CCT XML template
 * @param {Array} colors - Array of color objects
 * @param {Object} deltaWP - White point delta {L, a, b} or null
 * @returns {string} Updated CCT XML
 */
function buildCCT(sourceText, colors, deltaWP = null) {
  const { effectiveScanPrint } = require('./labCalculations.service');
  const { computeDerive, computeNewRip } = require('./colorCorrection.service');
  
  function fmtLab(v) {
    if (v === null) return '0';
    const s = (Math.round(v * 100) / 100).toFixed(2);
    return s.replace(/\.?0+$/, '');
  }
  
  function num(v) {
    if (v === '' || v === null || v === undefined || v === '-' || v === '-.') return null;
    const n = parseFloat(String(v).replace(',', '.'));
    return isNaN(n) ? null : n;
  }
  
  const ripMap = {};
  
  for (const c of colors) {
    const eff = effectiveScanPrint(c, deltaWP);
    const derive = computeDerive(c.nuancier, eff);
    const nr = computeNewRip(c.rip, derive);
    
    ripMap[c.name] = {
      L: nr.L !== null ? nr.L : num(c.rip.L),
      a: nr.a !== null ? nr.a : num(c.rip.a),
      b: nr.b !== null ? nr.b : num(c.rip.b)
    };
  }
  
  let result = sourceText;
  
  for (const name in ripMap) {
    const vals = ripMap[name];
    if (vals.L === null) continue;
    
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pat = new RegExp(
      `(<ColorEntry Name="${esc}"[^>]*>[\\s\\S]*?<ColorOut[^>]*>[\\s\\S]*?<ComponentValues>)([^<]+)(</ComponentValues>[\\s\\S]*?</ColorOut>)`,
      'g'
    );
    
    result = result.replace(
      pat,
      `$1${fmtLab(vals.L)} ${fmtLab(vals.a)} ${fmtLab(vals.b)}$3`
    );
  }
  
  return result;
}

/**
 * Build CCT from a specific history snapshot
 * @param {string} sourceText - Original CCT XML template
 * @param {Array} colors - Array of color objects
 * @param {Object} snapshot - History snapshot {colorId, rip: {L, a, b}}
 * @param {Object} deltaWP - White point delta {L, a, b} or null
 * @returns {string} Updated CCT XML
 */
function buildCCTFromSnapshot(sourceText, colors, snapshot, deltaWP = null) {
  const { effectiveScanPrint } = require('./labCalculations.service');
  const { computeDerive, computeNewRip } = require('./colorCorrection.service');
  
  function fmtLab(v) {
    if (v === null) return '0';
    const s = (Math.round(v * 100) / 100).toFixed(2);
    return s.replace(/\.?0+$/, '');
  }
  
  function num(v) {
    if (v === '' || v === null || v === undefined || v === '-' || v === '-.') return null;
    const n = parseFloat(String(v).replace(',', '.'));
    return isNaN(n) ? null : n;
  }
  
  const ripMap = {};
  
  for (const c of colors) {
    if (snapshot && c.id === snapshot.colorId) {
      ripMap[c.name] = {
        L: num(snapshot.rip.L),
        a: num(snapshot.rip.a),
        b: num(snapshot.rip.b)
      };
    } else {
      const eff = effectiveScanPrint(c, deltaWP);
      const derive = computeDerive(c.nuancier, eff);
      const nr = computeNewRip(c.rip, derive);
      
      ripMap[c.name] = {
        L: nr.L !== null ? nr.L : num(c.rip.L),
        a: nr.a !== null ? nr.a : num(c.rip.a),
        b: nr.b !== null ? nr.b : num(c.rip.b)
      };
    }
  }
  
  let result = sourceText;
  
  for (const name in ripMap) {
    const vals = ripMap[name];
    if (vals.L === null) continue;
    
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pat = new RegExp(
      `(<ColorEntry Name="${esc}"[^>]*>[\\s\\S]*?<ColorOut[^>]*>[\\s\\S]*?<ComponentValues>)([^<]+)(</ComponentValues>[\\s\\S]*?</ColorOut>)`,
      'g'
    );
    
    result = result.replace(
      pat,
      `$1${fmtLab(vals.L)} ${fmtLab(vals.a)} ${fmtLab(vals.b)}$3`
    );
  }
  
  return result;
}

/**
 * Build safe filename for export
 * @param {string} projectName - Project name
 * @param {number} printNum - Print number
 * @param {string} ext - File extension (cct, json)
 * @returns {string} Safe filename
 */
function buildFilename(projectName, printNum, ext) {
  const safe = (projectName || 'sans-nom')
    .replace(/[\\/:*?"<>|]/g, '-')
    .trim();
  return `MAJ palette ${safe} scan print ${printNum}.${ext}`;
}

module.exports = {
  parseXML,
  parseCCTCandidates,
  buildCCT,
  buildCCTFromSnapshot,
  buildFilename
};
