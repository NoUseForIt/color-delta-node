import { create } from 'zustand';

/**
 * Store principal de l'application
 * Gère l'état des fichiers, couleurs, analyses et historique
 */
const useColorStore = create((set, get) => ({
  // État du fichier
  currentFile: null,
  fileName: '',
  fileMetadata: null,

  // Couleurs et analyse
  colors: [],
  whitePoint: null,
  analysis: null,
  correctedColors: [],

  // Historique des itérations
  history: [],
  currentIteration: 0,

  // UI State
  isLoading: false,
  error: null,

  // Actions
  setFile: (file, metadata) =>
    set({
      currentFile: file,
      fileName: file.name,
      fileMetadata: metadata,
      error: null,
    }),

  setColors: (colors, whitePoint) =>
    set({
      colors,
      whitePoint,
      analysis: null,
      correctedColors: [],
    }),

  setAnalysis: (analysis) =>
    set({ analysis }),

  setCorrectedColors: (correctedColors) => {
    const { history, currentIteration, colors, whitePoint } = get();
    
    // Ajouter à l'historique
    const newHistory = [
      ...history,
      {
        iteration: currentIteration + 1,
        timestamp: new Date().toISOString(),
        original: colors,
        corrected: correctedColors,
        whitePoint,
        deltaWP: get().analysis?.whitePointDrift?.deltaE,
      },
    ];

    set({
      correctedColors,
      history: newHistory,
      currentIteration: currentIteration + 1,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  reset: () =>
    set({
      currentFile: null,
      fileName: '',
      fileMetadata: null,
      colors: [],
      whitePoint: null,
      analysis: null,
      correctedColors: [],
      history: [],
      currentIteration: 0,
      isLoading: false,
      error: null,
    }),

  // Restaurer une itération depuis l'historique
  restoreIteration: (iterationIndex) => {
    const { history } = get();
    const iteration = history[iterationIndex];
    if (iteration) {
      set({
        colors: iteration.corrected,
        currentIteration: iteration.iteration,
      });
    }
  },
}));

export default useColorStore;
