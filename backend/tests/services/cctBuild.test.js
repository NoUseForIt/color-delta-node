/**
 * CCT Build Tests - Additional coverage
 */

const {
  buildCCT,
  buildCCTFromSnapshot
} = require('../../services/cctParser.service');

describe('CCT Build Functions', () => {
  const sampleTemplate = `<?xml version="1.0"?>
<ColorTable xmlns="urn:schemas-colorgate-com:colortable">
  <ColorEntry Name="Cyan">
    <ColorOut>
      <ComponentValues>50.0 -20.5 -30.2</ComponentValues>
    </ColorOut>
  </ColorEntry>
  <ColorEntry Name="Magenta">
    <ColorOut>
      <ComponentValues>60.5 80.3 -10.1</ComponentValues>
    </ColorOut>
  </ColorEntry>
</ColorTable>`;

  describe('buildCCT', () => {
    it('should build CCT without substrate correction', () => {
      const colors = [
        {
          name: 'Cyan',
          id: 'c1',
          locked: false,
          rip: { L: '50', a: '-20', b: '-30' },
          nuancier: { L: '52', a: '-18', b: '-32' },
          scanPrint: { L: '51', a: '-19', b: '-31' },
          substrateCorrection: false,
          history: []
        }
      ];
      
      const result = buildCCT(sampleTemplate, colors, null);
      
      expect(result).toContain('Cyan');
      expect(result).toContain('ComponentValues');
      // New values should be: rip + derive
      // derive = nuancier - scanPrint = (52,-18,-32) - (51,-19,-31) = (1,1,-1)
      // newRip = rip + derive = (50,-20,-30) + (1,1,-1) = (51,-19,-31)
      expect(result).toContain('51 -19 -31');
    });
    
    it('should build CCT with substrate correction', () => {
      const colors = [
        {
          name: 'Magenta',
          id: 'm1',
          locked: false,
          rip: { L: '60', a: '80', b: '-10' },
          nuancier: { L: '62', a: '82', b: '-8' },
          scanPrint: { L: '61', a: '81', b: '-9' },
          substrateCorrection: true,
          history: []
        }
      ];
      const deltaWP = { L: 1, a: -1, b: 0.5 };
      
      const result = buildCCT(sampleTemplate, colors, deltaWP);
      
      expect(result).toContain('Magenta');
      // Effective scan = scanPrint - deltaWP = (61,81,-9) - (1,-1,0.5) = (60,82,-9.5)
      // derive = nuancier - effectiveScan = (62,82,-8) - (60,82,-9.5) = (2,0,1.5)
      // newRip = rip + derive = (60,80,-10) + (2,0,1.5) = (62,80,-8.5)
      expect(result).toContain('62 80 -8.5');
    });
    
    it('should preserve unchanged colors', () => {
      const colors = [
        {
          name: 'Cyan',
          id: 'c1',
          locked: false,
          rip: { L: '50', a: '-20', b: '-30' },
          nuancier: { L: '', a: '', b: '' },
          scanPrint: { L: '', a: '', b: '' },
          substrateCorrection: false,
          history: []
        }
      ];
      
      const result = buildCCT(sampleTemplate, colors, null);
      
      // Should keep original values when no derive can be computed
      expect(result).toContain('50 -20 -30');
    });
  });
  
  describe('buildCCTFromSnapshot', () => {
    it('should build CCT from specific snapshot', () => {
      const colors = [
        {
          name: 'Cyan',
          id: 'c1',
          rip: { L: '50', a: '-20', b: '-30' },
          nuancier: { L: '52', a: '-18', b: '-32' },
          scanPrint: { L: '51', a: '-19', b: '-31' },
          substrateCorrection: false
        },
        {
          name: 'Magenta',
          id: 'm1',
          rip: { L: '60', a: '80', b: '-10' },
          nuancier: { L: '62', a: '82', b: '-8' },
          scanPrint: { L: '61', a: '81', b: '-9' },
          substrateCorrection: false
        }
      ];
      
      const snapshot = {
        colorId: 'c1',
        rip: { L: '48', a: '-22', b: '-28' }
      };
      
      const result = buildCCTFromSnapshot(sampleTemplate, colors, snapshot, null);
      
      // Cyan should use snapshot values
      expect(result).toContain('48 -22 -28');
      // Magenta should use computed values
      expect(result).toContain('61 81 -9');
    });
    
    it('should handle null snapshot', () => {
      const colors = [
        {
          name: 'Cyan',
          id: 'c1',
          rip: { L: '50', a: '-20', b: '-30' },
          nuancier: { L: '52', a: '-18', b: '-32' },
          scanPrint: { L: '51', a: '-19', b: '-31' },
          substrateCorrection: false
        }
      ];
      
      const result = buildCCTFromSnapshot(sampleTemplate, colors, null, null);
      
      // Should compute normally without snapshot
      expect(result).toContain('51 -19 -31');
    });
  });
});
