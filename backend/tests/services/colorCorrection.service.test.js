/**
 * Color Correction Service Tests
 */

const {
  computeDerive,
  computeNewRip,
  computeSubstrateAlert,
  snapLabValues,
  bestSnapIndex,
  snapDeltaE,
  makeColor,
  makeSnapshot,
  THRESH_WARN,
  THRESH_DANGER
} = require('../../services/colorCorrection.service');

describe('Color Correction Service', () => {
  describe('computeDerive', () => {
    it('should calculate drift between bench and scan', () => {
      const nuancier = { L: '60', a: '20', b: '-10' };
      const scanPrint = { L: '58', a: '22', b: '-12' };
      
      const result = computeDerive(nuancier, scanPrint);
      
      expect(result.L).toBe(2);   // 60 - 58
      expect(result.a).toBe(-2);  // 20 - 22
      expect(result.b).toBe(2);   // -10 - (-12)
    });
    
    it('should return null for missing components', () => {
      const nuancier = { L: '60', a: '', b: '-10' };
      const scanPrint = { L: '58', a: '22', b: '' };
      
      const result = computeDerive(nuancier, scanPrint);
      
      expect(result.L).toBe(2);
      expect(result.a).toBeNull();
      expect(result.b).toBeNull();
    });
  });
  
  describe('computeNewRip', () => {
    it('should apply drift to RIP values', () => {
      const rip = { L: '50', a: '10', b: '-5' };
      const derive = { L: 2, a: -3, b: 1 };
      
      const result = computeNewRip(rip, derive);
      
      expect(result.L).toBe(52);   // 50 + 2
      expect(result.a).toBe(7);    // 10 + (-3)
      expect(result.b).toBe(-4);   // -5 + 1
    });
    
    it('should return null for missing components', () => {
      const rip = { L: '50', a: '', b: '-5' };
      const derive = { L: 2, a: -3, b: null };
      
      const result = computeNewRip(rip, derive);
      
      expect(result.L).toBe(52);
      expect(result.a).toBeNull();
      expect(result.b).toBeNull();
    });
  });
  
  describe('computeSubstrateAlert', () => {
    it('should return null when deltaWP is null', () => {
      const nuancier = { L: '80', a: '5', b: '10' };
      const result = computeSubstrateAlert(nuancier, null);
      
      expect(result).toBeNull();
    });
    
    it('should return null when chromatic deltaWP is below threshold', () => {
      const nuancier = { L: '80', a: '5', b: '10' };
      const deltaWP = { L: 1, a: 0.5, b: 0.3 };  // Low chromatic magnitude
      
      const result = computeSubstrateAlert(nuancier, deltaWP);
      
      expect(result).toBeNull();
    });
    
    it('should return null for non-susceptible colors', () => {
      // Dark, saturated color (L < 60, high chroma)
      const nuancier = { L: '40', a: '50', b: '-40' };
      const deltaWP = { L: 0, a: 3, b: -2 };
      
      const result = computeSubstrateAlert(nuancier, deltaWP);
      
      expect(result).toBeNull();
    });
    
    it('should return "warn" for light susceptible color', () => {
      // Light color with moderate deltaWP
      const nuancier = { L: '80', a: '5', b: '5' };
      const deltaWP = { L: 0, a: 3, b: 0 };  // Above THRESH_WARN
      
      const result = computeSubstrateAlert(nuancier, deltaWP);
      
      expect(result).toBe('warn');
    });
    
    it('should return "warn" for neutral/low chroma color', () => {
      // Neutral color with moderate deltaWP
      const nuancier = { L: '50', a: '2', b: '2' };  // Low chroma
      const deltaWP = { L: 0, a: 0, b: 3 };
      
      const result = computeSubstrateAlert(nuancier, deltaWP);
      
      expect(result).toBe('warn');
    });
    
    it('should return "danger" for strong substrate push on neutral color', () => {
      // Very neutral color with strong deltaWP
      const nuancier = { L: '70', a: '1', b: '1' };  // Very low chroma
      const deltaWP = { L: 0, a: 6, b: 0 };  // Above THRESH_DANGER
      
      const result = computeSubstrateAlert(nuancier, deltaWP);
      
      expect(result).toBe('danger');
    });
  });
  
  describe('snapLabValues', () => {
    it('should prioritize scanPrintCorrected', () => {
      const snap = {
        scanPrintCorrected: { L: 50, a: 20, b: -10 },
        scanPrint: { L: '48', a: '22', b: '-12' },
        rip: { L: '45', a: '25', b: '-15' }
      };
      
      const result = snapLabValues(snap);
      
      expect(result).toEqual({ L: 50, a: 20, b: -10 });
    });
    
    it('should use scanPrint if scanPrintCorrected missing', () => {
      const snap = {
        scanPrint: { L: '48', a: '22', b: '-12' },
        rip: { L: '45', a: '25', b: '-15' }
      };
      
      const result = snapLabValues(snap);
      
      expect(result).toEqual({ L: 48, a: 22, b: -12 });
    });
    
    it('should fallback to rip if scan values missing', () => {
      const snap = {
        scanPrint: { L: '', a: '', b: '' },
        rip: { L: '45', a: '25', b: '-15' }
      };
      
      const result = snapLabValues(snap);
      
      expect(result).toEqual({ L: 45, a: 25, b: -15 });
    });
    
    it('should return null if no valid values', () => {
      const snap = {
        scanPrint: { L: '', a: '', b: '' },
        rip: { L: '', a: '', b: '' }
      };
      
      const result = snapLabValues(snap);
      
      expect(result).toBeNull();
    });
  });
  
  describe('bestSnapIndex', () => {
    it('should return null for empty history', () => {
      const nuancier = { L: '50', a: '20', b: '-10' };
      const result = bestSnapIndex([], nuancier);
      
      expect(result).toBeNull();
    });
    
    it('should return null for invalid bench', () => {
      const history = [
        { scanPrint: { L: '48', a: '22', b: '-12' } }
      ];
      const nuancier = { L: '', a: '', b: '' };
      
      const result = bestSnapIndex(history, nuancier);
      
      expect(result).toBeNull();
    });
    
    it('should find closest iteration to bench', () => {
      const history = [
        { scanPrint: { L: '45', a: '15', b: '-5' } },   // Far
        { scanPrint: { L: '49.5', a: '19.8', b: '-9.9' } },  // Close
        { scanPrint: { L: '40', a: '10', b: '0' } }     // Very far
      ];
      const nuancier = { L: '50', a: '20', b: '-10' };
      
      const result = bestSnapIndex(history, nuancier);
      
      expect(result).toBe(1);  // Index of closest iteration
    });
  });
  
  describe('snapDeltaE', () => {
    it('should calculate deltaE between snap and bench', () => {
      const snap = {
        scanPrint: { L: '50', a: '20', b: '-10' }
      };
      const nuancier = { L: '51', a: '21', b: '-11' };
      
      const result = snapDeltaE(snap, nuancier);
      
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(5);  // Small difference
    });
    
    it('should return null for invalid bench', () => {
      const snap = {
        scanPrint: { L: '50', a: '20', b: '-10' }
      };
      const nuancier = { L: '', a: '', b: '' };
      
      const result = snapDeltaE(snap, nuancier);
      
      expect(result).toBeNull();
    });
    
    it('should return null for invalid snap', () => {
      const snap = {
        scanPrint: { L: '', a: '', b: '' },
        rip: { L: '', a: '', b: '' }
      };
      const nuancier = { L: '50', a: '20', b: '-10' };
      
      const result = snapDeltaE(snap, nuancier);
      
      expect(result).toBeNull();
    });
  });
  
  describe('makeColor', () => {
    it('should create color object with default values', () => {
      const color = makeColor('Test Color', '50', '20', '-10');
      
      expect(color.name).toBe('Test Color');
      expect(color.rip).toEqual({ L: '50', a: '20', b: '-10' });
      expect(color.locked).toBe(false);
      expect(color.nuancierLocked).toBe(false);
      expect(color.substrateCorrection).toBe(false);
      expect(color.history).toEqual([]);
      expect(color.id).toBeDefined();
    });
    
    it('should handle empty RIP values', () => {
      const color = makeColor('Empty', '', '', '');
      
      expect(color.rip).toEqual({ L: '', a: '', b: '' });
    });
  });
  
  describe('makeSnapshot', () => {
    it('should create snapshot without substrate correction', () => {
      const color = {
        id: 'test-id',
        name: 'Test',
        rip: { L: '50', a: '20', b: '-10' },
        scanPrint: { L: '48', a: '22', b: '-12' },
        nuancier: { L: '50', a: '20', b: '-10' },
        substrateCorrection: false,
        history: []
      };
      
      const snap = makeSnapshot(color, 1, null);
      
      expect(snap.iterNum).toBe(1);
      expect(snap.printNum).toBe(1);
      expect(snap.substrateUsed).toBe(false);
      expect(snap.rip).toEqual(color.rip);
      expect(snap.scanPrint).toEqual(color.scanPrint);
      expect(snap.derive).toBeDefined();
      expect(snap.newRip).toBeDefined();
    });
    
    it('should create snapshot with substrate correction', () => {
      const color = {
        id: 'test-id',
        name: 'Test',
        rip: { L: '50', a: '20', b: '-10' },
        scanPrint: { L: '48', a: '22', b: '-12' },
        nuancier: { L: '50', a: '20', b: '-10' },
        substrateCorrection: true,
        history: []
      };
      const deltaWP = { L: 2, a: -1, b: 3 };
      
      const snap = makeSnapshot(color, 1, deltaWP);
      
      expect(snap.substrateUsed).toBe(true);
      expect(snap.scanPrintCorrected).toBeDefined();
      expect(snap.deltaWP).toEqual(deltaWP);
    });
    
    it('should increment iteration number', () => {
      const color = {
        id: 'test-id',
        name: 'Test',
        rip: { L: '50', a: '20', b: '-10' },
        scanPrint: { L: '48', a: '22', b: '-12' },
        nuancier: { L: '50', a: '20', b: '-10' },
        substrateCorrection: false,
        history: [
          { iterNum: 1 },
          { iterNum: 2 }
        ]
      };
      
      const snap = makeSnapshot(color, 3, null);
      
      expect(snap.iterNum).toBe(3);
    });
  });
});
