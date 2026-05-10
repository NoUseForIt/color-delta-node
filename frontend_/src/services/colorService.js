import apiClient from './apiClient';

/**
 * Service pour interagir avec l'API Color Delta Tool
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

    const response = await apiClient.post('/colors/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Analyse des couleurs avec calcul deltaWP
   * @param {Array} colors - Tableau de couleurs
   * @param {Object} whitePoint - Point blanc de référence
   * @returns {Promise} Analyse complète
   */
  async analyzeColors(colors, whitePoint) {
    const response = await apiClient.post('/colors/analyze', {
      colors,
      whitePoint,
    });
    return response.data;
  },

  /**
   * Applique corrections aux couleurs
   * @param {Array} colors - Couleurs originales
   * @param {Object} whitePoint - Point blanc source
   * @param {Object} targetWhitePoint - Point blanc cible
   * @param {number} deltaWP - Dérive WP détectée
   * @returns {Promise} Couleurs corrigées
   */
  async correctColors(colors, whitePoint, targetWhitePoint, deltaWP) {
    const response = await apiClient.post('/colors/correct', {
      colors,
      whitePoint,
      targetWhitePoint,
      deltaWP,
    });
    return response.data;
  },

  /**
   * Export des couleurs en format .cct
   * @param {Array} colors - Couleurs à exporter
   * @param {Object} metadata - Métadonnées du fichier
   * @returns {Promise<Blob>} Fichier .cct
   */
  async exportCCT(colors, metadata) {
    const response = await apiClient.post(
      '/colors/export',
      { colors, metadata },
      { responseType: 'blob' }
    );
    return response.data;
  },
};

export default colorService;
