/**
 * Formate un nombre avec décimales
 */
export const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined) return 'N/A';
  return Number(num).toFixed(decimals);
};

/**
 * Formate des coordonnées Lab
 */
export const formatLab = (lab) => {
  if (!lab) return 'N/A';
  return `L*=${formatNumber(lab.L)} a*=${formatNumber(lab.a)} b*=${formatNumber(lab.b)}`;
};

/**
 * Formate des coordonnées XYZ
 */
export const formatXYZ = (xyz) => {
  if (!xyz) return 'N/A';
  return `X=${formatNumber(xyz.X)} Y=${formatNumber(xyz.Y)} Z=${formatNumber(xyz.Z)}`;
};

/**
 * Détermine la sévérité d'un deltaE
 */
export const getDeltaSeverity = (deltaE) => {
  if (deltaE < 1) return 'excellent';
  if (deltaE < 2.3) return 'good';
  if (deltaE < 5) return 'acceptable';
  return 'poor';
};

/**
 * Retourne la couleur correspondante à la sévérité
 */
export const getSeverityColor = (severity) => {
  const colors = {
    excellent: 'text-green-600 bg-green-50',
    good: 'text-blue-600 bg-blue-50',
    acceptable: 'text-yellow-600 bg-yellow-50',
    poor: 'text-red-600 bg-red-50',
  };
  return colors[severity] || colors.acceptable;
};

/**
 * Formate une date ISO en format lisible
 */
export const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Valide un fichier .cct
 */
export const validateCCTFile = (file) => {
  if (!file) return { valid: false, error: 'Aucun fichier sélectionné' };
  
  const extension = file.name.split('.').pop().toLowerCase();
  if (extension !== 'cct') {
    return { valid: false, error: 'Le fichier doit être au format .cct' };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'Le fichier ne doit pas dépasser 5MB' };
  }

  return { valid: true };
};

/**
 * Calcule des statistiques sur les deltas
 */
export const calculateStats = (deltas) => {
  if (!deltas || deltas.length === 0) return null;

  const values = deltas.map(d => d.deltaE).filter(v => v !== null);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  return { min, max, avg, count: values.length };
};
