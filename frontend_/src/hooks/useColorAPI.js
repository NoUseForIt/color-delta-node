import { useMutation, useQueryClient } from '@tanstack/react-query';
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
      setError(error.response?.data?.error || 'Erreur upload fichier');
      setLoading(false);
    },
  });
};

/**
 * Hook pour analyse des couleurs
 */
export const useAnalyzeColors = () => {
  const { setAnalysis, setLoading, setError } = useColorStore();

  return useMutation({
    mutationFn: ({ colors, whitePoint }) =>
      colorService.analyzeColors(colors, whitePoint),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setLoading(false);
    },
    onError: (error) => {
      setError(error.response?.data?.error || 'Erreur analyse couleurs');
      setLoading(false);
    },
  });
};

/**
 * Hook pour correction des couleurs
 */
export const useCorrectColors = () => {
  const { setCorrectedColors, setLoading, setError } = useColorStore();

  return useMutation({
    mutationFn: ({ colors, whitePoint, targetWhitePoint, deltaWP }) =>
      colorService.correctColors(colors, whitePoint, targetWhitePoint, deltaWP),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      setCorrectedColors(data.correctedColors);
      setLoading(false);
    },
    onError: (error) => {
      setError(error.response?.data?.error || 'Erreur correction couleurs');
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
    mutationFn: ({ colors, metadata }) =>
      colorService.exportCCT(colors, metadata),
    onSuccess: (blob, { metadata }) => {
      // Télécharger automatiquement le fichier
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = metadata.fileName || 'corrected.cct';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error) => {
      setError(error.response?.data?.error || 'Erreur export fichier');
    },
  });
};
