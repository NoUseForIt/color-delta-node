import { useState, useEffect } from 'react';
import { Download, Zap, AlertCircle } from 'lucide-react';
import useColorStore from '../stores/colorStore';
import { useUploadCCT, useComputeCorrections, useExportCCT } from '../hooks/useColorAPI';
import FileUploader from '../components/FileUploader';
import ColorCard from '../components/ColorCard';
import AnalysisPanel from '../components/AnalysisPanel';
import HistoryPanel from '../components/HistoryPanel';

const ColorDashboard = () => {
  const {
    fileName,
    fileMetadata,
    colors,
    whitePoint,
    analysis,
    correctedColors,
    history,
    isLoading,
    error,
    restoreIteration,
    reset,
  } = useColorStore();

  const uploadMutation = useUploadCCT();
  const computeMutation = useComputeCorrections();
  const exportMutation = useExportCCT();

  const [activeTab, setActiveTab] = useState('original');

  // Auto-compute corrections après upload
  useEffect(() => {
    if (colors.length > 0 && !analysis) {
      computeMutation.mutate({ colors, deltaWP: null });
    }
  }, [colors, analysis]);

  const handleFileSelect = (file) => {
    reset();
    uploadMutation.mutate(file);
  };

  const handleCorrect = () => {
    if (!analysis) return;

    // Calculer deltaWP depuis l'analyse
    const deltaWP = analysis.whitePointDrift.deltaE > 0 ? {
      dL: (analysis.whitePointDrift.target?.L || 0) - (analysis.whitePointDrift.source?.L || 0),
      da: (analysis.whitePointDrift.target?.a || 0) - (analysis.whitePointDrift.source?.a || 0),
      db: (analysis.whitePointDrift.target?.b || 0) - (analysis.whitePointDrift.source?.b || 0),
    } : null;

    computeMutation.mutate({ colors, deltaWP });
  };

  const handleExport = () => {
    const colorsToExport = correctedColors.length > 0 ? correctedColors : colors;
    
    // Calculer deltaWP si corrections appliquées
    const deltaWP = correctedColors.length > 0 && analysis ? {
      dL: (analysis.whitePointDrift.target?.L || 0) - (analysis.whitePointDrift.source?.L || 0),
      da: (analysis.whitePointDrift.target?.a || 0) - (analysis.whitePointDrift.source?.a || 0),
      db: (analysis.whitePointDrift.target?.b || 0) - (analysis.whitePointDrift.source?.b || 0),
    } : null;
    
    exportMutation.mutate({
      sourceXML: fileMetadata?.sourceXML,
      colors: colorsToExport,
      deltaWP,
      fileName: fileName.replace('.cct', '_corrected.cct'),
    });
  };

  const displayedColors = activeTab === 'corrected' && correctedColors.length > 0
    ? correctedColors
    : colors;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Color Delta Tool
          </h1>
          <p className="text-gray-600 mt-1">
            Analyse et correction des dérives colorimétriques
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Erreur</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Upload Section */}
        {colors.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <FileUploader
              onFileSelect={handleFileSelect}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Info + Actions */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {fileName}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {colors.length} couleur{colors.length > 1 ? 's' : ''} chargée{colors.length > 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCorrect}
                    disabled={!analysis || isLoading || (analysis?.whitePointDrift?.deltaE || 0) < 1}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    Corriger
                  </button>

                  <button
                    onClick={handleExport}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Exporter .cct
                  </button>

                  <button
                    onClick={reset}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Nouveau fichier
                  </button>
                </div>
              </div>
            </div>

            {/* Analysis Panel */}
            {analysis && <AnalysisPanel analysis={analysis} />}

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('original')}
                    className={`px-6 py-3 font-medium transition-colors ${
                      activeTab === 'original'
                        ? 'border-b-2 border-primary-600 text-primary-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Couleurs originales ({colors.length})
                  </button>
                  {correctedColors.length > 0 && (
                    <button
                      onClick={() => setActiveTab('corrected')}
                      className={`px-6 py-3 font-medium transition-colors ${
                        activeTab === 'corrected'
                          ? 'border-b-2 border-primary-600 text-primary-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Couleurs corrigées ({correctedColors.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Colors Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedColors.map((color, index) => {
                    const delta = analysis?.colorDeltas?.[index];
                    return (
                      <ColorCard
                        key={index}
                        color={color}
                        showDelta={activeTab === 'original' && !!delta}
                        deltaE={delta?.deltaE}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* History Panel */}
            <HistoryPanel
              history={history}
              onRestore={restoreIteration}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default ColorDashboard;
