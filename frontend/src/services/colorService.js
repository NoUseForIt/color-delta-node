import apiClient from './apiClient';

/**
 * Service pour interagir avec l'API Color Delta Tool (Phase 3)
 * Endpoints: /parse-cct, /compute-corrections, /export-cct
 */
const colorService = {
  /**
   * Upload et parse un fichier .cct
   * @param {File} file - Fichier .cct
   * @returns {Promise} Données parsées
   */
  async uploadCCT(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/parse-cct', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    // Adapter la réponse Phase 3 au format attendu par le store
    return {
      colors: response.data.colors,
      whitePoint: response.data.colors[0]?.bench, // Premier color bench = white point
      metadata: {
        sourceXML: response.data.sourceXML,
        css: response.data.css,
      },
    };
  },

  /**
   * Calcule les corrections pour les couleurs
   * Note: Phase 3 combine analyze + correct en un seul endpoint
   * @param {Array} colors - Tableau de couleurs
   * @param {Object} deltaWP - Dérive WP {dL, da, db} (optionnel)
   * @returns {Promise} Corrections et analyse
   */
  async computeCorrections(colors, deltaWP = null) {
    const response = await apiClient.post('/compute-corrections', {
      colors,
      deltaWP,
    });
    
    return response.data;
  },

  /**
   * Export des couleurs en format .cct
   * @param {string} sourceXML - XML source du fichier original
   * @param {Array} colors - Couleurs à exporter
   * @param {Object} deltaWP - Dérive WP appliquée {dL, da, db}
   * @returns {Promise<Blob>} Fichier .cct
   */
  async exportCCT(sourceXML, colors, deltaWP = null) {
    const response = await apiClient.post(
      '/export-cct',
      { sourceXML, colors, deltaWP },
      { responseType: 'blob' }
    );
    return response.data;
  },
};

export default colorService;
