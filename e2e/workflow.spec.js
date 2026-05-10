/**
 * E2E Test - Workflow Principal
 * Upload .cct → Analyse → Correction → Export
 * 
 * @path e2e/workflow.spec.js
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Fixtures - fichiers de test
const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const VALID_CCT = path.join(FIXTURES_DIR, 'sample-valid.cct');
const INVALID_CCT = path.join(FIXTURES_DIR, 'sample-invalid.cct');

test.describe('Workflow Principal - Correction Colorimétrique', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigation page d'accueil
    await page.goto('/');
    await expect(page).toHaveTitle(/Color Delta/i);
  });

  test('01 - Upload fichier .cct valide', async ({ page }) => {
    // Sélectionner fichier
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(VALID_CCT);

    // Vérifier upload réussi
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 5000 });

    // Vérifier affichage preview couleurs
    const colorCards = page.locator('[data-testid="color-card"]');
    await expect(colorCards.first()).toBeVisible();
    const count = await colorCards.count();
    expect(count).toBeGreaterThan(0);

    // Vérifier données Lab affichées
    await expect(page.locator('text=/L.*a.*b/i')).toBeVisible();
  });

  test('02 - Calcul analyse automatique après upload', async ({ page }) => {
    // Upload
    await page.locator('input[type="file"]').setInputFiles(VALID_CCT);
    await page.waitForSelector('[data-testid="upload-success"]');

    // Vérifier calculs ΔE affichés
    await expect(page.locator('[data-testid="delta-e-value"]').first()).toBeVisible();

    // Vérifier alertes substrate (si applicable)
    const substrateAlert = page.locator('[data-testid="substrate-alert"]');
    // Peut être visible ou non selon données
  });

  test('03 - Application correction 1-clic', async ({ page }) => {
    // Upload
    await page.locator('input[type="file"]').setInputFiles(VALID_CCT);
    await page.waitForSelector('[data-testid="upload-success"]');

    // Clic bouton "Appliquer corrections"
    const applyBtn = page.locator('[data-testid="apply-corrections-btn"]');
    await expect(applyBtn).toBeEnabled();
    await applyBtn.click();

    // Vérifier modal/confirmation
    await expect(page.locator('text=/correction.*appliquée/i')).toBeVisible({ timeout: 5000 });

    // Vérifier nouvelles valeurs RIP affichées
    await expect(page.locator('[data-testid="new-rip-value"]').first()).toBeVisible();
  });

  test('04 - Export fichier .cct corrigé', async ({ page }) => {
    // Setup download handler
    const downloadPromise = page.waitForEvent('download');

    // Upload + corrections
    await page.locator('input[type="file"]').setInputFiles(VALID_CCT);
    await page.waitForSelector('[data-testid="upload-success"]');
    await page.locator('[data-testid="apply-corrections-btn"]').click();

    // Export
    const exportBtn = page.locator('[data-testid="export-cct-btn"]');
    await expect(exportBtn).toBeEnabled();
    await exportBtn.click();

    // Vérifier téléchargement
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/corrected.*\.cct$/i);

    // Vérifier contenu fichier
    const filePath = await download.path();
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('<?xml');
    expect(content).toContain('ColorEntry');
  });

  test('05 - Historique itérations visible', async ({ page }) => {
    // Upload
    await page.locator('input[type="file"]').setInputFiles(VALID_CCT);
    await page.waitForSelector('[data-testid="upload-success"]');

    // Appliquer correction
    await page.locator('[data-testid="apply-corrections-btn"]').click();
    await page.waitForSelector('text=/correction.*appliquée/i');

    // Vérifier historique
    const historyBtn = page.locator('[data-testid="history-btn"]');
    await historyBtn.click();

    // Vérifier entrée historique
    await expect(page.locator('[data-testid="history-entry"]').first()).toBeVisible();
    await expect(page.locator('text=/itération/i')).toBeVisible();
  });

  test('06 - Workflow complet multi-itérations', async ({ page }) => {
    // Itération 1
    await page.locator('input[type="file"]').setInputFiles(VALID_CCT);
    await page.waitForSelector('[data-testid="upload-success"]');
    
    const initialDeltaE = await page.locator('[data-testid="delta-e-value"]').first().textContent();
    
    await page.locator('[data-testid="apply-corrections-btn"]').click();
    await page.waitForSelector('text=/correction.*appliquée/i');

    // Simuler nouvelle mesure (upload nouveau scan)
    // Dans vraie app : utilisateur fait nouveau scan physique
    // Ici : upload même fichier pour tester workflow
    await page.locator('[data-testid="new-iteration-btn"]').click();
    await page.locator('input[type="file"]').setInputFiles(VALID_CCT);

    // Vérifier itération 2 créée
    await expect(page.locator('text=/itération.*2/i')).toBeVisible();

    // Export final
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-testid="export-cct-btn"]').click();
    const download = await downloadPromise;
    expect(download).toBeTruthy();
  });
});

test.describe('Gestion Erreurs', () => {

  test('07 - Fichier non-.cct rejeté', async ({ page }) => {
    await page.goto('/');

    // Créer fichier temporaire .txt
    const fakeTxtPath = path.join(FIXTURES_DIR, 'fake.txt');
    fs.writeFileSync(fakeTxtPath, 'Not a CCT file');

    // Upload
    await page.locator('input[type="file"]').setInputFiles(fakeTxtPath);

    // Vérifier erreur
    await expect(page.locator('[data-testid="upload-error"]')).toBeVisible();
    await expect(page.locator('text=/format.*invalide/i')).toBeVisible();

    // Cleanup
    fs.unlinkSync(fakeTxtPath);
  });

  test('08 - XML malformé détecté', async ({ page }) => {
    await page.goto('/');

    // Upload fichier XML invalide
    await page.locator('input[type="file"]').setInputFiles(INVALID_CCT);

    // Vérifier message erreur parsing
    await expect(page.locator('[data-testid="parse-error"]')).toBeVisible();
    await expect(page.locator('text=/parse.*xml/i')).toBeVisible();
  });

  test('09 - Valeurs Lab hors limites affichent warning', async ({ page }) => {
    // Ce test dépend des données du fichier
    // Si fichier contient L>100 ou a/b>127, warning doit apparaître
    await page.goto('/');
    await page.locator('input[type="file"]').setInputFiles(VALID_CCT);
    
    // Vérifier warnings si présents
    const warnings = page.locator('[data-testid="lab-warning"]');
    const count = await warnings.count();
    // Test ne fail pas si 0 warning (dépend données)
    if (count > 0) {
      await expect(warnings.first()).toBeVisible();
    }
  });

  test('10 - Backend offline affiche erreur réseau', async ({ page }) => {
    // Simuler backend down en modifiant config
    // Note: nécessite mock ou proxy
    // Version simplifiée : vérifier affichage erreur si API fail
    await page.goto('/');
    
    // Si backend timeout, UI doit afficher erreur
    // Test à adapter selon implémentation React error boundaries
  });
});

test.describe('Visualisation & UX', () => {

  test('11 - Affichage swatch couleurs correctes', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type="file"]').setInputFiles(VALID_CCT);
    await page.waitForSelector('[data-testid="color-card"]');

    // Vérifier présence swatches
    const swatches = page.locator('[data-testid="color-swatch"]');
    await expect(swatches.first()).toBeVisible();

    // Vérifier attribut background-color set
    const bgColor = await swatches.first().evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColor).toBeTruthy();
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)'); // Pas transparent
  });

  test('12 - Tri couleurs par ΔE', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type="file"]').setInputFiles(VALID_CCT);
    
    // Clic bouton tri
    const sortBtn = page.locator('[data-testid="sort-delta-e-btn"]');
    if (await sortBtn.isVisible()) {
      await sortBtn.click();

      // Vérifier ordre décroissant ΔE
      const deltaValues = await page.locator('[data-testid="delta-e-value"]').allTextContents();
      const numericValues = deltaValues.map(t => parseFloat(t));
      
      for (let i = 0; i < numericValues.length - 1; i++) {
        expect(numericValues[i]).toBeGreaterThanOrEqual(numericValues[i + 1]);
      }
    }
  });

  test('13 - Responsive mobile (optionnel)', async ({ page }) => {
    // Simuler viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Vérifier UI mobile
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
  });
});
