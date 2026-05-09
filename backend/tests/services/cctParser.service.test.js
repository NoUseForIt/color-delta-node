/**
 * CCT Parser Service Tests
 */

const {
  parseXML,
  parseCCTCandidates,
  buildFilename
} = require('../../services/cctParser.service');

describe('CCT Parser Service', () => {
  describe('parseXML', () => {
    it('should parse valid CCT XML', () => {
      const xml = `<?xml version="1.0"?>
        <ColorTable xmlns="urn:schemas-colorgate-com:colortable">
          <ColorEntry Name="Cyan">
            <ColorOut>
              <ComponentValues>50.0 -20.5 -30.2</ComponentValues>
            </ColorOut>
          </ColorEntry>
        </ColorTable>`;
      
      const result = parseXML(xml);
      
      expect(result.colors).toHaveLength(1);
      expect(result.colors[0]).toEqual({
        name: 'Cyan',
        L: '50.0',
        a: '-20.5',
        b: '-30.2'
      });
      expect(result.warnings).toHaveLength(0);
    });
    
    it('should handle multiple color entries', () => {
      const xml = `<?xml version="1.0"?>
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
      
      const result = parseXML(xml);
      
      expect(result.colors).toHaveLength(2);
      expect(result.colors[1].name).toBe('Magenta');
    });
    
    it('should detect out of range L values', () => {
      const xml = `<?xml version="1.0"?>
        <ColorTable xmlns="urn:schemas-colorgate-com:colortable">
          <ColorEntry Name="Invalid">
            <ColorOut>
              <ComponentValues>150.0 20.0 30.0</ComponentValues>
            </ColorOut>
          </ColorEntry>
        </ColorTable>`;
      
      const result = parseXML(xml);
      
      expect(result.warnings).toContain('Invalid: L*=150 hors plage [0-100]');
    });
    
    it('should detect out of range a/b values', () => {
      const xml = `<?xml version="1.0"?>
        <ColorTable xmlns="urn:schemas-colorgate-com:colortable">
          <ColorEntry Name="Invalid">
            <ColorOut>
              <ComponentValues>50.0 200.0 -150.0</ComponentValues>
            </ColorOut>
          </ColorEntry>
        </ColorTable>`;
      
      const result = parseXML(xml);
      
      expect(result.warnings).toContain('Invalid: a*=200 hors plage [-127-127]');
      expect(result.warnings).toContain('Invalid: b*=-150 hors plage [-127-127]');
    });
    
    it('should skip entries with missing ColorOut', () => {
      const xml = `<?xml version="1.0"?>
        <ColorTable xmlns="urn:schemas-colorgate-com:colortable">
          <ColorEntry Name="Incomplete">
          </ColorEntry>
        </ColorTable>`;
      
      const result = parseXML(xml);
      
      expect(result.colors).toHaveLength(0);
      expect(result.warnings).toContain('Incomplete: Missing ColorOut element');
    });
    
    it('should skip entries with incomplete Lab values', () => {
      const xml = `<?xml version="1.0"?>
        <ColorTable xmlns="urn:schemas-colorgate-com:colortable">
          <ColorEntry Name="Incomplete">
            <ColorOut>
              <ComponentValues>50.0 20.0</ComponentValues>
            </ColorOut>
          </ColorEntry>
        </ColorTable>`;
      
      const result = parseXML(xml);
      
      expect(result.colors).toHaveLength(0);
      expect(result.warnings).toContain('Incomplete: Incomplete Lab values (need 3, got 2)');
    });
    
    it('should throw on invalid XML', () => {
      const xml = 'not valid xml';
      
      expect(() => parseXML(xml)).toThrow();
    });
  });
  
  describe('parseCCTCandidates', () => {
    it('should parse all color candidates', () => {
      const xml = `<?xml version="1.0"?>
        <ColorTable xmlns="urn:schemas-colorgate-com:colortable">
          <ColorEntry Name="WP1">
            <ColorOut>
              <ComponentValues>95.0 -1.0 2.0</ComponentValues>
            </ColorOut>
          </ColorEntry>
          <ColorEntry Name="WP2">
            <ColorOut>
              <ComponentValues>94.5 -0.5 1.5</ComponentValues>
            </ColorOut>
          </ColorEntry>
        </ColorTable>`;
      
      const result = parseCCTCandidates(xml);
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('WP1');
      expect(result[1].name).toBe('WP2');
    });
    
    it('should use "(sans nom)" for unnamed entries', () => {
      const xml = `<?xml version="1.0"?>
        <ColorTable xmlns="urn:schemas-colorgate-com:colortable">
          <ColorEntry>
            <ColorOut>
              <ComponentValues>50.0 0.0 0.0</ComponentValues>
            </ColorOut>
          </ColorEntry>
        </ColorTable>`;
      
      const result = parseCCTCandidates(xml);
      
      expect(result[0].name).toBe('(sans nom)');
    });
  });
  
  describe('buildFilename', () => {
    it('should build valid filename', () => {
      const filename = buildFilename('Mon Projet', 3, 'cct');
      expect(filename).toBe('MAJ palette Mon Projet scan print 3.cct');
    });
    
    it('should sanitize invalid characters', () => {
      const filename = buildFilename('Projet:/Test*', 1, 'json');
      expect(filename).toBe('MAJ palette Projet--Test- scan print 1.json');
    });
    
    it('should handle empty project name', () => {
      const filename = buildFilename('', 5, 'cct');
      expect(filename).toBe('MAJ palette sans-nom scan print 5.cct');
    });
    
    it('should handle null project name', () => {
      const filename = buildFilename(null, 2, 'cct');
      expect(filename).toBe('MAJ palette sans-nom scan print 2.cct');
    });
  });
});
