import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { formatNumber, formatLab, getDeltaSeverity, getSeverityColor, calculateStats } from '../utils/formatters';

const AnalysisPanel = ({ analysis }) => {
  if (!analysis) return null;

  const { whitePointDrift, colorDeltas, statistics } = analysis;
  const wpSeverity = getDeltaSeverity(whitePointDrift.deltaE);
  const wpClass = getSeverityColor(wpSeverity);

  const deltaStats = calculateStats(colorDeltas);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Analyse des dérives
      </h2>

      {/* White Point Drift */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Point Blanc</h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-1">Source</p>
            <p className="font-mono text-xs">{formatLab(whitePointDrift.source)}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Cible</p>
            <p className="font-mono text-xs">{formatLab(whitePointDrift.target)}</p>
          </div>
        </div>

        <div className="mt-3">
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-md ${wpClass}`}>
            {wpSeverity === 'excellent' || wpSeverity === 'good' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="font-semibold">
              ΔE White Point = {formatNumber(whitePointDrift.deltaE, 4)}
            </span>
          </div>
          
          {wpSeverity === 'poor' && (
            <p className="text-sm text-red-600 mt-2">
              ⚠️ Correction recommandée (ΔE &gt; 5.0)
            </p>
          )}
        </div>
      </div>

      {/* Statistiques des couleurs */}
      {deltaStats && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">
            Statistiques ({statistics.totalColors} couleurs)
          </h3>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Min ΔE</p>
              <p className="font-semibold text-lg">{formatNumber(deltaStats.min, 3)}</p>
            </div>
            <div>
              <p className="text-gray-600">Moy ΔE</p>
              <p className="font-semibold text-lg">{formatNumber(deltaStats.avg, 3)}</p>
            </div>
            <div>
              <p className="text-gray-600">Max ΔE</p>
              <p className="font-semibold text-lg">{formatNumber(deltaStats.max, 3)}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-blue-200 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-600">Excellentes (&lt;1.0):</span>
              <span className="ml-2 font-semibold">{statistics.excellent}</span>
            </div>
            <div>
              <span className="text-gray-600">Bonnes (&lt;2.3):</span>
              <span className="ml-2 font-semibold">{statistics.good}</span>
            </div>
            <div>
              <span className="text-gray-600">Acceptables (&lt;5.0):</span>
              <span className="ml-2 font-semibold">{statistics.acceptable}</span>
            </div>
            <div>
              <span className="text-gray-600">Problématiques (≥5.0):</span>
              <span className="ml-2 font-semibold text-red-600">{statistics.poor}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisPanel;
