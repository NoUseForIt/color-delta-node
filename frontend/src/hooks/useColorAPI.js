import { useMutation } from '@tanstack/react-query';
import colorService from '../services/colorService';
import useColorStore from '../stores/colorStore';

/**
 * Hook pour upload fichier .cct
 */
export const useUploadCCT = () => {
  const { setFile, setColors, setLoading, setError } = useColorStore();

  return useMutation({
    mutationFn: (file) => colorService.uploadCCT(file),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data, file) => {
      setFile(file, data.metadata);
      setColors(data.colors, data.whitePoint);
      setLoading(false);
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error || error.message || 'Erreur upload fichier';
      setError(errorMsg);
      setLoading(false);
    },
  });
};

/**
 * Hook pour calcul des corrections
 * Note: Phase 3 combine analyze + correct en un endpoint
 */
export const useComputeCorrections = () => {
  const { setAnalysis, setCorrectedColors, setLoading, setError } = useColorStore();

  return useMutation({
    mutationFn: ({ colors, deltaWP }) =>
      colorService.computeCorrections(colors, deltaWP),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      // Extraire l'analyse et les corrections
      const { corrections } = data;
      
      // Créer objet analyse pour le panel
      const analysis = {
        whitePointDrift: {
          source: corrections[0]?.bench,
          target: corrections[0]?.newRip,
          deltaE: corrections[0]?.derive?.deltaE || 0,
        },
        colorDeltas: corrections.map(c => ({
          name: c.name,
          deltaE: c.derive?.deltaE || 0,
        })),
        statistics: calculateStatistics(corrections),
      };
      
      setAnalysis(analysis);
      
      // Créer couleurs corrigées avec newRip
      const correctedColors = corrections.map(c => ({
        ...c,
        lab: c.newRip, // newRip devient la nouvelle valeur Lab
      }));
      
      setCorrectedColors(correctedColors);
      setLoading(false);
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error || error.message || 'Erreur calcul corrections';
      setError(errorMsg);
      setLoading(false);
    },
  });
};

/**
 * Hook pour export fichier .cct
 */
export const useExportCCT = () => {
  const { setError } = useColorStore();

  return useMutation({
    mutationFn: ({ sourceXML, colors, deltaWP, fileName }) =>
      colorService.exportCCT(sourceXML, colors, deltaWP),
    onSuccess: (blob, { fileName }) => {
      // Télécharger automatiquement le fichier
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'corrected.cct';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error || error.message || 'Erreur export fichier';
      setError(errorMsg);
    },
  });
};

/**
 * Calcule les statistiques des corrections
 */
function calculateStatistics(corrections) {
  const deltas = corrections
    .map(c => c.derive?.deltaE)
    .filter(d => d !== null && d !== undefined);
  
  if (deltas.length === 0) {
    return {
      totalColors: corrections.length,
      excellent: 0,
      good: 0,
      acceptable: 0,
      poor: 0,
    };
  }

  return {
    totalColors: corrections.length,
    excellent: deltas.filter(d => d < 1.0).length,
    good: deltas.filter(d => d >= 1.0 && d < 2.3).length,
    acceptable: deltas.filter(d => d >= 2.3 && d < 5.0).length,
    poor: deltas.filter(d => d >= 5.0).length,
  };
}
