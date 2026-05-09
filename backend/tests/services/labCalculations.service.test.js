/**
 * Lab Calculations Service Tests
 */

const {
  num,
  labToCSS,
  deltaE2000,
  effectiveScanPrint,
  computeDeltaWP,
  isDeltaWPDefined,
  fmtNum,
  fmtDerive
} = require('../../services/labCalculations.service');

describe('Lab Calculations Service', () => {
  describe('num', () => {
    it('should parse valid numbers', () => {
      expect(num('50.5')).toBe(50.5);
      expect(num('-20.3')).toBe(-20.3);
      expect(num(42)).toBe(42);
    });

    it('should handle comma as decimal separator', () => {
      expect(num('50,5')).toBe(50.5);
    });

    it('should return null for empty/invalid values', () => {
      expect(num('')).toBeNull();
      expect(num(null)).toBeNull();
      expect(num(undefined)).toBeNull();
      expect(num('-')).toBeNull();
      expect(num('-.')).toBeNull();
      expect(num('abc')).toBeNull();
    });
  });

  describe('labToCSS', () => {
    it('should convert valid Lab to RGB', () => {
      const result = labToCSS(50, 0, 0);
      expect(result).toMatch(/^rgb\(\d+,\d+,\d+\)$/);
    });

    it('should handle string inputs', () => {
      const result = labToCSS('50', '0', '0');
      expect(result).toMatch(/^rgb\(\d+,\d+,\d+\)$/);
    });

    it('should return null for invalid inputs', () => {
      expect(labToCSS(null, 0, 0)).toBeNull();
      expect(labToCSS(50, null, 0)).toBeNull();
      expect(labToCSS(50, 0, null)).toBeNull();
      expect(labToCSS('', '', '')).toBeNull();
    });

    it('should handle extreme Lab values', () => {
      const white = labToCSS(100, 0, 0);
      const black = labToCSS(0, 0, 0);

      expect(white).toBeDefined();
      expect(black).toBeDefined();
    });
  });

  describe('deltaE2000', () => {
    it('should return 0 for identical colors', () => {
      const de = deltaE2000(50, 20, -30, 50, 20, -30);
      expect(de).toBeCloseTo(0, 5);
    });

    it('should return positive value for different colors', () => {
      const de = deltaE2000(50, 0, 0, 60, 10, -10);
      expect(de).toBeGreaterThan(0);
    });

    it('should be symmetric', () => {
      const de1 = deltaE2000(50, 20, 30, 60, -10, 15);
      const de2 = deltaE2000(60, -10, 15, 50, 20, 30);

      expect(de1).toBeCloseTo(de2, 5);
    });

    it('should handle achromatic colors', () => {
      const de = deltaE2000(50, 0, 0, 60, 0, 0);
      expect(de).toBeGreaterThan(0);
      expect(de).toBeLessThan(20);
    });

    it('should detect small differences (< 1 = imperceptible)', () => {
      const de = deltaE2000(50, 0, 0, 50.1, 0.1, 0.1);
      expect(de).toBeLessThan(1);
    });

    it('should detect large differences', () => {
      const de = deltaE2000(0, 0, 0, 100, 0, 0);
      expect(de).toBeGreaterThan(50);
    });
  });

  describe('effectiveScanPrint', () => {
    it('should return scan print when substrate correction disabled', () => {
      const color = {
        scanPrint: { L: '50', a: '20', b: '-10' },
        substrateCorrection: false
      };
      const deltaWP = { L: 2, a: -1, b: 3 };

      const result = effectiveScanPrint(color, deltaWP);

      expect(result).toEqual(color.scanPrint);
    });

    it('should return scan print when deltaWP is null', () => {
      const color = {
        scanPrint: { L: '50', a: '20', b: '-10' },
        substrateCorrection: true
      };

      const result = effectiveScanPrint(color, null);

      expect(result).toEqual(color.scanPrint);
    });

    it('should apply substrate correction', () => {
      const color = {
        scanPrint: { L: '50', a: '20', b: '-10' },
        substrateCorrection: true
      };
      const deltaWP = { L: 2, a: -1, b: 3 };

      const result = effectiveScanPrint(color, deltaWP);

      // scanPrint - deltaWP
      expect(parseFloat(result.L)).toBeCloseTo(48, 2);   // 50 - 2
      expect(parseFloat(result.a)).toBeCloseTo(21, 2);   // 20 - (-1)
      expect(parseFloat(result.b)).toBeCloseTo(-13, 2);  // -10 - 3
    });

    it('should preserve original values when components are null', () => {
      const color = {
        scanPrint: { L: '50', a: '', b: '-10' },
        substrateCorrection: true
      };
      const deltaWP = { L: 2, a: -1, b: 3 };

      const result = effectiveScanPrint(color, deltaWP);

      expect(result.a).toBe('');
    });
  });

  describe('computeDeltaWP', () => {
    it('should calculate white point delta', () => {
      const wpBench = { L: '95', a: '-1', b: '2' };
      const wpImpression = { L: '93', a: '1', b: '-1' };

      const result = computeDeltaWP(wpBench, wpImpression);

      expect(result.L).toBe(2);   // 95 - 93
      expect(result.a).toBe(-2);  // -1 - 1
      expect(result.b).toBe(3);   // 2 - (-1)
    });

    it('should return null for missing components', () => {
      const wpBench = { L: '95', a: '', b: '2' };
      const wpImpression = { L: '93', a: '1', b: '-1' };

      const result = computeDeltaWP(wpBench, wpImpression);

      expect(result.L).toBe(2);
      expect(result.a).toBeNull();
      expect(result.b).toBe(3);
    });
  });

  describe('isDeltaWPDefined', () => {
    it('should return true if any component is defined', () => {
      expect(isDeltaWPDefined({ L: 2, a: null, b: null })).toBe(true);
      expect(isDeltaWPDefined({ L: null, a: -1, b: null })).toBe(true);
      expect(isDeltaWPDefined({ L: null, a: null, b: 3 })).toBe(true);
    });

    it('should return false if all components are null', () => {
      expect(isDeltaWPDefined({ L: null, a: null, b: null })).toBe(false);
    });

    it('should return false if deltaWP is null', () => {
      expect(isDeltaWPDefined(null)).toBe(false);
    });
  });

  describe('fmtNum', () => {
    it('should format numbers with 2 decimals', () => {
      expect(fmtNum(50.123)).toBe('50.12');
      expect(fmtNum(50.5)).toBe('50.50');
    });

    it('should return "—" for null/undefined', () => {
      expect(fmtNum(null)).toBe('—');
      expect(fmtNum(undefined)).toBe('—');
    });

    it('should handle string numbers', () => {
      expect(fmtNum('50.5')).toBe('50.50');
    });
  });

  describe('fmtDerive', () => {
    it('should add + for positive values', () => {
      expect(fmtDerive(5.5)).toBe('+5.50');
    });

    it('should keep - for negative values', () => {
      expect(fmtDerive(-3.2)).toBe('-3.20');
    });

    it('should return "—" for null', () => {
      expect(fmtDerive(null)).toBe('—');
    });
  });
});
