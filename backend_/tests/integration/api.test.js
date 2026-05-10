/**
 * Integration Tests - API Endpoints
 * Tests with supertest for all API routes
 */

const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../../server');

describe('API Integration Tests', () => {

  // Sample CCT XML for testing
  const validCCT = `<?xml version="1.0" encoding="UTF-8"?>
<ColorTable xmlns="urn:schemas-colorgate-com:colortable">
  <ColorEntry Name="TestColor">
    <ColorOut ColorSpace="LabD50">
      <ComponentValues>50.00 10.00 20.00</ComponentValues>
    </ColorOut>
  </ColorEntry>
</ColorTable>`;

  const malformedCCT = `<?xml version="1.0" encoding="UTF-8"?>
<ColorTable xmlns="urn:schemas-colorgate-com:colortable">
  <ColorEntry Name="TestColor">
    <ColorOut`;

  describe('GET /api/health', () => {
    test('should return health status 200', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('version', '5.0.0');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/parse-cct', () => {
    test('should parse valid CCT file and return colors', async () => {
      // Create temporary CCT file
      const tmpPath = path.join(__dirname, 'temp-test.cct');
      fs.writeFileSync(tmpPath, validCCT);

      const res = await request(app)
        .post('/api/parse-cct')
        .attach('file', tmpPath);

      // Cleanup
      fs.unlinkSync(tmpPath);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('colors');
      expect(res.body.data).toHaveProperty('warnings');
      expect(Array.isArray(res.body.data.colors)).toBe(true);
      expect(res.body.data.colors.length).toBeGreaterThan(0);

      // Check color structure
      const color = res.body.data.colors[0];
      expect(color).toHaveProperty('name', 'TestColor');
      expect(color).toHaveProperty('bench');
      expect(color.bench).toHaveProperty('L');
      expect(color.bench).toHaveProperty('a');
      expect(color.bench).toHaveProperty('b');
      expect(color).toHaveProperty('rip');
      expect(color).toHaveProperty('css');
    });

    test('should return 400 when no file uploaded', async () => {
      const res = await request(app)
        .post('/api/parse-cct');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('No file uploaded');
    });

    test('should return 400 for non-CCT file', async () => {
      const tmpPath = path.join(__dirname, 'temp-test.txt');
      fs.writeFileSync(tmpPath, 'not a cct file');

      const res = await request(app)
        .post('/api/parse-cct')
        .attach('file', tmpPath);

      // Cleanup
      fs.unlinkSync(tmpPath);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should return 500 for malformed XML', async () => {
      const tmpPath = path.join(__dirname, 'temp-malformed.cct');
      fs.writeFileSync(tmpPath, malformedCCT);

      const res = await request(app)
        .post('/api/parse-cct')
        .attach('file', tmpPath);

      // Cleanup
      fs.unlinkSync(tmpPath);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/compute-corrections', () => {
    test('should compute corrections with valid data', async () => {
      const payload = {
        colors: [
          {
            name: 'TestColor',
            bench: { L: 50, a: 10, b: 20 },
            rip: { L: 49, a: 11, b: 19 },
            scanPrint: { L: 48, a: 12, b: 18 }
          }
        ]
      };

      const res = await request(app)
        .post('/api/compute-corrections')
        .send(payload)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('colors');

      const color = res.body.data.colors[0];
      expect(color).toHaveProperty('name', 'TestColor');
      expect(color).toHaveProperty('scanPrintCorrected');
      expect(color).toHaveProperty('derive');
      expect(color).toHaveProperty('newRip');
      expect(color).toHaveProperty('deltaE');
      expect(typeof color.deltaE).toBe('number');
    });

    test('should compute corrections with deltaWP', async () => {
      const payload = {
        colors: [
          {
            name: 'TestColor',
            bench: { L: 50, a: 10, b: 20 },
            rip: { L: 49, a: 11, b: 19 },
            scanPrint: { L: 48, a: 12, b: 18 }
          }
        ],
        deltaWP: { dL: 0.5, da: 0.2, db: -0.1 }
      };

      const res = await request(app)
        .post('/api/compute-corrections')
        .send(payload)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const color = res.body.data.colors[0];
      expect(color).toHaveProperty('substrateAlert');
    });

    test('should return 400 for empty colors array', async () => {
      const payload = {
        colors: []
      };

      const res = await request(app)
        .post('/api/compute-corrections')
        .send(payload)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Validation failed');
    });

    test('should return 400 for invalid Lab values', async () => {
      const payload = {
        colors: [
          {
            name: 'TestColor',
            bench: { L: 105, a: 10, b: 20 }, // L > 100 invalid
            rip: { L: 49, a: 11, b: 19 },
            scanPrint: { L: 48, a: 12, b: 18 }
          }
        ]
      };

      const res = await request(app)
        .post('/api/compute-corrections')
        .send(payload)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/export-cct', () => {
    test('should export CCT file with valid data', async () => {
      const payload = {
        sourceXML: validCCT,
        colors: [
          {
            name: 'TestColor',
            bench: { L: 50, a: 10, b: 20 },
            rip: { L: 49, a: 11, b: 19 },
            scanPrint: { L: 48, a: 12, b: 18 },
            newRip: { L: 51, a: 9, b: 21 }
          }
        ]
      };

      const res = await request(app)
        .post('/api/export-cct')
        .send(payload)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/xml');
      expect(res.headers['content-disposition']).toContain('attachment');
      expect(res.headers['content-disposition']).toContain('.cct');
      expect(res.text).toContain('<?xml');
      expect(res.text).toContain('ColorTable');
    });

    test('should export with deltaWP', async () => {
      const payload = {
        sourceXML: validCCT,
        colors: [
          {
            name: 'TestColor',
            bench: { L: 50, a: 10, b: 20 },
            rip: { L: 49, a: 11, b: 19 },
            scanPrint: { L: 48, a: 12, b: 18 },
            substrateCorrection: true
          }
        ],
        deltaWP: { dL: 0.5, da: 0.2, db: -0.1 }
      };

      const res = await request(app)
        .post('/api/export-cct')
        .send(payload)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(200);
      expect(res.text).toContain('ColorTable');
    });

    test('should return 400 for missing sourceXML', async () => {
      const payload = {
        colors: [
          {
            name: 'TestColor',
            bench: { L: 50, a: 10, b: 20 },
            rip: { L: 49, a: 11, b: 19 }
          }
        ]
      };

      const res = await request(app)
        .post('/api/export-cct')
        .send(payload)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should return 400 for empty colors array', async () => {
      const payload = {
        sourceXML: validCCT,
        colors: []
      };

      const res = await request(app)
        .post('/api/export-cct')
        .send(payload)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
